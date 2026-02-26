/**
 * One-time migration endpoint — saved_contacts ve usage_counters tablolarını oluşturur.
 * Çalıştıktan sonra bu dosyayı silebilirsin.
 *
 * GET https://soulmate-kohl.vercel.app/api/run-migration
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cxkyyifqxbwidseofbgk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSQL(sql) {
    // Supabase pg-meta endpoint (dashboard SQL editor aynı bunu kullanır)
    var res = await fetch(SUPABASE_URL + '/pg-meta/default/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify({ query: sql })
    });
    var text = await res.text();
    return { status: res.status, body: text };
}

export default async function handler(req, res) {
    if (!SUPABASE_SERVICE_KEY) {
        return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' });
    }

    var results = [];

    // 1. saved_contacts tablosu
    var r1 = await runSQL(`
        CREATE TABLE IF NOT EXISTS saved_contacts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            full_name TEXT NOT NULL,
            birth_date TEXT,
            gender TEXT DEFAULT 'unknown',
            life_path INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_saved_contacts_user ON saved_contacts(user_id);
    `);
    results.push({ step: 'create_saved_contacts', ...r1 });

    // 2. saved_contacts RLS
    var r2 = await runSQL(`
        ALTER TABLE saved_contacts ENABLE ROW LEVEL SECURITY;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_contacts' AND policyname='Users can read own contacts') THEN
                CREATE POLICY "Users can read own contacts" ON saved_contacts FOR SELECT USING (auth.uid() = user_id);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_contacts' AND policyname='Users can insert own contacts') THEN
                CREATE POLICY "Users can insert own contacts" ON saved_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_contacts' AND policyname='Users can delete own contacts') THEN
                CREATE POLICY "Users can delete own contacts" ON saved_contacts FOR DELETE USING (auth.uid() = user_id);
            END IF;
        END $$;
    `);
    results.push({ step: 'saved_contacts_rls', ...r2 });

    // 3. usage_counters tablosu
    var r3 = await runSQL(`
        CREATE TABLE IF NOT EXISTS usage_counters (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            feature TEXT NOT NULL,
            period TEXT NOT NULL,
            count INTEGER DEFAULT 0,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_unique ON usage_counters(user_id, feature, period);
    `);
    results.push({ step: 'create_usage_counters', ...r3 });

    // 4. usage_counters RLS
    var r4 = await runSQL(`
        ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usage_counters' AND policyname='Users can read own usage') THEN
                CREATE POLICY "Users can read own usage" ON usage_counters FOR SELECT USING (auth.uid() = user_id);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usage_counters' AND policyname='Users can insert own usage') THEN
                CREATE POLICY "Users can insert own usage" ON usage_counters FOR INSERT WITH CHECK (auth.uid() = user_id);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='usage_counters' AND policyname='Users can update own usage') THEN
                CREATE POLICY "Users can update own usage" ON usage_counters FOR UPDATE USING (auth.uid() = user_id);
            END IF;
        END $$;
    `);
    results.push({ step: 'usage_counters_rls', ...r4 });

    return res.status(200).json({ message: 'Migration completed', results });
}
