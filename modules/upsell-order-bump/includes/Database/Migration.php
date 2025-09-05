<?php

namespace StorePulse\StoreGrowth\Modules\UpsellOrderBump\Database;

/**
 * Database migration for order bumps.
 *
 * @since 2.0.0
 */
class Migration {

    /**
     * Table name constant.
     *
     * @since 2.0.0
     */
    const TABLE_NAME = 'spsg_order_bumps';

    /**
     * Run the migration.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public static function run_migration(): void {
        self::create_table();
    }

    /**
     * Create the order bumps table.
     *
     * @since 2.0.0
     *
     * @return void
     */
    private static function create_table(): void {
        global $wpdb;

        $table_name = $wpdb->prefix . self::TABLE_NAME;

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'active',
            target_type varchar(50) NOT NULL DEFAULT 'products',
            target_products TEXT DEFAULT NULL,
            target_categories TEXT DEFAULT NULL,
            offer_product_id bigint(20) unsigned NOT NULL,
            offer_type varchar(50) NOT NULL DEFAULT 'percentage',
            offer_amount decimal(10,2) NOT NULL DEFAULT 0.00,
            offer_discount_title varchar(255) NOT NULL DEFAULT '',
            design_settings TEXT DEFAULT NULL,
            created_by bigint(20) unsigned DEFAULT NULL,
            updated_by bigint(20) unsigned DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY target_type (target_type),
            KEY offer_product_id (offer_product_id),
            KEY created_by (created_by),
            KEY updated_by (updated_by)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    /**
     * Drop the order bumps table.
     *
     * @since 2.0.0
     *
     * @return void
     */
    public static function drop_table(): void {
        global $wpdb;

        $table_name = $wpdb->prefix . self::TABLE_NAME;
        $wpdb->query("DROP TABLE IF EXISTS $table_name");
    }

    /**
     * Check if the table exists.
     *
     * @since 2.0.0
     *
     * @return bool
     */
    public static function table_exists(): bool {
        global $wpdb;

        $table_name = $wpdb->prefix . self::TABLE_NAME;
        $result = $wpdb->get_var($wpdb->prepare(
            "SHOW TABLES LIKE %s",
            $table_name
        ));

        return $result === $table_name;
    }
}
