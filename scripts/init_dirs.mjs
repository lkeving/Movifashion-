import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Ensure base directories exist
const categoriesList = [
  { slug: 'camisetas', name: 'Camisetas', count: 14 },
  { slug: 'pantalones', name: 'Pantalones', count: 12 },
  { slug: 'vestidos', name: 'Vestidos', count: 8 },
  { slug: 'chaquetas', name: 'Chaquetas', count: 10 },
  { slug: 'zapatos', name: 'Zapatos', count: 16 },
  { slug: 'bolsos', name: 'Bolsos', count: 9 },
  { slug: 'accesorios', name: 'Accesorios', count: 15 },
  { slug: 'ropa-deportiva', name: 'Ropa deportiva', count: 11 },
];

for (const cat of categoriesList) {
  const dir = path.join(process.cwd(), 'public', 'images', 'products', cat.slug);
  fs.mkdirSync(dir, { recursive: true });
}

console.log('Categories directories created.');
