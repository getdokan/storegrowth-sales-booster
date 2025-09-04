<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Validators;

use StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database\OrderBumpData;

class BumpOfferValidator {
    private $orderBumpData;

    public function __construct(OrderBumpData $orderBumpData) {
        $this->orderBumpData = $orderBumpData;
    }

    public function validateBumpOffersAfterRemoval(array $removedItemIds): void {
        $bumpList = $this->orderBumpData->get_all(['status' => 'active']);

        foreach ($bumpList as $bump) {
            $bumpType = $bump['target_type'];
            $offerProductId = $bump['offer_product_id'];

            $wasTarget = $this->wasTargetProduct($bump, $removedItemIds);

            if ($wasTarget) {
                $remainingTargets = $this->getRemainingTargetProducts($bump, $bumpType);

                if (empty($remainingTargets)) {
                    $this->handleOrphanedBumpProduct($offerProductId);
                }
            }
        }
    }

    private function wasTargetProduct(array $bump, array $removedItemIds): bool {
        if ($bump['target_type'] === 'products') {
            return !empty(array_intersect($removedItemIds, $bump['target_products']));
        } else {
            foreach ($removedItemIds as $removedItemId) {
                $removedProductCategories = wp_get_post_terms($removedItemId, 'product_cat', ['fields' => 'ids']);
                if (!empty(array_intersect($removedProductCategories, $bump['target_categories']))) {
                    return true;
                }
            }
        }
        return false;
    }

    private function getRemainingTargetProducts(array $bump, string $bumpType): array {
        $cart = WC()->cart;
        $remainingTargets = [];

        foreach ($cart->get_cart() as $cartItem) {
            $cartProductId = $cartItem['product_id'];
            $cartVariationId = $cartItem['variation_id'] ?? 0;
            $cartItemIds = [$cartProductId];
            if ($cartVariationId > 0) {
                $cartItemIds[] = $cartVariationId;
            }

            if ($bumpType === 'products') {
                if (!empty(array_intersect($cartItemIds, $bump['target_products']))) {
                    $remainingTargets = array_merge($remainingTargets, $cartItemIds);
                }
            } else {
                $cartCategories = wp_get_post_terms($cartProductId, 'product_cat', ['fields' => 'ids']);
                if (!empty(array_intersect($cartCategories, $bump['target_categories']))) {
                    $remainingTargets = array_merge($remainingTargets, $cartItemIds);
                }
            }
        }

        return $remainingTargets;
    }

    private function handleOrphanedBumpProduct(int $offerProductId): void {
        $cart = WC()->cart;

        foreach ($cart->get_cart() as $cartItemKey => $cartItem) {
            $cartProductId = $cartItem['product_id'];
            $cartVariationId = $cartItem['variation_id'] ?? 0;
            $cartItemId = $cartVariationId > 0 ? $cartVariationId : $cartProductId;

            if ($cartItemId == $offerProductId && isset($cartItem['custom_price'])) {
                $cart->remove_cart_item($cartItemKey);
            }
        }
    }
}
