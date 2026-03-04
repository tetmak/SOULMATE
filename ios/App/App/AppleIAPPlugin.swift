import Foundation
import Capacitor
import StoreKit

/// NUMERAEL - Apple In-App Purchase Plugin (StoreKit 2)
///
/// PlayBillingPlugin.java ile ayni arayuz:
///   - connect, queryProducts, purchase, restorePurchases, checkStatus
///
/// Urunler:
///   - numerael_premium_monthly  (Aylik abonelik)
///   - numerael_premium_yearly   (Yillik abonelik)
///
@objc(AppleIAPPlugin)
class AppleIAPPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "AppleIAPPlugin"
    let jsName = "AppleIAP"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "connect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "queryProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkStatus", returnType: CAPPluginReturnPromise)
    ]

    private var cachedProducts: [Product] = []
    private var transactionListener: Task<Void, Error>? = nil

    override func load() {
        // Transaction listener baslat - uygulama acikken gelen islemleri yakala
        transactionListener = listenForTransactions()
    }

    deinit {
        transactionListener?.cancel()
    }

    // MARK: - Transaction Listener

    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached { [weak self] in
            for await result in Transaction.updates {
                do {
                    let transaction = try self?.checkVerified(result)
                    if let tx = transaction {
                        await tx.finish()
                        print("[AppleIAP] Transaction update finished: \(tx.productID)")
                    }
                } catch {
                    print("[AppleIAP] Transaction verification failed: \(error)")
                }
            }
        }
    }

    // MARK: - Connect

    @objc func connect(_ call: CAPPluginCall) {
        // StoreKit 2 icin baglanti gerekli degil, hemen resolve et
        call.resolve(["connected": true])
    }

    // MARK: - Query Products

    @objc func queryProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self), !productIds.isEmpty else {
            call.reject("productIds required")
            return
        }

        Task {
            do {
                let products = try await Product.products(for: Set(productIds))
                self.cachedProducts = Array(products)

                var productsArray: [[String: Any]] = []
                for product in products {
                    var p: [String: Any] = [
                        "productId": product.id,
                        "name": product.displayName,
                        "title": product.displayName,
                        "description": product.description,
                        "price": NSDecimalNumber(decimal: product.price).doubleValue,
                        "priceString": product.displayPrice,
                        "currencyCode": product.priceFormatStyle.currencyCode ?? ""
                    ]

                    // Abonelik periyodu
                    if let subscription = product.subscription {
                        let period = subscription.subscriptionPeriod
                        switch period.unit {
                        case .year:
                            p["billingPeriod"] = "P1Y"
                        case .month:
                            p["billingPeriod"] = "P1M"
                        case .week:
                            p["billingPeriod"] = "P1W"
                        case .day:
                            p["billingPeriod"] = "P1D"
                        @unknown default:
                            p["billingPeriod"] = "UNKNOWN"
                        }
                    }

                    // offerToken yok StoreKit 2'de, ama uyumluluk icin bos string gonder
                    p["offerToken"] = ""

                    productsArray.append(p)
                }

                call.resolve(["products": productsArray])

            } catch {
                call.reject("Query products failed: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Purchase

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("productId required")
            return
        }

        // Cached urunlerden bul
        guard let product = cachedProducts.first(where: { $0.id == productId }) else {
            call.reject("Product not found. Call queryProducts first.")
            return
        }

        Task {
            do {
                let result = try await product.purchase()

                switch result {
                case .success(let verification):
                    let transaction = try checkVerified(verification)
                    await transaction.finish()

                    call.resolve([
                        "success": true,
                        "productId": transaction.productID,
                        "purchaseToken": String(transaction.id),
                        "purchaseTime": Int(transaction.purchaseDate.timeIntervalSince1970 * 1000),
                        "isAcknowledged": true,
                        "isAutoRenewing": transaction.expirationDate != nil
                    ])

                case .userCancelled:
                    call.resolve([
                        "success": false,
                        "error": "cancelled"
                    ])

                case .pending:
                    call.resolve([
                        "success": false,
                        "error": "pending"
                    ])

                @unknown default:
                    call.resolve([
                        "success": false,
                        "error": "unknown"
                    ])
                }

            } catch {
                call.resolve([
                    "success": false,
                    "error": error.localizedDescription
                ])
            }
        }
    }

    // MARK: - Restore Purchases

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            var hasPremium = false
            var activePurchases: [[String: Any]] = []

            // Sync ile App Store'dan guncel durum al
            do {
                try await AppStore.sync()
            } catch {
                print("[AppleIAP] AppStore.sync error: \(error)")
            }

            for await result in Transaction.currentEntitlements {
                do {
                    let transaction = try checkVerified(result)

                    if transaction.productType == .autoRenewable {
                        hasPremium = true

                        activePurchases.append([
                            "productId": transaction.productID,
                            "purchaseToken": String(transaction.id),
                            "purchaseTime": Int(transaction.purchaseDate.timeIntervalSince1970 * 1000),
                            "isAutoRenewing": transaction.expirationDate != nil
                        ])
                    }
                } catch {
                    print("[AppleIAP] Restore verification failed: \(error)")
                }
            }

            call.resolve([
                "success": true,
                "premium": hasPremium,
                "purchases": activePurchases
            ])
        }
    }

    // MARK: - Check Status

    @objc func checkStatus(_ call: CAPPluginCall) {
        Task {
            var hasPremium = false
            var activeProductId: String? = nil
            var isAutoRenewing = false

            for await result in Transaction.currentEntitlements {
                do {
                    let transaction = try checkVerified(result)

                    if transaction.productType == .autoRenewable {
                        // Surenin dolup dolmadigini kontrol et
                        if let expirationDate = transaction.expirationDate {
                            if expirationDate > Date() {
                                hasPremium = true
                                activeProductId = transaction.productID
                                isAutoRenewing = true
                                break
                            }
                        } else {
                            // Suresiz (lifetime) — premium
                            hasPremium = true
                            activeProductId = transaction.productID
                            break
                        }
                    }
                } catch {
                    print("[AppleIAP] Status check verification failed: \(error)")
                }
            }

            var result: [String: Any] = [
                "premium": hasPremium,
                "isAutoRenewing": isAutoRenewing
            ]
            if let pid = activeProductId {
                result["productId"] = pid
            }

            call.resolve(result)
        }
    }

    // MARK: - Helper

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let safe):
            return safe
        }
    }
}
