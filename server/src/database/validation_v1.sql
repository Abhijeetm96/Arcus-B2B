-- ============================================================================
-- ARCUS Database Migration Validation: V1 Assertions
-- Objectives: Verify zero-loss record transfers, schema scale, and integrity
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Test 1: Record Count Assertions
-- Description: Asserts that total users matches mapped profile entities.
-- ----------------------------------------------------------------------------
SELECT 
    (SELECT COUNT(*) FROM users) AS total_auth_identities,
    (SELECT COUNT(*) FROM individual_profiles) AS individual_profiles_count,
    (SELECT COUNT(*) FROM business_profiles) AS business_profiles_count,
    (SELECT COUNT(*) FROM professional_profiles) AS professional_profiles_count;

-- ----------------------------------------------------------------------------
-- Test 2: Product Catalog & Variant Alignments
-- Description: Verifies that every product has at least one SKU variant and inventory entry.
-- ----------------------------------------------------------------------------
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    COUNT(v.id) AS variant_count,
    COUNT(i.variant_id) AS inventory_registered
FROM products p
LEFT JOIN product_variants v ON p.id = v.product_id
LEFT JOIN inventory i ON v.id = i.variant_id
GROUP BY p.id, p.name
HAVING COUNT(v.id) = 0 OR COUNT(i.variant_id) = 0;
-- EXPECTED: 0 rows returned (All products must map to a variant and inventory).

-- ----------------------------------------------------------------------------
-- Test 3: Price Tier Mapping Auditing
-- Description: Asserts that the count of price tiers in the new table matches 
-- the elements in the legacy products JSONB price_tiers array.
-- ----------------------------------------------------------------------------
SELECT 
    p.id AS product_id,
    jsonb_array_length(p.price_tiers) AS expected_tiers_count,
    COUNT(t.id) AS actual_tiers_count
FROM products p
LEFT JOIN product_price_tiers t ON p.id = t.variant_id
GROUP BY p.id, p.price_tiers
HAVING jsonb_array_length(p.price_tiers) != COUNT(t.id);
-- EXPECTED: 0 rows returned (All JSONB price tiers must be fully normalized).

-- ----------------------------------------------------------------------------
-- Test 4: BuildPoints Balance Audit
-- Description: Verifies that the wallet balance equals the sum of ledger history.
-- ----------------------------------------------------------------------------
SELECT 
    w.user_id,
    w.balance AS cached_wallet_balance,
    COALESCE(SUM(l.points), 0) AS calculated_ledger_sum
FROM buildpoints_wallets w
LEFT JOIN buildpoints_ledger l ON w.user_id = l.wallet_user_id
GROUP BY w.user_id, w.balance
HAVING w.balance != COALESCE(SUM(l.points), 0);
-- EXPECTED: 0 rows returned (Ledger details must sum to the wallet balance).

-- ----------------------------------------------------------------------------
-- Test 5: Order Value Validation
-- Description: For newly created orders, asserts that the main order total matches
-- the sum of the normalized order_items lines.
-- ----------------------------------------------------------------------------
SELECT 
    o.id AS order_id,
    o.total_amount AS order_amount,
    SUM(oi.total_amount) AS items_amount_sum
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total_amount
HAVING ABS(o.total_amount - SUM(oi.total_amount)) > 0.01;
-- EXPECTED: 0 rows returned (No rounding or value leaks in order line calculations).
