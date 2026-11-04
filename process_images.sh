#!/bin/bash
set -e
mkdir -p public/images/products

TSHIRT=$(ls -1 /src/assets/images/prod_master_tshirt_*.jpg | head -n 1)
PANTS=$(ls -1 /src/assets/images/prod_master_pantalon_*.jpg | head -n 1)
DRESS=$(ls -1 /src/assets/images/prod_master_vestido_*.jpg | head -n 1)
ACTIVE=$(ls -1 /src/assets/images/prod_master_activewear_*.jpg | head -n 1)
SUNGLASSES=$(ls -1 /src/assets/images/prod_master_sunglasses_*.jpg | head -n 1)
LOAFERS=$(ls -1 /src/assets/images/prod_master_loafers_*.jpg | head -n 1)

# 1. Sneakers (3 colors)
convert public/images/product_sneakers.jpg -resize '900x>' -quality 80 public/images/products/sneakers-lavanda.jpg
convert public/images/product_sneakers.jpg -resize '900x>' -modulate 125,20,100 -quality 80 public/images/products/sneakers-blanco.jpg
convert public/images/product_sneakers.jpg -resize '900x>' -modulate 60,30,100 -quality 80 public/images/products/sneakers-obsidiana.jpg

# 2. Blazer (2 colors)
convert public/images/product_jacket.jpg -resize '900x>' -quality 80 public/images/products/blazer-morado.jpg
convert public/images/product_jacket.jpg -resize '900x>' -modulate 65,15,100 -quality 80 public/images/products/blazer-negro.jpg

# 3. Bolso (2 colors)
convert public/images/product_bag.jpg -resize '900x>' -quality 80 public/images/products/bolso-ciruela.jpg
convert public/images/product_bag.jpg -resize '900x>' -modulate 60,10,100 -quality 80 public/images/products/bolso-negro.jpg

# 4. Camiseta (3 colors)
convert "$TSHIRT" -resize '900x>' -quality 80 public/images/products/camiseta-lavanda.jpg
convert "$TSHIRT" -resize '900x>' -modulate 120,10,100 -quality 80 public/images/products/camiseta-blanco.jpg
convert "$TSHIRT" -resize '900x>' -modulate 65,15,100 -quality 80 public/images/products/camiseta-grafito.jpg

# 5. Pantalon (3 colors)
convert "$PANTS" -resize '900x>' -quality 80 public/images/products/pantalon-violeta.jpg
convert "$PANTS" -resize '900x>' -modulate 65,10,100 -quality 80 public/images/products/pantalon-negro.jpg
convert "$PANTS" -resize '900x>' -modulate 115,20,100 -quality 80 public/images/products/pantalon-gris.jpg

# 6. Vestido (3 colors)
convert "$DRESS" -resize '900x>' -quality 80 public/images/products/vestido-lavanda.jpg
convert "$DRESS" -resize '900x>' -modulate 90,140,95 -quality 80 public/images/products/vestido-morado.jpg
convert "$DRESS" -resize '900x>' -modulate 55,20,100 -quality 80 public/images/products/vestido-negro.jpg

# 7. Set Deportivo (3 colors)
convert "$ACTIVE" -resize '900x>' -quality 80 public/images/products/set-morado.jpg
convert "$ACTIVE" -resize '900x>' -modulate 120,60,100 -quality 80 public/images/products/set-lavanda.jpg
convert "$ACTIVE" -resize '900x>' -modulate 60,15,100 -quality 80 public/images/products/set-gris.jpg

# 8. Gafas (2 colors)
convert "$SUNGLASSES" -resize '900x>' -quality 80 public/images/products/gafas-gunmetal.jpg
convert "$SUNGLASSES" -resize '900x>' -modulate 110,60,70 -quality 80 public/images/products/gafas-dorado.jpg

# 9. Mocasines (2 colors)
convert "$LOAFERS" -resize '900x>' -quality 80 public/images/products/mocasines-negro.jpg
convert "$LOAFERS" -resize '900x>' -modulate 85,120,110 -quality 80 public/images/products/mocasines-morado.jpg

rm -rf /src/assets/images /src/assets
rm -f process_images.sh
echo "All 23 product images generated successfully!"
ls -lh public/images/products/
