#!/bin/bash

# Build root assets
cd assets
echo "➤➤ Moved to $(pwd) and building JS.";
npm install && npm run build

# Current directory is /assets, Now go to `fly-cart` module.
cd ../includes/modules/fly-cart/assets

# Build `fly-cart` module assets.
echo "➤➤ Moved to $(pwd) and building JS.";
npm install && npm run build

# Now go to `progressive-discount-banner` module.
cd ../../progressive-discount-banner/assets

# Build `progressive-discount-banner` module assets.
echo "➤➤ Moved to $(pwd) and building JS.";
npm install && npm run build

# Now go to `sales-pop` module.
cd ../../sales-pop/assets

# Build `sales-pop` module assets.
echo "➤➤ Moved to $(pwd) and building JS.";
npm install && npm run build

# Now go to `stock-countdown` module.
cd ../../stock-countdown/assets

# Build `stock-countdown` module assets.
echo "➤➤ Moved to $(pwd) and building JS.";
npm install && npm run build

# Now go to `upsell-order-bump` module.
cd ../../upsell-order-bump/assets

# Build `upsell-order-bump` module assets.
echo "➤➤ Moved to $(pwd) and building JS.";
npm install && npm run build

# Now move to root directory.
cd ../../../../
echo "➤➤ Moved to $(pwd) and zipping files.";

# Zip files.
# -x for exclude
zip -r "releases/ultimate-sales-booster-for-woocommerce.zip" ./ -x ".*" \
  -x "bin/*" \
  -x "docs/*" \
  -x "lib/*" \
  -x "releases/*" \
  -x "assets/node_modules/*" \
  -x "includes/modules/fly-cart/assets/node_modules/*" \
  -x "includes/modules/progressive-discount-banner/assets/node_modules/*" \
  -x "includes/modules/sales-pop/assets/node_modules/*" \
  -x "includes/modules/stock-countdown/assets/node_modules/*" \
  -x "includes/modules/upsell-order-bump/assets/node_modules/*"
