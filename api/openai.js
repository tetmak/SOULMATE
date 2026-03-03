/**
 * NUMERAEL - OpenAI Proxy (Hardened)
 * Auth required, rate limited, crisis detection, prompt injection protection.
 */

import { handleCors } from "./_lib/cors.js";
import { verifyAuth, requireAuth } from "./_lib/auth.js";
import { checkRateLimit, getClientIP } from "./_lib/rate-limit.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";
import { sanitizeText } from "./_lib/validate.js";
import { detectCrisis } from "./_lib/crisis.js";

// Constants
const ALLOWED_MODEL = "gpt-4o-mini";
const MAX_TOKENS_CAP = 500;
const FREE_DAILY_LIMIT = 50;
const PREMIUM_DAILY_LIMIT = 200;
const IP_DAILY_LIMIT = 100;
const DAY_IN_SECONDS = 86400;

async function isPremiumUser(userId) {
    try {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
            .from("subscriptions")
            .select("status, expires_at")
            .eq("user_id", userId)
            .eq("status", "active")
            .single();
        if (!data) return false;
        if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
        return true;
    } catch (e) {
        return false;
    }
}
function sanitizeMessages(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return null;
    }
    const sanitized = [];
    for (const msg of messages) {
        if (!msg || typeof msg !== "object") continue;
        if (typeof msg.content !== "string") continue;
        if (typeof msg.role !== "string") continue;
        // Strip system messages from client
        if (msg.role === "system") continue;
        // Only allow user and assistant roles
        if (msg.role !== "user" && msg.role !== "assistant") continue;
        // Sanitize content (max 4000 chars per message)
        const content = sanitizeText(msg.content, 4000);
        if (!content) continue;
        sanitized.push({ role: msg.role, content: content });
    }
    return sanitized.length > 0 ? sanitized : null;
}

function getServerSystemMessage(clientBody) {
    let systemContent = "You are the Numerology Master of the Numantic app. " +
        "You have deep wisdom about numbers, cosmic connections and spiritual meanings. " +
        "Write concisely and impactfully in a mystical, personal tone. " +
        "No repetition. Only write the requested text, no titles or explanations.";
    if (clientBody && Array.isArray(clientBody.messages)) {
        for (const msg of clientBody.messages) {
            if (msg && msg.role === "system" && typeof msg.content === "string") {
                const cleaned = sanitizeText(msg.content, 2000);
                if (cleaned) {
                    systemContent = cleaned;
                }
                break;
            }
        }
    }
    return { role: "system", content: systemContent };
}
function sanitizeOutput(data) {
    if (!data || !data.choices) return data;
    for (const choice of data.choices) {
        if (choice && choice.message && typeof choice.message.content === "string") {
            choice.message.content = choice.message.content
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<[^>]*>/g, "");
        }
    }
    return data;
}

async function logUsage(userId, tokensInput, tokensOutput, model, feature) {
    try {
        const supabase = getSupabaseAdmin();
        await supabase.from("ai_usage").insert({
            user_id: userId,
            tokens_input: tokensInput || 0,
            tokens_output: tokensOutput || 0,
            model: model || ALLOWED_MODEL,
            feature: feature || "chat"
        });
    } catch (e) {
        console.error("[AI Usage] Log failed:", e.message);
    }
}
export default async function handler(req, res) {
    // 1. CORS
    if (handleCors(req, res)) return;

    // 2. Method check
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 3. Auth verification
    const authResult = await verifyAuth(req);
    if (!requireAuth(authResult, res)) return;

    const userId = authResult.userId;

    // 4. Rate limiting - user-based
    const premium = await isPremiumUser(userId);
    const userLimit = premium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const userRateCheck = checkRateLimit("ai:" + userId, userLimit, DAY_IN_SECONDS);
    if (!userRateCheck.allowed) {
        return res.status(429).json({
            error: "rate_limit_exceeded",
            message: premium
                ? "G\u00fcnl\u00fck AI limiti a\u015f\u0131ld\u0131 (200 istek). Yar\u0131n tekrar dene."
                : "G\u00fcnl\u00fck AI limiti a\u015f\u0131ld\u0131. Premium ile limiti art\u0131r.",
            remaining: 0,
            resetAt: userRateCheck.resetAt
        });
    }

    // 5. Rate limiting - IP-based secondary
    const clientIP = getClientIP(req);
    const ipRateCheck = checkRateLimit("ai-ip:" + clientIP, IP_DAILY_LIMIT, DAY_IN_SECONDS);
    if (!ipRateCheck.allowed) {
        return res.status(429).json({
            error: "rate_limit_exceeded",
            message: "IP bazl\u0131 g\u00fcnl\u00fck limit a\u015f\u0131ld\u0131.",
            remaining: 0,
            resetAt: ipRateCheck.resetAt
        });
    }
    // 6. Validate request body
    const body = req.body;
    if (!body || !body.messages) {
        return res.status(400).json({ error: "messages array required" });
    }

    // 7. Crisis detection on all user messages
    if (Array.isArray(body.messages)) {
        for (const msg of body.messages) {
            if (msg && msg.role === "user" && typeof msg.content === "string") {
                const crisisCheck = detectCrisis(msg.content);
                if (crisisCheck.isCrisis) {
                    return res.status(200).json({
                        choices: [{
                            message: { role: "assistant", content: crisisCheck.response },
                            finish_reason: "stop"
                        }],
                        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
                        _crisis_intercepted: true
                    });
                }
            }
        }
    }

    // 8. Build server-controlled system message
    const systemMessage = getServerSystemMessage(body);

    // 9. Sanitize user/assistant messages
    const sanitizedMessages = sanitizeMessages(body.messages);
    if (!sanitizedMessages) {
        return res.status(400).json({ error: "Invalid messages format" });
    }

    // 10. Build final messages array
    const finalMessages = [systemMessage, ...sanitizedMessages];

    // 11. Force model and cap max_tokens
    const maxTokens = Math.min(
        parseInt(body.max_tokens, 10) || MAX_TOKENS_CAP,
        MAX_TOKENS_CAP
    );
    // 12. Call OpenAI
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API key not configured" });
        }

        const openaiPayload = {
            model: ALLOWED_MODEL,
            messages: finalMessages,
            max_tokens: maxTokens
        };

        // Pass through safe parameters only
        if (typeof body.temperature === "number" && body.temperature >= 0 && body.temperature <= 2) {
            openaiPayload.temperature = body.temperature;
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify(openaiPayload)
        });

        const data = await response.json();

        // 13. Log usage to ai_usage table
        if (data.usage) {
            const feature = body._feature || "chat";
            logUsage(
                userId,
                data.usage.prompt_tokens,
                data.usage.completion_tokens,
                ALLOWED_MODEL,
                feature
            );
        }

        // 14. Sanitize output
        const safeData = sanitizeOutput(data);

        return res.status(response.status).json(safeData);
    } catch (error) {
        console.error("[OpenAI] Request failed:", error.message);
        return res.status(500).json({ error: "AI service temporarily unavailable" });
    }
}
