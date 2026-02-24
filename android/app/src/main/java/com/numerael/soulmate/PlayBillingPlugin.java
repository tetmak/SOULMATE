package com.numerael.soulmate;

import android.util.Log;
import androidx.annotation.NonNull;

import com.android.billingclient.api.*;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {

    private static final String TAG = "PlayBilling";
    private BillingClient billingClient;
    private List<ProductDetails> cachedProducts = new ArrayList<>();
    private PluginCall pendingPurchaseCall = null;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases()
            .build();
    }

    // ─── CONNECT ─────────────────────────────────────────────
    @PluginMethod()
    public void connect(PluginCall call) {
        if (billingClient.isReady()) {
            JSObject ret = new JSObject();
            ret.put("connected", true);
            call.resolve(ret);
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "BillingClient connected");
                    JSObject ret = new JSObject();
                    ret.put("connected", true);
                    call.resolve(ret);
                } else {
                    call.reject("Connection failed: " + result.getDebugMessage(),
                        String.valueOf(result.getResponseCode()));
                }
            }
            @Override
            public void onBillingServiceDisconnected() {
                Log.w(TAG, "BillingClient disconnected");
            }
        });
    }

    // ─── QUERY PRODUCTS ──────────────────────────────────────
    @PluginMethod()
    public void queryProducts(PluginCall call) {
        ensureConnected(call, () -> {
            JSArray productIds = call.getArray("productIds");
            if (productIds == null || productIds.length() == 0) {
                call.reject("productIds required");
                return;
            }

            List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
            for (int i = 0; i < productIds.length(); i++) {
                try {
                    productList.add(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productIds.getString(i))
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build());
                } catch (Exception e) {
                    Log.w(TAG, "Invalid product ID at index " + i);
                }
            }

            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

            billingClient.queryProductDetailsAsync(params, (billingResult, list) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && list != null) {
                    cachedProducts.clear();
                    cachedProducts.addAll(list);

                    JSArray products = new JSArray();
                    for (ProductDetails pd : list) {
                        JSObject p = new JSObject();
                        p.put("productId", pd.getProductId());
                        p.put("name", pd.getName());
                        p.put("title", pd.getTitle());
                        p.put("description", pd.getDescription());

                        List<ProductDetails.SubscriptionOfferDetails> offers =
                            pd.getSubscriptionOfferDetails();
                        if (offers != null && !offers.isEmpty()) {
                            ProductDetails.SubscriptionOfferDetails offer = offers.get(0);
                            List<ProductDetails.PricingPhase> phases =
                                offer.getPricingPhases().getPricingPhaseList();
                            if (!phases.isEmpty()) {
                                ProductDetails.PricingPhase phase = phases.get(phases.size() - 1);
                                p.put("price", phase.getPriceAmountMicros() / 1_000_000.0);
                                p.put("priceString", phase.getFormattedPrice());
                                p.put("currencyCode", phase.getPriceCurrencyCode());
                                p.put("billingPeriod", phase.getBillingPeriod());
                            }
                            p.put("offerToken", offer.getOfferToken());
                        }
                        products.put(p);
                    }

                    JSObject ret = new JSObject();
                    ret.put("products", products);
                    call.resolve(ret);
                } else {
                    call.reject("Query failed: " + billingResult.getDebugMessage());
                }
            });
        });
    }

    // ─── PURCHASE ────────────────────────────────────────────
    @PluginMethod()
    public void purchase(PluginCall call) {
        ensureConnected(call, () -> {
            String productId = call.getString("productId");
            if (productId == null) {
                call.reject("productId required");
                return;
            }

            // Cached ürünlerden bul
            ProductDetails target = null;
            for (ProductDetails pd : cachedProducts) {
                if (pd.getProductId().equals(productId)) {
                    target = pd;
                    break;
                }
            }

            if (target == null) {
                call.reject("Product not found. Call queryProducts first.");
                return;
            }

            List<ProductDetails.SubscriptionOfferDetails> offers =
                target.getSubscriptionOfferDetails();
            if (offers == null || offers.isEmpty()) {
                call.reject("No subscription offers available");
                return;
            }

            String offerToken = call.getString("offerToken", offers.get(0).getOfferToken());

            BillingFlowParams.ProductDetailsParams pdParams =
                BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(target)
                    .setOfferToken(offerToken)
                    .build();

            BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(pdParams))
                .build();

            pendingPurchaseCall = call;

            BillingResult result = billingClient.launchBillingFlow(getActivity(), flowParams);
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                pendingPurchaseCall = null;
                call.reject("Launch billing flow failed: " + result.getDebugMessage());
            }
            // Sonuç onPurchasesUpdated callback ile gelir
        });
    }

    // ─── PurchasesUpdatedListener ────────────────────────────
    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult,
                                    List<Purchase> purchases) {
        if (pendingPurchaseCall == null) return;

        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;

        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK
            && purchases != null && !purchases.isEmpty()) {

            Purchase purchase = purchases.get(0);

            // ACKNOWLEDGE hemen çağır (3 gün içinde yapılmazsa Google iade eder)
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED
                && !purchase.isAcknowledged()) {
                AcknowledgePurchaseParams ackParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.getPurchaseToken())
                    .build();
                billingClient.acknowledgePurchase(ackParams, ackResult -> {
                    Log.d(TAG, "Acknowledge result: " + ackResult.getResponseCode());
                });
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("productId", purchase.getProducts().get(0));
            ret.put("purchaseToken", purchase.getPurchaseToken());
            ret.put("purchaseTime", purchase.getPurchaseTime());
            ret.put("isAcknowledged", purchase.isAcknowledged());
            ret.put("isAutoRenewing", purchase.isAutoRenewing());
            call.resolve(ret);

        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("error", "cancelled");
            call.resolve(ret);

        } else {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("error", billingResult.getDebugMessage());
            call.resolve(ret);
        }
    }

    // ─── RESTORE / QUERY PURCHASES ──────────────────────────
    @PluginMethod()
    public void restorePurchases(PluginCall call) {
        ensureConnected(call, () -> {
            billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build(),
                (billingResult, purchases) -> {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        JSArray activePurchases = new JSArray();
                        boolean hasPremium = false;

                        for (Purchase p : purchases) {
                            if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                                hasPremium = true;

                                // Acknowledge edilmemişse et
                                if (!p.isAcknowledged()) {
                                    AcknowledgePurchaseParams ackParams =
                                        AcknowledgePurchaseParams.newBuilder()
                                            .setPurchaseToken(p.getPurchaseToken())
                                            .build();
                                    billingClient.acknowledgePurchase(ackParams, r -> {});
                                }

                                JSObject purchase = new JSObject();
                                purchase.put("productId", p.getProducts().get(0));
                                purchase.put("purchaseToken", p.getPurchaseToken());
                                purchase.put("purchaseTime", p.getPurchaseTime());
                                purchase.put("isAutoRenewing", p.isAutoRenewing());
                                activePurchases.put(purchase);
                            }
                        }

                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("premium", hasPremium);
                        ret.put("purchases", activePurchases);
                        call.resolve(ret);
                    } else {
                        call.reject("Query purchases failed: " + billingResult.getDebugMessage());
                    }
                }
            );
        });
    }

    // ─── CHECK STATUS ────────────────────────────────────────
    @PluginMethod()
    public void checkStatus(PluginCall call) {
        ensureConnected(call, () -> {
            billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build(),
                (billingResult, purchases) -> {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        boolean hasPremium = false;
                        String activeProductId = null;
                        boolean isAutoRenewing = false;

                        for (Purchase p : purchases) {
                            if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                                hasPremium = true;
                                activeProductId = p.getProducts().get(0);
                                isAutoRenewing = p.isAutoRenewing();

                                // Acknowledge edilmemişse et
                                if (!p.isAcknowledged()) {
                                    AcknowledgePurchaseParams ackParams =
                                        AcknowledgePurchaseParams.newBuilder()
                                            .setPurchaseToken(p.getPurchaseToken())
                                            .build();
                                    billingClient.acknowledgePurchase(ackParams, r -> {});
                                }
                                break;
                            }
                        }

                        JSObject ret = new JSObject();
                        ret.put("premium", hasPremium);
                        ret.put("productId", activeProductId);
                        ret.put("isAutoRenewing", isAutoRenewing);
                        call.resolve(ret);
                    } else {
                        JSObject ret = new JSObject();
                        ret.put("premium", false);
                        call.resolve(ret);
                    }
                }
            );
        });
    }

    // ─── HELPER: bağlantı kontrolü ──────────────────────────
    private void ensureConnected(PluginCall call, Runnable action) {
        if (billingClient.isReady()) {
            action.run();
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    action.run();
                } else {
                    call.reject("BillingClient not ready: " + result.getDebugMessage());
                }
            }
            @Override
            public void onBillingServiceDisconnected() {
                Log.w(TAG, "Billing disconnected");
            }
        });
    }
}
