import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '../src/data/mockProducts.ts';

const publicDir = path.join(process.cwd(), 'public');
let hasErrors = false;
let verifiedCount = 0;
const errors: string[] = [];

console.log('🔍 Iniciando auditoría estricta de rutas de imágenes para Vercel...');

for (const product of INITIAL_PRODUCTS) {
  // Check main images
  for (const imgUrl of product.images || []) {
    verifyImagePath(imgUrl, `Producto "${product.name}" (${product.id}) - imagen principal`);
  }

  // Check colorImages
  if (product.colorImages) {
    for (const [colorName, imgUrls] of Object.entries(product.colorImages)) {
      for (const imgUrl of imgUrls) {
        verifyImagePath(imgUrl, `Producto "${product.name}" (${product.id}) - color "${colorName}"`);
      }
    }
  }
}

function verifyImagePath(urlPath: string, context: string) {
  if (!urlPath.startsWith('/')) {
    errors.push(`❌ Ruta inválida (debe iniciar con '/'): ${urlPath} [${context}]`);
    hasErrors = true;
    return;
  }

  const relativePath = urlPath.slice(1);
  const fullPath = path.join(publicDir, relativePath);

  if (!fs.existsSync(fullPath)) {
    errors.push(`❌ Archivo NO existe físicamente: public/${relativePath} [${context}]`);
    hasErrors = true;
    return;
  }

  // Case sensitivity check for Vercel / Linux: verify directory entries match exact casing
  const parts = relativePath.split('/');
  let currentDir = publicDir;

  for (const part of parts) {
    const entries = fs.readdirSync(currentDir);
    if (!entries.includes(part)) {
      errors.push(`❌ Discrepancia de mayúsculas/minúsculas en ruta: "${part}" en "${currentDir}" [${context}]`);
      hasErrors = true;
      return;
    }
    currentDir = path.join(currentDir, part);
  }

  verifiedCount++;
}

if (hasErrors) {
  console.error('\n⚠️ SE ENCONTRARON ERRORES DE RUTAS DE IMÁGENES:');
  errors.forEach(err => console.error(err));
  console.error(`\nTotal de errores: ${errors.length}. Corrige las rutas antes de desplegar.`);
  process.exit(1);
} else {
  console.log(`\n✅ Auditoría exitosa: ${verifiedCount} rutas de imágenes verificadas físicamente en public/ con mayúsculas/minúsculas exactas.`);
  process.exit(0);
}
