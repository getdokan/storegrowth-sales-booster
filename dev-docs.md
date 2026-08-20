
# Storegrowth Sales-Booster (Lite)- Developer Instruction

StoreGrowth is a conversion-boosting toolkit to help you optimize your sales campaigns for the best results. It offers you 10+ powerful marketing modules in one place, so you don’t need to use multiple plugins to increase sales.

- It is lightweight and easy to use.
- It is standalone with no page builder dependency.
- Compatible with all popular WordPress themes.

The best part is, that each module on the StoreGrowth is powerful alone, and together you can enjoy significant growth in your WooCommerce store.

StoreGrowth is specially built for WooCommerce marketers who are looking for a complete and easy-to-use solution to increase conversions.


## Plugin Details

- **Plugin Name**: StoreGrowth - Sales Booster
- **Version**: 1.28.8
- **Type**: WordPress Plugin
- **Contributors**: Invizo
- **Requires at least**: WordPress 5.4
- **Tested up to**: WordPress 6.4
- **Requires PHP**: 7.4
- **License**: GPLv2 or later
- **License URI**: [GPLv2 License](https://www.gnu.org/licenses/gpl-2.0.html)
## Installation

To install and set up the `storegrowth-sales-booster` plugin, follow these steps:

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Invizo/storegrowth-sales-booster.git
    cd storegrowth-sales-booster
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Build Assets**:
    ```bash
    npm run build
    ```

4. **Set Up Local WordPress Environment**:
    - Use a tool like Local by Flywheel, Vagrant, or Docker to set up a local WordPress instance.
    - Configure your local WordPress site to point to the plugin directory.

5. **Activate the Plugin**:
    - Go to the WordPress admin panel.
    - Navigate to Plugins > Installed Plugins.
    - Activate the StoreGrowth - Sales Booster plugin.


## Minimum System Requirements

### WordPress

- **WordPress Version**: 5.6 or higher
- **PHP Version**: 7.4 or higher
- **MySQL Version**: 5.6 or higher (or MariaDB version 10.1 or higher)

### Server

- **Operating System**: Linux-based OS (recommended) or Windows OS
- **Web Server**: Apache or Nginx (with mod_rewrite module enabled)
- **Memory**: At least 128 MB of PHP memory (256 MB or more recommended)

### Development Tools

- **Node.js**: Version 14.x or higher (18.7 recommended)
- **npm**: Version 6.x or higher
- **Composer**: Latest version

## Coding Standards

- Follow the [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/).
- Use [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer) with the WordPress coding standards:
    ```bash
    composer require --dev wp-coding-standards/wpcs
    vendor/bin/phpcs --config-set installed_paths vendor/wp-coding-standards/wpcs
    vendor/bin/phpcs --standard=WordPress path/to/your/plugin
    ```

## Troubleshooting

If you encounter issues during development, consider the following:

- Verify that all system requirements are met.
- Check for errors in the browser console or server logs.
- Use `WP_DEBUG` mode in WordPress to display detailed error messages:
    ```php
    define('WP_DEBUG', true);
    define('WP_DEBUG_LOG', true);
    define('WP_DEBUG_DISPLAY', false);
    ```
## Development

### Composer Autoload Configuration

This project uses Composer for autoloading PHP classes following the PSR-4 standard and includes additional files for global functions.

```json
{
  "name": "invizo/storegrowth",
  "autoload": {
    "psr-4": {
      "STOREGROWTH\\SPSB\\": "Includes/"
    },
    "files": [ "Includes/functions.php" ]
  },
  "authors": [
    {
      "name": "Invizo",
      "email": "info@invizo.io"
    }
  ]
}
```

### Lerna Configuration

This section provides documentation for the Lerna configuration used in the `storegrowth-sales-booster` project. Lerna is a tool for managing JavaScript projects with multiple packages, optimizing workflows, and handling dependencies efficiently.

***Lerna Configuration File:*** `lerna.json`

The `lerna.json` file contains the configuration settings for Lerna. Below is the provided configuration:

```json
{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "version": "1.0.0",
  "npmClient": "npm",
  "packages": [
    "assets",
    "Includes/Modules/*/assets"
  ]
}
```

### Scripts

The `package.json` includes several scripts to streamline development:

- **Start Development Server**:
    ```bash
    npm run start
    ```

**Notice**: The development server uses Lerna to run the start script for all packages. Ensure you have configured the Lerna workspaces correctly and all dependencies are properly installed before running this command. (This script is not recomended on low end device)

- **Build All Packages**:
    ```bash
    npm run build
    ```

- **Watch Specific Packages**:
    ```bash
    npm run watch:sales-booster
    npm run watch:sales-countdown
    npm run watch:direct-checkout
    npm run watch:quick-cart
    npm run watch:free-shipping-bar
    npm run watch:floating-notification-bar
    npm run watch:sales-notification
    npm run watch:stock-bar
    npm run watch:upsell-order-bump
    npm run watch:bogo
    npm run watch:quick-view
    npm run watch:fbt
    ```

- **Build Specific Packages**:
    ```bash
    npm run build:sales-booster
    npm run build:sales-countdown
    npm run build:direct-checkout
    npm run build:quick-cart
    npm run build:free-shipping-bar
    npm run build:floating-notification-bar
    npm run build:sales-pop
    npm run build:stock-bar
    npm run build:upsell-order-bump
    npm run build:bogo
    npm run build:fbt
    npm run build:quick-view
    ```

- **Create Archive for Release**:
    ```bash
    npm run release
    ```


### Workspaces

This project uses Yarn Workspaces to manage multiple packages:

- **Packages Directory**:
    - `assets`
    - `Includes/Modules/*/assets`

### Dependencies

- **Development Dependencies**:
    - `archiver`: ^6.0.1
    - `fs`: ^0.0.1-security
    - `jszip`: ^3.10.1
    - `lerna`: ^7.2.0

- **Runtime Dependencies**:
    - `colorette`: ^2.0.20
## GitHub Actions: Deploy to WordPress.org

This section provides documentation for the GitHub Actions workflow used to deploy the `storegrowth-sales-booster` plugin to WordPress.org. The workflow triggers on pushes to the `master` branch and tags, builds the project, and then deploys it to the WordPress plugin repository.

### Workflow Configuration

```yaml
name: Deploy to WordPress.org
on:
  push:
    tags:
      - '*'
    branches:
      - master
jobs:
  deploy-plugin:
    name: Deploy Plugin
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - name: Build
        run: |
          composer install
          composer dump-autoload
          npm install
          npm run build
      - name: WordPress Plugin Deploy
        uses: 10up/action-wordpress-plugin-deploy@stable
        env:
          SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
          SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
          SLUG: storegrowth-sales-booster
          VERSION: 1.28.8