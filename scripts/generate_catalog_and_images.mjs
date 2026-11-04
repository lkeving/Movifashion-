import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Color utilities
function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

function adjustColor(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * factor, g * factor, b * factor);
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// -------------------------------------------------------------
// SVG TEMPLATES FOR PRODUCT CATEGORIES & STYLES
// STRICTLY ON #EDEDF0 BACKGROUND WITH SOFT GROUND SHADOW
// -------------------------------------------------------------
function renderProductSVG(categorySlug, styleIndex, hexColor) {
  const baseColor = hexColor;
  const shadowColor = adjustColor(hexColor, 0.65);
  const deepShadow = adjustColor(hexColor, 0.45);
  const highlightColor = adjustColor(hexColor, 1.28);
  const softHighlight = adjustColor(hexColor, 1.14);

  // Background is ALWAYS #EDEDF0 (light neutral studio gray)
  let bodyContent = '';

  switch (categorySlug) {
    case 'camisetas': {
      // 3 subtle variations: crewneck, polo/henley, oversize/tank
      const v = styleIndex % 3;
      if (v === 0) {
        // Crewneck T-shirt
        bodyContent = `
          <g>
            <path d="M 210,180 Q 255,195 300,195 Q 345,195 390,180 L 450,225 L 415,285 L 375,265 L 380,480 Q 300,490 220,480 L 225,265 L 185,285 L 150,225 Z"
                  fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
            <!-- Neckline Ribbing -->
            <path d="M 255,180 Q 300,215 345,180 Q 300,198 255,180 Z" fill="${highlightColor}" stroke="${deepShadow}" stroke-width="1.5" />
            <!-- Subtle Folds & Highlights -->
            <path d="M 240,250 Q 250,380 245,470" stroke="${shadowColor}" stroke-width="1.8" fill="none" opacity="0.45" />
            <path d="M 360,250 Q 350,380 355,470" stroke="${deepShadow}" stroke-width="1.8" fill="none" opacity="0.45" />
            <path d="M 300,240 Q 305,360 295,460" stroke="${softHighlight}" stroke-width="2" fill="none" opacity="0.6" />
            <!-- Hem lines -->
            <path d="M 222,475 Q 300,485 378,475" stroke="${deepShadow}" stroke-width="1.5" fill="none" opacity="0.6" />
            <path d="M 158,232 L 188,278" stroke="${deepShadow}" stroke-width="1.5" fill="none" opacity="0.6" />
            <path d="M 442,232 L 412,278" stroke="${deepShadow}" stroke-width="1.5" fill="none" opacity="0.6" />
          </g>
        `;
      } else if (v === 1) {
        // Polo / Henley Shirt
        bodyContent = `
          <g>
            <path d="M 205,185 L 255,170 L 345,170 L 395,185 L 455,225 L 420,285 L 378,265 L 382,480 Q 300,490 218,480 L 222,265 L 180,285 L 145,225 Z"
                  fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
            <!-- Collar structure -->
            <path d="M 255,170 L 285,225 L 300,210 L 315,225 L 345,170 Q 300,185 255,170 Z" fill="${highlightColor}" stroke="${deepShadow}" stroke-width="2" />
            <!-- Placket & Buttons -->
            <rect x="294" y="210" width="12" height="75" rx="3" fill="${deepShadow}" opacity="0.8" />
            <circle cx="300" cy="225" r="2.5" fill="#FFFFFF" />
            <circle cx="300" cy="245" r="2.5" fill="#FFFFFF" />
            <circle cx="300" cy="265" r="2.5" fill="#FFFFFF" />
            <!-- Folds -->
            <path d="M 245,270 Q 255,370 250,465" stroke="${shadowColor}" stroke-width="2" fill="none" opacity="0.5" />
            <path d="M 355,270 Q 345,370 350,465" stroke="${deepShadow}" stroke-width="2" fill="none" opacity="0.5" />
          </g>
        `;
      } else {
        // Oversize / Tank Silhouette
        bodyContent = `
          <g>
            <path d="M 195,185 L 250,180 Q 300,205 350,180 L 405,185 L 470,240 L 430,295 L 390,270 L 395,490 Q 300,500 205,490 L 210,270 L 170,295 L 130,240 Z"
                  fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
            <path d="M 250,180 Q 300,210 350,180" stroke="${deepShadow}" stroke-width="3" fill="none" />
            <path d="M 280,240 Q 275,370 280,480" stroke="${softHighlight}" stroke-width="3" fill="none" opacity="0.7" />
            <path d="M 320,240 Q 325,370 320,480" stroke="${shadowColor}" stroke-width="2.5" fill="none" opacity="0.5" />
          </g>
        `;
      }
      break;
    }
    case 'pantalones': {
      bodyContent = `
        <g>
          <!-- Waistband -->
          <path d="M 210,140 Q 300,145 390,140 L 395,175 Q 300,180 205,175 Z" fill="${highlightColor}" stroke="${deepShadow}" stroke-width="2" />
          <!-- Pants Legs -->
          <path d="M 205,175 L 215,485 L 285,485 L 298,280 L 302,280 L 315,485 L 385,485 L 395,175 Q 300,185 205,175 Z"
                fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
          <!-- Crease / Pleats -->
          <line x1="250" y1="180" x2="250" y2="480" stroke="${deepShadow}" stroke-width="1.8" opacity="0.65" />
          <line x1="350" y1="180" x2="350" y2="480" stroke="${deepShadow}" stroke-width="1.8" opacity="0.65" />
          <!-- Pockets -->
          <path d="M 215,185 Q 235,210 245,225" stroke="${deepShadow}" stroke-width="2" fill="none" />
          <path d="M 385,185 Q 365,210 355,225" stroke="${deepShadow}" stroke-width="2" fill="none" />
          <!-- Belt loops & Button -->
          <rect x="296" y="146" width="8" height="24" rx="2" fill="${deepShadow}" />
          <circle cx="300" cy="158" r="3" fill="#E2E8F0" />
        </g>
      `;
      break;
    }
    case 'vestidos': {
      bodyContent = `
        <g>
          <!-- Straps / Neck -->
          <path d="M 255,120 L 265,185 L 335,185 L 345,120 L 325,120 L 320,180 L 280,180 L 275,120 Z" fill="${highlightColor}" stroke="${deepShadow}" stroke-width="1.5" />
          <!-- Bodice & Flared Skirt -->
          <path d="M 250,185 Q 300,195 350,185 L 360,270 Q 300,285 240,270 Z" fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2" />
          <path d="M 240,270 Q 300,285 360,270 L 435,500 Q 300,520 165,500 Z" fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
          <!-- Fluid drapery folds -->
          <path d="M 270,275 Q 260,390 230,495" stroke="${deepShadow}" stroke-width="2.5" fill="none" opacity="0.5" />
          <path d="M 330,275 Q 340,390 370,495" stroke="${deepShadow}" stroke-width="2.5" fill="none" opacity="0.5" />
          <path d="M 300,280 Q 305,395 300,505" stroke="${softHighlight}" stroke-width="3" fill="none" opacity="0.7" />
        </g>
      `;
      break;
    }
    case 'chaquetas': {
      bodyContent = `
        <g>
          <!-- Structured Shoulders & Sleeves -->
          <path d="M 185,160 L 245,150 L 355,150 L 415,160 L 465,260 L 410,275 L 385,480 Q 300,490 215,480 L 190,275 L 135,260 Z"
                fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
          <!-- Lapels -->
          <path d="M 245,150 L 275,280 L 225,240 L 210,165 Z" fill="${highlightColor}" stroke="${deepShadow}" stroke-width="2" />
          <path d="M 355,150 L 325,280 L 375,240 L 390,165 Z" fill="${highlightColor}" stroke="${deepShadow}" stroke-width="2" />
          <!-- V Chest Opening -->
          <path d="M 275,280 L 300,340 L 325,280 Z" fill="${deepShadow}" opacity="0.4" />
          <!-- Buttons & Pockets -->
          <circle cx="300" cy="350" r="4" fill="#E2E8F0" stroke="${deepShadow}" stroke-width="1.5" />
          <circle cx="300" cy="390" r="4" fill="#E2E8F0" stroke="${deepShadow}" stroke-width="1.5" />
          <rect x="220" y="380" width="45" height="6" rx="2" fill="${deepShadow}" opacity="0.8" />
          <rect x="335" y="380" width="45" height="6" rx="2" fill="${deepShadow}" opacity="0.8" />
          <line x1="235" y1="230" x2="265" y2="230" stroke="${deepShadow}" stroke-width="2" opacity="0.8" />
        </g>
      `;
      break;
    }
    case 'zapatos': {
      bodyContent = `
        <g>
          <!-- Sneaker / Shoe Silhouette in 3/4 Studio View -->
          <!-- Rubber Sole Base -->
          <path d="M 120,440 C 130,465 190,470 300,470 C 420,470 480,455 500,430 C 475,415 440,418 360,420 C 240,420 160,425 120,440 Z"
                fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
          <path d="M 120,440 C 130,465 190,470 300,470 C 420,470 480,455 500,430 L 495,445 C 470,470 400,485 300,485 C 190,485 130,480 115,455 Z"
                fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5" />
          <!-- Shoe Upper -->
          <path d="M 130,430 C 145,390 190,340 240,310 C 280,285 320,280 340,305 C 360,330 380,360 440,390 C 470,405 485,420 490,430 C 420,420 330,420 220,425 Z"
                fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
          <!-- Collar & Tongue -->
          <path d="M 230,315 C 220,270 245,250 270,250 C 285,250 295,270 300,290 Z" fill="${highlightColor}" stroke="${deepShadow}" stroke-width="2" />
          <!-- Laces & Eyelet Stays -->
          <path d="M 245,310 L 285,325 M 255,330 L 295,345 M 270,350 L 310,365 M 285,370 L 325,385" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
          <!-- Aerodynamic Side Swoop / Accent -->
          <path d="M 200,395 Q 310,340 430,400" stroke="${softHighlight}" stroke-width="4" fill="none" opacity="0.8" />
          <path d="M 220,410 Q 320,360 410,412" stroke="${deepShadow}" stroke-width="2" fill="none" opacity="0.6" />
        </g>
      `;
      break;
    }
    case 'bolsos': {
      bodyContent = `
        <g>
          <!-- Handles -->
          <path d="M 240,240 C 240,110 360,110 360,240" stroke="${deepShadow}" stroke-width="10" stroke-linecap="round" fill="none" />
          <path d="M 240,240 C 240,115 360,115 360,240" stroke="${highlightColor}" stroke-width="4" stroke-linecap="round" fill="none" />
          <!-- Tote Bag Body -->
          <path d="M 180,230 L 200,470 Q 300,485 400,470 L 420,230 Q 300,220 180,230 Z"
                fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
          <!-- Front Pocket / Artisan Seam -->
          <path d="M 220,290 L 225,430 Q 300,440 375,430 L 380,290 Z" fill="${adjustColor(hexColor, 0.9)}" stroke="${deepShadow}" stroke-width="1.8" />
          <!-- Hardware Metal Tag -->
          <rect x="290" y="320" width="20" height="12" rx="2" fill="#E2E8F0" stroke="#64748B" stroke-width="1" />
          <circle cx="300" cy="326" r="2" fill="#7656D6" />
          <!-- Perimeter Stitching Lines -->
          <path d="M 190,240 L 208,460 Q 300,475 392,460 L 410,240" stroke="${softHighlight}" stroke-width="1.2" stroke-dasharray="4,3" fill="none" />
        </g>
      `;
      break;
    }
    case 'accesorios': {
      const v = styleIndex % 3;
      if (v === 0) {
        // Luxury Sunglasses
        bodyContent = `
          <g>
            <!-- Sunglasses Frame -->
            <path d="M 140,290 Q 210,270 280,290 Q 300,295 320,290 Q 390,270 460,290 L 475,320 Q 430,420 340,410 Q 305,370 300,320 Q 295,370 260,410 Q 170,420 125,320 Z"
                  fill="url(#garmentGrad)" stroke="${deepShadow}" stroke-width="3" />
            <!-- Left Lens -->
            <path d="M 155,305 Q 215,290 270,305 Q 260,390 195,395 Q 145,390 155,305 Z" fill="#1E1B2E" opacity="0.88" />
            <!-- Right Lens -->
            <path d="M 330,305 Q 385,290 445,305 Q 455,390 405,395 Q 340,390 330,305 Z" fill="#1E1B2E" opacity="0.88" />
            <!-- Lens Specular Glare -->
            <line x1="170" y1="315" x2="220" y2="385" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.5" />
            <line x1="345" y1="315" x2="395" y2="385" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.5" />
            <!-- Temples / Bridge -->
            <rect x="282" y="294" width="36" height="6" rx="2" fill="${highlightColor}" />
          </g>
        `;
      } else if (v === 1) {
        // Minimalist Watch
        bodyContent = `
          <g>
            <!-- Leather Strap -->
            <rect x="265" y="100" width="70" height="400" rx="6" fill="url(#garmentGrad)" stroke="${deepShadow}" stroke-width="2" />
            <!-- Stitching on strap -->
            <line x1="272" y1="110" x2="272" y2="490" stroke="${softHighlight}" stroke-width="1.5" stroke-dasharray="5,4" />
            <line x1="328" y1="110" x2="328" y2="490" stroke="${softHighlight}" stroke-width="1.5" stroke-dasharray="5,4" />
            <!-- Circular Case -->
            <circle cx="300" cy="300" r="95" fill="#FFFFFF" stroke="#94A3B8" stroke-width="8" />
            <circle cx="300" cy="300" r="88" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" />
            <!-- Dial Markings -->
            <line x1="300" y1="218" x2="300" y2="230" stroke="#334155" stroke-width="3" />
            <line x1="300" y1="370" x2="300" y2="382" stroke="#334155" stroke-width="3" />
            <line x1="218" y1="300" x2="230" y2="300" stroke="#334155" stroke-width="3" />
            <line x1="370" y1="300" x2="382" y2="300" stroke="#334155" stroke-width="3" />
            <!-- Hands -->
            <line x1="300" y1="300" x2="300" y2="245" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round" />
            <line x1="300" y1="300" x2="345" y2="310" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" />
            <line x1="300" y1="300" x2="265" y2="335" stroke="#7656D6" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="300" cy="300" r="4.5" fill="#7656D6" />
          </g>
        `;
      } else {
        // Scarf / Belt / Jewelry
        bodyContent = `
          <g>
            <!-- Folded Cashmere Scarf / Accessory -->
            <path d="M 200,200 Q 300,170 400,200 L 415,360 Q 300,390 185,360 Z" fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
            <path d="M 185,360 Q 300,390 415,360 L 420,440 Q 300,470 180,440 Z" fill="${adjustColor(hexColor, 0.9)}" stroke="${deepShadow}" stroke-width="2" />
            <!-- Fringe at bottom -->
            ${Array.from({ length: 18 }).map((_, i) => `
              <line x1="${190 + i * 13}" y1="440" x2="${190 + i * 13}" y2="480" stroke="${deepShadow}" stroke-width="2" />
            `).join('')}
            <!-- Woven texture accent -->
            <path d="M 210,220 Q 300,195 390,220" stroke="${softHighlight}" stroke-width="2" fill="none" opacity="0.6" />
            <path d="M 200,280 Q 300,255 400,280" stroke="${softHighlight}" stroke-width="2" fill="none" opacity="0.6" />
          </g>
        `;
      }
      break;
    }
    case 'ropa-deportiva': {
      // High Performance Activewear Set / Top / Leggings
      bodyContent = `
        <g>
          <!-- Athletic Top / Compression Bodice -->
          <path d="M 230,150 L 260,140 Q 300,165 340,140 L 370,150 L 395,240 L 360,255 L 345,350 Q 300,360 255,350 L 240,255 L 205,240 Z"
                fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
          <!-- Ergonomic Mesh Panels -->
          <path d="M 240,255 Q 300,290 360,255" stroke="${deepShadow}" stroke-width="2.5" fill="none" />
          <path d="M 270,175 Q 300,210 330,175" stroke="${softHighlight}" stroke-width="2.5" fill="none" />
          <!-- Matching Performance Shorts / Tights Base -->
          <path d="M 255,360 Q 300,370 345,360 L 360,475 L 315,480 L 300,410 L 285,480 L 240,475 Z"
                fill="url(#garmentGrad)" stroke="${shadowColor}" stroke-width="2.5" />
          <!-- High-visibility Reflective Stitches -->
          <line x1="260" y1="375" x2="250" y2="465" stroke="#FFFFFF" stroke-width="2" opacity="0.8" />
          <line x1="340" y1="375" x2="350" y2="465" stroke="#FFFFFF" stroke-width="2" opacity="0.8" />
        </g>
      `;
      break;
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <!-- Studio Key & Ambient Lighting Gradient for the Garment -->
    <linearGradient id="garmentGrad" x1="20%" y1="15%" x2="80%" y2="85%">
      <stop offset="0%" stop-color="${highlightColor}" />
      <stop offset="45%" stop-color="${baseColor}" />
      <stop offset="100%" stop-color="${deepShadow}" />
    </linearGradient>

    <!-- Floor Drop Shadow Filter -->
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
  </defs>

  <!-- 1. STRICT UNIFORM BACKGROUND #EDEDF0 -->
  <rect width="600" height="600" fill="#EDEDF0" />

  <!-- 2. NATURAL FLOOR CONTACT SHADOW (Identical for all variants) -->
  <ellipse cx="300" cy="520" rx="150" ry="18" fill="rgba(35, 25, 48, 0.16)" filter="url(#softShadow)" />

  <!-- 3. GARMENT BODY (Changes strictly the garment color, never the background) -->
  ${bodyContent}
</svg>
`;
}

// -------------------------------------------------------------
// DEFINITION OF EXACT 95 PRODUCTS ACROSS 8 CATEGORIES
// -------------------------------------------------------------
const FULL_PRODUCTS = [];

// Helper to push product
function addProduct(p) {
  FULL_PRODUCTS.push(p);
}

// 1. CAMISETAS (14 productos)
const camisetasData = [
  {
    name: 'Camiseta Básica Cuello Redondo Tacto de Seda Movi',
    desc: 'Camiseta esencial confeccionada en 100% algodón Pima mercerizado con acabado extra suave tacto de seda. Cuello indeformable y calce regular perfecto para combinar.',
    price: 89000, discountPrice: 75000, brand: 'MOVI BASIC',
    colors: [{ name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['camiseta', 'algodon pima', 'basica', 'cuello redondo', 'tacto de seda'],
    features: ['100% Algodón Pima Peruano mercerizado', 'Costuras reforzadas al tono', 'Tratamiento anti-peeling', 'Corte regular contemporáneo'],
    inventory: 45, rating: 4.9, reviewCount: 88, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Camiseta Oversize Estilo Urbano Minimalista',
    desc: 'Silueta amplia y hombros caídos con gramaje pesado de 240g. Corte boxy moderno con cuello acanalado de 3 cm para un look streetwear sofisticado.',
    price: 115000, discountPrice: 95000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['oversize', 'streetwear', 'urbano', 'camiseta', 'boxy fit'],
    features: ['Algodón orgánico pesado 240 GSM', 'Hombro caído estructurado', 'Teñido en prenda eco-friendly', 'Cuello cerrado de 3 cm'],
    inventory: 34, rating: 4.8, reviewCount: 64, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Polo Piqué Sastre con Cuello Camisero Movi',
    desc: 'Camisa polo contemporánea tejida en piqué de algodón doble cabo. Cuello camisero sastre sin botones para un estilo limpio y refinado de oficina o fin de semana.',
    price: 139000, discountPrice: 119000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Azul Noche', hex: '#1E293B' }],
    tags: ['polo', 'pique', 'sartorial', 'elegante', 'camisa'],
    features: ['Piqué doble fontura mercerizada', 'Cuello camisero con entretela liviana', 'Aberturas laterales con cinta espigada', 'Bordado tonal sutil'],
    inventory: 28, rating: 4.7, reviewCount: 42, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Camiseta Henley Botones Nácar en Algodón Pima',
    desc: 'Camiseta de manga corta con tapeta de 3 botones de nácar natural. Diseño versátil que balancea comodidad informal con presencia sutil y estructurada.',
    price: 105000, discountPrice: 89000, brand: 'MOVI BASIC',
    colors: [{ name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }],
    tags: ['henley', 'botones nacar', 'algodon', 'casual', 'manga corta'],
    features: ['Botones auténticos de nácar de río', 'Tapeta pespunteada al milímetro', 'Tejido jersey de galga fina', 'Lavable a máquina'],
    inventory: 31, rating: 4.8, reviewCount: 39, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Camiseta Sin Mangas Silueta Fluida Studio',
    desc: 'Camisilla de sisas amplias y caída arquitectónica en modal y algodón. Fresca, ligera y diseñada para capas urbanas en clima cálido o templado.',
    price: 79000, discountPrice: 65000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda Suave', hex: '#E9E2FA' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['sin mangas', 'tank', 'modal', 'fluida', 'fresca'],
    features: ['Mezcla Modal-Tencel ultrasuave', 'Acabado de sisa sin costura visible', 'Bajo redondeado con caída libre', 'Respirabilidad superior'],
    inventory: 22, rating: 4.6, reviewCount: 29, isPopular: false, isNew: false, isOffer: false
  },
  {
    name: 'Camiseta Gráfica Algoritmo Geométrico Movi AI',
    desc: 'Estampado gráfico frontal inspirado en redes neuronales y geometría fractal de la moda. Serigrafía al agua de alta definición que no se desgasta ni cuartea.',
    price: 119000, discountPrice: 99000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['grafica', 'movi ai', 'estampada', 'tecnologia', 'arte digital'],
    features: ['Serigrafía botánica al agua libre de solventes', 'Jersey pre-encogido 210g', 'Gráfico exclusivo de la colección 2026', 'Tacto imperceptible'],
    inventory: 40, rating: 4.9, reviewCount: 95, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Camiseta Cuello V Profundo en Lino Lavado',
    desc: 'Prenda veraniega tejida en mezcla de lino natural y algodón ecológico. Cuello en V elegante con escote equilibrado para climas cálidos y ocasiones informales.',
    price: 125000, discountPrice: 105000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Beige Arena', hex: '#D4C5B9' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['lino', 'cuello v', 'verano', 'fresco', 'natural'],
    features: ['55% Lino francés, 45% Algodón orgánico', 'Textura rústica suave al tacto', 'Excelente regulación térmica natural', 'Ajuste relajado'],
    inventory: 19, rating: 4.7, reviewCount: 31, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Camiseta Raglán Bicolor Urbana Movi',
    desc: 'Inspiración deportiva retro con mangas raglán en contraste tonal morado y cuerpo blanco. Libertad de movimiento total en hombros y brazos.',
    price: 99000, discountPrice: 82000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['raglan', 'bicolor', 'retro', 'deportiva urbana', 'contrastes'],
    features: ['Mangas continuas hasta el cuello', 'Rib contrastante de 1x1', 'Puntada de seguridad flatlock', '100% Algodón peinado'],
    inventory: 26, rating: 4.6, reviewCount: 22, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Camiseta Manga Larga Cuello Tortuga Liviano',
    desc: 'Prenda de transición sofisticada en punto fino de modal. Cuello tortuga ajustado sin presionar, ideal para llevar debajo de blazers o sobrecamisas.',
    price: 119000, discountPrice: 99000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }],
    tags: ['manga larga', 'cuello tortuga', 'modal', 'elegante', 'capas'],
    features: ['Tejido modal elástico de tacto sedoso', 'Cuello tortuga autoajustable', 'Puños ribeteados estilizados', 'Silueta ceñida sin arrugas'],
    inventory: 24, rating: 4.8, reviewCount: 47, isPopular: true, isNew: false, isOffer: false
  },
  {
    name: 'Camiseta Boxy Fit Textura Gofrada Waffle',
    desc: 'Tejido con relieve tridimensional tipo waffle que aporta volumen visual y confort térmico. Corte recto con hombros amplios para un estilo limpio.',
    price: 112000, discountPrice: 95000, brand: 'MOVI BASIC',
    colors: [{ name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }],
    tags: ['waffle', 'gofrada', 'textura', 'boxy fit', 'confort'],
    features: ['Punto nido de abeja micro-waffle', 'Aislamiento transpirable', 'Hombros caídos con caída limpia', 'Bajo recto pulido'],
    inventory: 35, rating: 4.7, reviewCount: 38, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Camiseta Manga Corta con Bolsillo Sastre Ribeteado',
    desc: 'El básico definitivo enriquecido con bolsillo de ribete en el pecho en tejido de sarga contrastante. Un toque sartorial en una prenda cotidiana.',
    price: 98000, discountPrice: 84000, brand: 'MOVI BASIC',
    colors: [{ name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Lavanda Suave', hex: '#E9E2FA' }],
    tags: ['bolsillo', 'sastre', 'ribete', 'algodon', 'casual'],
    features: ['Bolsillo en pecho cortado a láser', 'Algodón cardado y peinado 190g', 'Cuello acanalado elástico', 'Corte slim regular'],
    inventory: 29, rating: 4.8, reviewCount: 51, isPopular: false, isNew: false, isOffer: false
  },
  {
    name: 'Camiseta Térmica Segunda Piel Antibacteriana',
    desc: 'Tecnología textil de iones de plata que previene olores y mantiene la temperatura corporal estable. Tacto suave como pluma y elasticidad en 4 direcciones.',
    price: 109000, discountPrice: 89000, brand: 'MOVI TECH',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['termica', 'segunda piel', 'antibacteriana', 'tecnologia', 'movi tech'],
    features: ['Fibras con tecnología SilverTech', 'Ajuste ergonómico de compresión suave', 'Secado ultra rápido en 15 min', 'Costuras planas anti-roce'],
    inventory: 33, rating: 4.9, reviewCount: 72, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Camiseta Tie-Dye Lavanda Editorial Movi',
    desc: 'Efecto degradé y desteñido artesanal en tonalidades lavanda y morado noche. Cada pieza es única y lavada a mano para lograr un desvanecido sublime.',
    price: 129000, discountPrice: 109000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['tie dye', 'degrade', 'lavanda', 'artesanal', 'editorial'],
    features: ['Teñido a mano por artesanos', 'Efecto marmoleado único en cada prenda', '100% Algodón de fibra larga', 'Edición limitada de temporada'],
    inventory: 16, rating: 4.9, reviewCount: 43, isPopular: true, isNew: true, isOffer: false
  },
  {
    name: 'Camiseta Asimétrica Drapeada Atelier',
    desc: 'Pieza de diseño con pliegues diagonales en la cintura y bajo asimétrico. Escultura textil contemporánea para ocasiones donde la moda es protagonista.',
    price: 145000, discountPrice: 125000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }],
    tags: ['asimetrica', 'drapeada', 'atelier', 'diseño', 'exclusiva'],
    features: ['Patronaje de sastrería asimétrica', 'Tejido jersey de viscosa con caída líquida', 'Pliegues cosidos a mano', 'Silueta escultural'],
    inventory: 14, rating: 4.8, reviewCount: 36, isPopular: false, isNew: true, isOffer: false
  }
];

camisetasData.forEach((item, idx) => {
  addProduct({
    id: `prod-cam-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Camisetas',
    brand: item.brand,
    images: [`/images/products/camisetas/prod-cam-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/camisetas/prod-cam-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-15',
    categorySlug: 'camisetas'
  });
});

// 2. PANTALONES (12 productos)
const pantalonesData = [
  {
    name: 'Pantalón Sastre Plisado Recto Atelier',
    desc: 'Pantalón de sastrería con doble pinza frontal y caída recta fluida en lana fría tropical. Pretina extendida sin trabillas para una línea minimalista.',
    price: 245000, discountPrice: 215000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['pantalon', 'sastre', 'plisado', 'lana fria', 'elegante'],
    features: ['Lana virgen fría anti-arrugas', 'Doble pinza frontal clásica', 'Bolsillos laterales franceses', 'Ajuste regulable en cintura'],
    inventory: 22, rating: 4.9, reviewCount: 58, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Pantalón Cargo Utilitario con Bolsillos Modulares',
    desc: 'Pantalón técnico con 6 bolsillos de fuelle geométricos y rodillas preformadas. Tejido ripstop antidesgarro con acabado repelente a lloviznas.',
    price: 198000, discountPrice: 169000, brand: 'MOVI TECH',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Verde Oliva', hex: '#3F4E3C' }],
    tags: ['cargo', 'utilitario', 'ripstop', 'bolsillos', 'tecnico'],
    features: ['Tejido antidesgarro Ripstop Pro', 'Bolsillos con solapa y broche magnético', 'Bajos ajustables con cordón elástico', 'Cintura semi-elástica'],
    inventory: 36, rating: 4.8, reviewCount: 84, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Jeans Corte Recto Denim Orgánico Añil',
    desc: 'Denim clásico de 13 oz confeccionado en algodón 100% orgánico sin elastano. Lavado índigo profundo con acabado stonewash ligero y costuras en tabaco.',
    price: 185000, discountPrice: 155000, brand: 'MOVI BASIC',
    colors: [{ name: 'Azul Noche', hex: '#1E293B' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['jeans', 'denim', 'recto', 'organico', 'clasico'],
    features: ['Denim selvedge de 13 oz no elástico', 'Remaches de cobre macizo', 'Cierre de botones metálicos estampados', 'Tratamiento de lavado ecológico'],
    inventory: 40, rating: 4.7, reviewCount: 92, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Pantalón Chino Stretch Silueta Confort',
    desc: 'El chino polivalente en gabardina de algodón con 3% de elastano. Corte ligeramente cónico hacia el tobillo para máxima versatilidad.',
    price: 169000, discountPrice: 139000, brand: 'MOVI BASIC',
    colors: [{ name: 'Beige Arena', hex: '#D4C5B9' }, { name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['chino', 'gabardina', 'stretch', 'confort', 'casual'],
    features: ['Algodón stretch con recuperación de forma', 'Bolsillos traseros ojal con botón', 'Cremallera YKK de latón', 'Tacto aterciopelado peach-skin'],
    inventory: 38, rating: 4.8, reviewCount: 71, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Pantalón Jogger Urbano en Algodón Pima',
    desc: 'Jogger de lujo en felpa perchada de algodón Pima. Pretina con cordón en terminal metálico y puños elastizados en bota.',
    price: 159000, discountPrice: 129000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['jogger', 'algodon pima', 'felpa', 'urbano', 'comodo'],
    features: ['Felpa francesa no perchada 320g', 'Cordón con herrajes metálicos Movi', 'Bolsillos con cremallera oculta', 'Puños rib resistentes'],
    inventory: 42, rating: 4.9, reviewCount: 104, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Pantalón Palazzo Fluido Cintura Alta',
    desc: 'Silueta monumental de pernera extra ancha y tiro alto. Caída impecable en crepé de viscosa que crea un movimiento majestuoso al caminar.',
    price: 210000, discountPrice: 179000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }],
    tags: ['palazzo', 'fluido', 'tiro alto', 'ancho', 'crepe'],
    features: ['Tejido crepé japonés de caída pesada', 'Cintura alta con elástico interior invisible', 'Pernera ancha de 42 cm de ruedo', 'No transparenta'],
    inventory: 18, rating: 4.8, reviewCount: 44, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Pantalón Culotte en Lino y Seda',
    desc: 'Corte cropped por debajo de la rodilla con volumen amplio. Mezcla noble de lino europeo y seda rústica que respira con frescura.',
    price: 195000, discountPrice: 165000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Beige Arena', hex: '#D4C5B9' }, { name: 'Lavanda Suave', hex: '#E9E2FA' }],
    tags: ['culotte', 'lino', 'seda', 'cropped', 'verano'],
    features: ['60% Lino, 40% Seda salvaje', 'Largo midi moderno', 'Bolsillos diagonales amplios', 'Acabado deshilachado controlado'],
    inventory: 15, rating: 4.7, reviewCount: 28, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Pantalón de Cuero Sintético Mate Suave',
    desc: 'Pantalón con interior de microfibra afelpada y acabado exterior mate de tacto natural. Corte recto moderno con costura horizontal en rodilla.',
    price: 235000, discountPrice: 199000, brand: 'MOVI URBAN',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Ciruela Imperial', hex: '#4A154B' }],
    tags: ['cuero sintetico', 'efecto piel', 'mate', 'urbano', 'noche'],
    features: ['Eco-cuero premium ultra flexible', 'Interior térmico de felpa suave', 'No cruje al caminar', 'Cremallera metálica reforzada'],
    inventory: 20, rating: 4.8, reviewCount: 52, isPopular: true, isNew: true, isOffer: false
  },
  {
    name: 'Pantalón de Vestir Tiro Alto con Pretina Cruzada',
    desc: 'Diseño arquitectónico con pretina asimétrica de botón cruzado. Pernera recta y raya planchada indeformable para eventos formales.',
    price: 229000, discountPrice: 189000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Gris Platino', hex: '#9E9CA3' }],
    tags: ['tiro alto', 'pretina cruzada', 'formal', 'sastre', 'vestir'],
    features: ['Pretina asimétrica con doble botón de nácar', 'Tejido elastano bi-stretch', 'Largo personalizable con dobladillo sastre', 'Pinzas traseras favorecedoras'],
    inventory: 25, rating: 4.9, reviewCount: 61, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Jeans Skinny Flex con Lavado Ónix Movi',
    desc: 'Denim elástico de alta retención que esculpe la silueta sin perder la forma con el uso continuo. Tonalidad ónix negro profundo sin desvanecidos.',
    price: 175000, discountPrice: 145000, brand: 'MOVI BASIC',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Gris Platino', hex: '#9E9CA3' }],
    tags: ['jeans', 'skinny', 'negro', 'stretch', 'denim'],
    features: ['Denim PowerStretch de 4 vías', 'Tinte permanente reactivo negro azabache', 'Bolsillos delanteros moldeadores', 'Tiro medio universal'],
    inventory: 35, rating: 4.6, reviewCount: 78, isPopular: false, isNew: false, isOffer: false
  },
  {
    name: 'Pantalón Flare Acampanado Vintage 70s',
    desc: 'Inspiración retro reinterpretada con silueta ajustada en caderas y muslos que se abre gradualmente desde la rodilla. Estiliza y alarga visualmente.',
    price: 189000, discountPrice: 159000, brand: 'MOVI URBAN',
    colors: [{ name: 'Azul Noche', hex: '#1E293B' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['flare', 'acampanado', 'retro', 'vintage', '70s'],
    features: ['Corte flare de 28 cm de campana', 'Denim con memoria de forma', 'Cintura limpia sin remaches visibles', 'Ruedo al corte'],
    inventory: 23, rating: 4.7, reviewCount: 39, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Pantalón Tapered Tobillero Sarga Italiana',
    desc: 'Corte holgado en muslos que se estrecha elegantemente en la pantorrilla terminando justo por encima del calzado. Sarga de algodón peinado.',
    price: 219000, discountPrice: 185000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Beige Arena', hex: '#D4C5B9' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['tapered', 'tobillero', 'sarga italiana', 'moderno', 'sastre'],
    features: ['Sarga italiana de torsión fina 260g', 'Cinturilla interior forrada en seda', 'Largo al tobillo ideal para mocasines o sneakers', 'Cremallera oculta'],
    inventory: 27, rating: 4.8, reviewCount: 50, isPopular: true, isNew: true, isOffer: false
  }
];

pantalonesData.forEach((item, idx) => {
  addProduct({
    id: `prod-pan-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Pantalones',
    brand: item.brand,
    images: [`/images/products/pantalones/prod-pan-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/pantalones/prod-pan-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['28', '30', '32', '34', '36'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-18',
    categorySlug: 'pantalones'
  });
});

// 3. VESTIDOS (8 productos)
const vestidosData = [
  {
    name: 'Vestido Midi Asimétrico Silueta Fluida Movi',
    desc: 'Vestido midi con caída en diagonal y drapeado suave en la cintura. Confeccionado en seda lavada que acompaña el movimiento con elegancia etérea.',
    price: 310000, discountPrice: 265000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['vestido', 'midi', 'asimetrico', 'seda', 'elegante', 'fiesta'],
    features: ['Seda lavada de tacto líquido', 'Abertura lateral discreta', 'Cremallera invisible lateral', 'Forro interior en microfibra transpirable'],
    inventory: 18, rating: 4.9, reviewCount: 77, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Vestido Camisero con Cinturón de Cuero',
    desc: 'Estructura clásica camisera con cuello sastre, botonadura oculta y cinturón artesanal de cuero con hebilla metálica circular.',
    price: 279000, discountPrice: 239000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['camisero', 'cinturon', 'algodon', 'oficina', 'vestido'],
    features: ['Popelina de algodón egipcio 100%', 'Cinturón desmontable en cuero genuino', 'Bolsillos laterales escondidos', 'Mangas con puño camisero'],
    inventory: 20, rating: 4.8, reviewCount: 46, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Vestido Lencero Slip Dress en Satén Lavanda',
    desc: 'El clásico de los 90 cortado al bies para amoldarse a las curvas con fluidez sensual. Tirantes espagueti regulables y escote drapeado.',
    price: 245000, discountPrice: 205000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Lavanda Suave', hex: '#E9E2FA' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['slip dress', 'satén', 'lencero', 'lavanda', 'noche'],
    features: ['Corte al bies para máxima adaptabilidad', 'Satén de seda con brillo sutil perlado', 'Tirantes metálicos graduables', 'Largo tobillero'],
    inventory: 24, rating: 4.9, reviewCount: 63, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Vestido de Noche Escote Espalda Cruzada',
    desc: 'Pieza de gala con escote posterior geométrico de tiras cruzadas y falda de cola corta. Presencia magnética para galas y ocasiones especiales.',
    price: 389000, discountPrice: 335000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['gala', 'noche', 'espalda descubierta', 'largo', 'fiesta'],
    features: ['Tejido crepé elástico de densidad pesada', 'Copas moldeadas incorporadas', 'Tiras en satén con ajuste regulable', 'Abertura frontal alta'],
    inventory: 12, rating: 4.9, reviewCount: 35, isPopular: true, isNew: true, isOffer: false
  },
  {
    name: 'Vestido Corto Estructurado Cuello Alto',
    desc: 'Vestido mini de corte recto arquitectónico y cuello chimenea. Tejido doble faz con cuerpo que no pierde la forma geométrica.',
    price: 225000, discountPrice: 189000, brand: 'MOVI URBAN',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['corto', 'mini', 'cuello alto', 'estructurado', 'moderno'],
    features: ['Punto scuba de alta densidad', 'Cremallera dorsal con tirador largo de metal', 'Largo sobre la rodilla', 'Bolsillos laterales'],
    inventory: 21, rating: 4.7, reviewCount: 29, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Vestido Maxi Bohemio en Gasa Estampada',
    desc: 'Volumen amplio con niveles fruncidos y mangas abullonadas en gasa translúcida sobre forro interior. Estampado geométrico sutil en tonos violetas.',
    price: 295000, discountPrice: 249000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['maxi', 'bohemio', 'gasa', 'fruncido', 'estampado'],
    features: ['Gasa vaporosa estampada en sublimación digital', 'Forro suave 100% viscosa', 'Escote elástico multiposición', 'Vuelo de 3 metros en ruedo'],
    inventory: 16, rating: 4.8, reviewCount: 38, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Vestido Tubo Sastre con Abertura Frontal',
    desc: 'Silueta ceñida inspirada en la sastrería clásica de negocios. Escote cuadrado sobrio y botonadura corrida al frente con botones de resina.',
    price: 265000, discountPrice: 225000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Gris Platino', hex: '#9E9CA3' }],
    tags: ['tubo', 'sastre', 'oficina', 'botones', 'formal'],
    features: ['Sarga de lana y elastano', 'Botonadura frontal practicable', 'Largo midi bajo la rodilla', 'Forro completo anti-adherente'],
    inventory: 19, rating: 4.8, reviewCount: 42, isPopular: false, isNew: false, isOffer: false
  },
  {
    name: 'Vestido Cruzado Wrap Dress en Seda Fría',
    desc: 'El wrap dress definitivo con lazada a la cintura que se amolda a cualquier figura. Escote cruzado favorecedor y mangas 3/4.',
    price: 255000, discountPrice: 215000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['wrap dress', 'cruzado', 'seda fria', 'lazada', 'versatil'],
    features: ['Punto de seda fría no arruga', 'Lazada ajustable en cintura', 'Mangas tres cuartos acampanadas', 'Caída fluida en A'],
    inventory: 26, rating: 4.9, reviewCount: 70, isPopular: true, isNew: false, isOffer: true
  }
];

vestidosData.forEach((item, idx) => {
  addProduct({
    id: `prod-ves-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Vestidos',
    brand: item.brand,
    images: [`/images/products/vestidos/prod-ves-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/vestidos/prod-ves-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['XS', 'S', 'M', 'L'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-21',
    categorySlug: 'vestidos'
  });
});

// 4. CHAQUETAS (10 productos)
const chaquetasData = [
  {
    name: 'Blazer Sastre Estructura Terciopelo Noche',
    desc: 'Blazer estructurado contemporáneo en lana fría de sarga italiana con solapa corrida minimalista en tono morado oscuro y forro en seda lavanda.',
    price: 385000, discountPrice: 320000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['blazer', 'chaqueta', 'sartorial', 'formal', 'elegante', 'lana'],
    features: ['Lana virgen de torsión fina italiana', 'Corte arquitectónico estructurado', 'Bolsillos laterales ribeteados', 'Botón artesanal en resina mate'],
    inventory: 19, rating: 4.9, reviewCount: 89, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Chaqueta Bomber Urbana Acolchada Movi Tech',
    desc: 'Bomber impermeable con relleno térmico ultra ligero Dupont Sorona. Cuello y puños acanalados en punto grueso y cremallera frontal termosellada.',
    price: 295000, discountPrice: 249000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Verde Oliva', hex: '#3F4E3C' }],
    tags: ['bomber', 'acolchada', 'urbana', 'termica', 'impermeable'],
    features: ['Aislamiento térmico ecológico Sorona', 'Tejido exterior repelente DWR', 'Bolsillo utilitario en manga izquierda', 'Bolsillos calientamanos con polar'],
    inventory: 28, rating: 4.8, reviewCount: 76, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Gabardina Trench Clásica Repelente al Agua',
    desc: 'La gabardina definitiva de doble botonadura con cinturón ajustable de hebilla forrada y solapa de tormenta. Elegancia atemporal bajo la lluvia.',
    price: 420000, discountPrice: 360000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Beige Arena', hex: '#D4C5B9' }, { name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['trench', 'gabardina', 'impermeable', 'clasica', 'cinturon'],
    features: ['Algodón gabardina repelente de 320g', 'Doble botonadura con 10 botones de cuerno', 'Abertura trasera para caminar con libertad', 'Trabillas ajustables en muñecas'],
    inventory: 16, rating: 4.9, reviewCount: 54, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Chaqueta Biker en Cuero Plena Flor',
    desc: 'Cazadora motera con cremallera asimétrica metálica pulida, solapas con broches de presión y forro acolchado con pespuntes en diamante.',
    price: 520000, discountPrice: 450000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['biker', 'cuero', 'plena flor', 'rocker', 'cazadora'],
    features: ['Cuero bovino seleccionado plena flor', 'Cremalleras metálicas YKK niqueladas', 'Cinturón inferior con hebilla de rodillo', 'Bolsillo interior para pasaporte/celular'],
    inventory: 11, rating: 5.0, reviewCount: 92, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Chaqueta Denim Oversize con Costuras Vistas',
    desc: 'Chaqueta vaquera de hombro caído en denim rígido lavado a la piedra. Botones metálicos grabados y bolsillos de parche frontales.',
    price: 219000, discountPrice: 185000, brand: 'MOVI BASIC',
    colors: [{ name: 'Azul Noche', hex: '#1E293B' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['denim', 'chaqueta jean', 'oversize', 'vaquera', 'casual'],
    features: ['100% Algodón denim de 13.5 oz', 'Costuras reforzadas de triple puntada', 'Tratamiento de desgaste vintage natural', 'Ajustadores de cintura laterales'],
    inventory: 30, rating: 4.7, reviewCount: 68, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Sobrecamisa Aislante en Pana Gruesa',
    desc: 'Chaqueta camisa en pana de 8 cordones con textura táctil irresistible. Perfecta para usar abierta como capa exterior o cerrada como camisa de abrigo.',
    price: 229000, discountPrice: 195000, brand: 'MOVI URBAN',
    colors: [{ name: 'Terracota', hex: '#A3523B' }, { name: 'Morado Noche', hex: '#30234F' }, { name: 'Beige Arena', hex: '#D4C5B9' }],
    tags: ['sobrecamisa', 'pana', 'abrigo', 'textura', 'capas'],
    features: ['Pana pesada de 8 costillas por pulgada', 'Bolsillos dobles en el pecho con botón', 'Interior de puños forrado en chambray', 'Corte relajado'],
    inventory: 25, rating: 4.8, reviewCount: 47, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Chaqueta Cortavientos Ultraliviana Plegable',
    desc: 'Chaqueta técnica de menos de 180 gramos que se pliega en su propio bolsillo lateral. Bloquea el viento y repele lloviznas con capucha ajustable.',
    price: 189000, discountPrice: 159000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['cortavientos', 'ultraliviana', 'plegable', 'running', 'viaje'],
    features: ['Nylon ripstop micro-fino transpirable', 'Se guarda en su propio bolsillo con mosquetón', 'Capucha con visera elástica', 'Detalles reflectivos 360°'],
    inventory: 35, rating: 4.8, reviewCount: 82, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Abrigo Largo en Paño de Lana Merino',
    desc: 'Abrigo sastre de largo 3/4 con solapa clásica en paño de lana Merino australiana. Forro de satén lavanda con bolsillos interiores para documentos.',
    price: 580000, discountPrice: 495000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Beige Arena', hex: '#D4C5B9' }],
    tags: ['abrigo', 'lana merino', 'largo', 'invierno', 'paño', 'lujo'],
    features: ['80% Lana Merino, 20% Cachemira reciclada', 'Construcción con entretela tradicional flotante', 'Abertura trasera con botón de seguridad', 'Bolsillos ribeteados con solapa'],
    inventory: 9, rating: 5.0, reviewCount: 41, isPopular: true, isNew: true, isOffer: false
  },
  {
    name: 'Parka Técnica con Capucha Desmontable',
    desc: 'Parka para clima frío con múltiples bolsillos impermeables y capucha con cordón de ajuste. Cintura con ceñidor interno para modular la silueta.',
    price: 375000, discountPrice: 319000, brand: 'MOVI TECH',
    colors: [{ name: 'Verde Oliva', hex: '#3F4E3C' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['parka', 'capucha', 'impermeable', 'invierno', 'tecnica'],
    features: ['Membrana cortavientos tricapa transpirable', 'Capucha desmontable con cremallera oculta', 'Cintura ajustable desde el interior', '6 bolsillos funcionales'],
    inventory: 17, rating: 4.8, reviewCount: 39, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Chaleco Sastre Estructurado Doble Botonadura',
    desc: 'Pieza sastre sin mangas con espalda en satén brillante y hebilla de ajuste. Llévalo como top protagonista o como tercera pieza bajo un blazer.',
    price: 195000, discountPrice: 165000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Gris Platino', hex: '#9E9CA3' }],
    tags: ['chaleco', 'sastre', 'doble botonadura', 'top', 'elegante'],
    features: ['Tejido sarga stretch italiana', 'Espalda en satén de seda regulable', 'Bolsillos de ojal funcionales', 'Corte ajustado que afina el torso'],
    inventory: 23, rating: 4.7, reviewCount: 33, isPopular: false, isNew: true, isOffer: true
  }
];

chaquetasData.forEach((item, idx) => {
  addProduct({
    id: `prod-cha-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Chaquetas',
    brand: item.brand,
    images: [`/images/products/chaquetas/prod-cha-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/chaquetas/prod-cha-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['S', 'M', 'L', 'XL'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-23',
    categorySlug: 'chaquetas'
  });
});

// 5. ZAPATOS (16 productos)
const zapatosData = [
  {
    name: 'Tenis Deportivos Amortiguación Ultra Movi',
    desc: 'Calzado ergonómico de alto rendimiento con amortiguación de espuma reactiva y malla transpirable. Diseñados especialmente para caminar largas distancias.',
    price: 219000, discountPrice: 189000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['tenis', 'deportivos', 'caminar', 'comodos', 'running', 'amortiguacion'],
    features: ['Suela ergonómica con retorno de energía', 'Malla transpirable antibacteriana', 'Peso ultraligero 240g', 'Plantilla memory foam ortopédica'],
    inventory: 38, rating: 4.9, reviewCount: 142, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Mocasines Sastre en Cuero Lustrado Italiano',
    desc: 'Mocasines tipo penny loafer elaborados a mano en cuero vacuno plena flor con suela de cuero cosida Blake y tacón con inserción de caucho antideslizante.',
    price: 349000, discountPrice: 299000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['mocasines', 'cuero', 'penny loafer', 'formal', 'zapatos'],
    features: ['Construcción artesanal cosido Blake', 'Cuero italiano pulido a mano', 'Forro interior de becerro hipoalergénico', 'Suela de cuero legítimo con protector'],
    inventory: 20, rating: 4.9, reviewCount: 68, isPopular: true, isNew: true, isOffer: false
  },
  {
    name: 'Botines Chelsea en Gamuza Hidrófuga',
    desc: 'Los clásicos botines de elásticos laterales confeccionados en gamuza de becerro tratada contra el agua y manchas. Suela de crepé natural acolchada.',
    price: 310000, discountPrice: 269000, brand: 'MOVI URBAN',
    colors: [{ name: 'Beige Arena', hex: '#D4C5B9' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['chelsea', 'botines', 'gamuza', 'crepe', 'impermeable'],
    features: ['Gamuza europea con tratamiento hidrófugo Scotchgard', 'Elásticos laterales de alta tensión', 'Tirador trasero en cinta espigada', 'Suela de crepé natural'],
    inventory: 22, rating: 4.8, reviewCount: 57, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Tenis Urbanos Clásicos Suela Vulcanizada',
    desc: 'Sneaker urbano minimalista de caña baja en cuero blanco con detalles contrastantes. Suela de goma natural vulcanizada de máxima tracción.',
    price: 195000, discountPrice: 165000, brand: 'MOVI BASIC',
    colors: [{ name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['tenis blancos', 'urbanos', 'clasicos', 'minimalistas', 'sneakers'],
    features: ['Cuero bovino flexible de grano liso', 'Suela cosida 360° para mayor durabilidad', 'Plantilla acolchada extraíble', 'Cordones en algodón encerado'],
    inventory: 45, rating: 4.8, reviewCount: 110, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Sandalias Mule Tacón Escultural Movi',
    desc: 'Mules destalonadas con tira ancha en empeine y tacón arquitectónico geométrico de 6 cm. Equilibrio sublime entre estabilidad y distinción.',
    price: 265000, discountPrice: 225000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }],
    tags: ['mule', 'sandalias', 'tacon', 'escultural', 'diseño'],
    features: ['Tacón facetado en resina de 6 cm', 'Piel nappa ultra acolchada', 'Puntera cuadrada moderna', 'Plantilla con soporte de arco'],
    inventory: 19, rating: 4.7, reviewCount: 43, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Zapatos Oxford Acabado Artesanal',
    desc: 'Calzado formal de cordones cerrados con pespuntes en puntera y picado brogue fino. Cuero patinado a mano por artesanos expertos.',
    price: 365000, discountPrice: 315000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['oxford', 'formal', 'brogue', 'cuero', 'elegante'],
    features: ['Construcción Goodyear welted', 'Picado brogue perforado a láser', 'Horma ergonómica británica', 'Acabado patinado con cera de abejas'],
    inventory: 14, rating: 4.9, reviewCount: 39, isPopular: false, isNew: false, isOffer: false
  },
  {
    name: 'Botas Militares con Cremallera Lateral',
    desc: 'Botas de 8 ojales en cuero encerado resistente con cremallera interior para poner y quitar en segundos sin deshacer los cordones. Suela dentada.',
    price: 329000, discountPrice: 279000, brand: 'MOVI URBAN',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Ciruela Imperial', hex: '#4A154B' }],
    tags: ['botas', 'militares', 'combate', 'cremallera', 'suela dentada'],
    features: ['Cuero graneado de alto grosor 1.8mm', 'Cremallera lateral YKK metálica', 'Suela commando con aislamiento térmico', 'Puntera reforzada interior'],
    inventory: 24, rating: 4.8, reviewCount: 65, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Zapatos Derby Suela Chunky Ligera',
    desc: 'Zapatos de cordón abierto con suela de plataforma microporosa EVA ultraligera de 4 cm. Estilo contemporáneo que no pesa nada.',
    price: 289000, discountPrice: 245000, brand: 'MOVI URBAN',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['derby', 'chunky', 'plataforma', 'ligero', 'urbano'],
    features: ['Suela XL Extralight tecnológica', 'Cuero semi-brillante fácil de limpiar', 'Cordones tubulares gruesos', 'Plantilla anatómica desmontable'],
    inventory: 21, rating: 4.7, reviewCount: 48, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Tenis Slip-On Elásticos Movi Flow',
    desc: 'Calzado sin cordones de punto tejido en una sola pieza transpirable. Se ajusta como una media al pie ofreciendo sensación de libertad total.',
    price: 185000, discountPrice: 155000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda Suave', hex: '#E9E2FA' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Gris Platino', hex: '#9E9CA3' }],
    tags: ['slip on', 'sin cordones', 'tejido', 'flow', 'comodo'],
    features: ['Upper de punto FlyKnit elástico', 'Talonera acolchada que evita ampollas', 'Suela de ranuras de flexión natural', 'Lavable a máquina en ciclo suave'],
    inventory: 35, rating: 4.8, reviewCount: 89, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Sandalias de Tiras en Cuero Metalizado',
    desc: 'Sandalias planas con tiras cruzadas tubulares que abrazan el pie con delicadeza. Plantilla de cuero acolchada con espuma viscoelástica.',
    price: 199000, discountPrice: 169000, brand: 'MOVI BASIC',
    colors: [{ name: 'Dorado Mate', hex: '#C5A059' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['sandalias planas', 'tiras', 'metalizado', 'verano', 'cuero'],
    features: ['Cuero metalizado suave libre de cromo', 'Hebilla lateral con micro-elástico', 'Suela de goma antideslizante delgada', 'Plantilla acolchada de 5mm'],
    inventory: 27, rating: 4.6, reviewCount: 37, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Botas Altas de Caña Recta en Cuero Nappa',
    desc: 'Bota por debajo de la rodilla con caña amplia recta estructurada. Tacón ancho de 5 cm forrado al tono para máxima comodidad de uso diario.',
    price: 460000, discountPrice: 395000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['botas altas', 'caña recta', 'cuero nappa', 'tacon ancho', 'lujo'],
    features: ['Cuero nappa de tacto mantecoso', 'Caña estructurada que no se cae', 'Media cremallera interior para calce fácil', 'Tacón bloque estable de 5 cm'],
    inventory: 15, rating: 4.9, reviewCount: 52, isPopular: true, isNew: true, isOffer: false
  },
  {
    name: 'Mocasines con Hebilla Metálica Bitono',
    desc: 'Mocasín de silueta afilada adornado con pasador metálico frontal en acabado plata y dorado cepillado. Piel grabada imitación cocodrilo sutil.',
    price: 320000, discountPrice: 275000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['mocasines', 'hebilla', 'herraje', 'elegante', 'oficina'],
    features: ['Herraje metálico protegido contra deslustre', 'Puntera almendrada refinada', 'Plantilla de cuero con arco acolchado', 'Suela ligera con vira pulida'],
    inventory: 18, rating: 4.8, reviewCount: 41, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Tenis Running Aerodinámicos Movi Pro',
    desc: 'Calzado técnico con placa de fibra compuesta para propulsión y suela de caucho de carbono. Diseñados para corredores que buscan ritmo y ligereza.',
    price: 275000, discountPrice: 235000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['running', 'maraton', 'propulsion', 'pro', 'deportivos'],
    features: ['Placa interna de propulsión dinámica', 'Mediasuela de espuma PEBA supercrítica', 'Drop de 8mm ergonómico', 'Peso pluma de 205 gramos'],
    inventory: 26, rating: 4.9, reviewCount: 80, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Alpargatas Artesanales Suela Yute y Seda',
    desc: 'Alpargata de confección artesanal cosida a mano sobre suela trenzada de yute natural con base de goma. Capellada en mezcla de lino y seda.',
    price: 159000, discountPrice: 135000, brand: 'MOVI BASIC',
    colors: [{ name: 'Beige Arena', hex: '#D4C5B9' }, { name: 'Lavanda Suave', hex: '#E9E2FA' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['alpargatas', 'yute', 'artesanal', 'verano', 'playa'],
    features: ['Yute natural trenzado a mano', 'Costura perimetral en hilo de cáñamo reforzado', 'Plantilla acolchada en textil natural', 'Suela vulcanizada antideslizante'],
    inventory: 33, rating: 4.7, reviewCount: 49, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Zapatos de Salón Stiletto Clásico 8cm',
    desc: 'El tacón fino atemporal por excelencia en cuero acharolado flexible. Escote corazón pronunciado que alarga la pierna y puntera en punta impecable.',
    price: 295000, discountPrice: 255000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['stiletto', 'tacon fino', 'salon', 'fiesta', 'elegante'],
    features: ['Tacón stiletto reforzado con alma de acero', 'Interior forrado en piel de cabretilla', 'Almohadilla metatarsal de gel incluida', 'Puntera protegida'],
    inventory: 17, rating: 4.8, reviewCount: 62, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Zuecos de Plataforma en Madera y Cuero',
    desc: 'Zueco con plataforma tallada en madera ligera de aliso y capellada en cuero de curtido vegetal fijada con tachuelas de latón envejecido.',
    price: 245000, discountPrice: 209000, brand: 'MOVI URBAN',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Terracota', hex: '#A3523B' }],
    tags: ['zuecos', 'plataforma', 'madera', 'tachuelas', 'cuero'],
    features: ['Suela ergonómica en madera de aliso ligera', 'Tachuelas doradas clavadas a mano', 'Piel curtida con extractos vegetales', 'Base de goma amortiguadora'],
    inventory: 20, rating: 4.6, reviewCount: 31, isPopular: false, isNew: false, isOffer: true
  }
];

zapatosData.forEach((item, idx) => {
  addProduct({
    id: `prod-zap-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Zapatos',
    brand: item.brand,
    images: [`/images/products/zapatos/prod-zap-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/zapatos/prod-zap-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-25',
    categorySlug: 'zapatos'
  });
});

// 6. BOLSOS (9 productos)
const bolsosData = [
  {
    name: 'Bolso Tote Florentino Modular en Cuero',
    desc: 'Tote bag confeccionado a mano en cuero vacuno plena flor con detalles bitono en ciruela profundo y carbón. Compartimento interior acolchado para laptop de 15".',
    price: 295000, discountPrice: 265000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['bolso', 'tote', 'cuero', 'cartera', 'elegante', 'laptop'],
    features: ['Cuero bovino graneado seleccionado', 'Compartimento acolchado para laptop 15"', 'Cierre magnético de neodimio', 'Asas reforzadas con remaches'],
    inventory: 24, rating: 4.9, reviewCount: 110, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Bolso Bandolera Crossbody Minimalista',
    desc: 'Bandolera estructurada compacta con solapa delantera y correa regulable. Espacio ideal para celular, billetera, llaves y cosméticos.',
    price: 189000, discountPrice: 159000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }],
    tags: ['crossbody', 'bandolera', 'compacto', 'manos libres', 'bolso'],
    features: ['Correa ajustable en 7 posiciones', 'Bolsillo trasero de acceso rápido para smartphone', 'Forro interior en microfibra aterciopelada', 'Cierre de broche giratorio'],
    inventory: 35, rating: 4.8, reviewCount: 88, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Mochila Urbana Porta Laptop Ergonómica',
    desc: 'Mochila técnica de líneas sobrias en poliéster reciclado repelente al agua. Respaldo acolchado antitranspirante y correa para enganchar al carry-on.',
    price: 249000, discountPrice: 215000, brand: 'MOVI TECH',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Gris Platino', hex: '#9E9CA3' }],
    tags: ['mochila', 'laptop', 'ergonomica', 'impermeable', 'oficina'],
    features: ['Bolsillo flotante para laptop de hasta 16"', 'Cremalleras impermeables YKK AquaGuard', 'Banda posterior para maleta de viaje', 'Bolsillo secreto en espaldar'],
    inventory: 29, rating: 4.9, reviewCount: 95, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Bolso Clutch de Mano Sobre Rígido',
    desc: 'Cartera de mano tipo sobre con estructura metálica rígida forrada en piel nappa. Incluye cadena desmontable dorada para llevar al hombro en fiestas.',
    price: 175000, discountPrice: 145000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Dorado Mate', hex: '#C5A059' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['clutch', 'sobre', 'fiesta', 'cadena', 'noche'],
    features: ['Estructura rígida indeformable', 'Cadena serpentina metálica desmontable', 'Cierre de clip joya superior', 'Espejo de cortesía interior'],
    inventory: 22, rating: 4.7, reviewCount: 44, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Bolso Baguette Hombro Estilo 90s',
    desc: 'Silueta alargada y delgada para llevar cómodamente bajo el brazo. Asa corta curvada y cierre con solapa imantada.',
    price: 199000, discountPrice: 169000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['baguette', 'hombro', '90s', 'retro', 'tendencia'],
    features: ['Asa ergonómica de hombro fija', 'Cuero semi-rígido con acabado satinado', 'Bolsillo interior con cremallera', 'Herrajes en níquel cepillado'],
    inventory: 27, rating: 4.8, reviewCount: 60, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Bolso de Viaje Weekender en Lona Encerada',
    desc: 'Maletín de viaje amplio de 45 litros en lona de algodón encerada con refuerzos y cantoneras en cuero grueso. Diseñado para escapadas de fin de semana.',
    price: 365000, discountPrice: 310000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['weekender', 'viaje', 'lona encerada', 'cuero', 'maletin'],
    features: ['Lona escocesa de 18 oz encerada a mano', 'Compartimento lateral separado para calzado', 'Correa de hombro con almohadilla de cuero', 'Aceptado como equipaje de cabina'],
    inventory: 15, rating: 4.9, reviewCount: 53, isPopular: false, isNew: false, isOffer: false
  },
  {
    name: 'Riñonera Cruzada de Cuero Graneado',
    desc: 'Riñonera de diseño refinado pensada para llevar cruzada sobre el pecho o a la cintura. Correa de cinta gruesa con broche metálico de seguridad.',
    price: 159000, discountPrice: 135000, brand: 'MOVI URBAN',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['riñonera', 'crossbody', 'cuero', 'urbano', 'pecho'],
    features: ['100% Cuero bovino floater graneado', 'Broche de apertura rápida tipo cobra', 'Doble bolsillo con cremallera', 'Espaldar acolchado suave'],
    inventory: 31, rating: 4.7, reviewCount: 47, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Bolso Bucket Cuero Fruncido con Cierre Movi',
    desc: 'Bolso saco o bucket con base circular rígida y cierre superior mediante cordón ajustable con borlas de cuero. Asa de mano y bandolera desmontable.',
    price: 235000, discountPrice: 199000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Terracota', hex: '#A3523B' }, { name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['bucket', 'saco', 'fruncido', 'cuero', 'borlas'],
    features: ['Base circular reforzada con 4 patas metálicas', 'Cordón corredizo con tope de cuero', 'Doble opción de uso: mano o cruzado', 'Capacidad para botella de agua y tablet'],
    inventory: 23, rating: 4.8, reviewCount: 56, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Bolso Hobo Amplio en Cuero Blando',
    desc: 'Silueta relajada en media luna con caída natural suave. Gran capacidad interior para el día a día sin perder la ligereza visual.',
    price: 279000, discountPrice: 239000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Beige Arena', hex: '#D4C5B9' }],
    tags: ['hobo', 'media luna', 'amplio', 'cuero blando', 'casual'],
    features: ['Cuero de curtido vegetal extra flexible', 'Asa plana ancha que no corta el hombro', 'Bolsillo interior desmontable con cremallera', 'Cierre magnético oculto'],
    inventory: 19, rating: 4.8, reviewCount: 42, isPopular: false, isNew: true, isOffer: false
  }
];

bolsosData.forEach((item, idx) => {
  addProduct({
    id: `prod-bol-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Bolsos',
    brand: item.brand,
    images: [`/images/products/bolsos/prod-bol-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/bolsos/prod-bol-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['Única'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-26',
    categorySlug: 'bolsos'
  });
});

// 7. ACCESORIOS (15 productos)
const accesoriosData = [
  {
    name: 'Gafas de Sol Hexagonal en Titanio Geométrico',
    desc: 'Montura hexagonal ultraliviana forjada en titanio japonés ionizado. Lentes polarizadas categoría 3 con protección 100% UV400 y tratamiento antirreflejo.',
    price: 249000, discountPrice: 219000, brand: 'MOVI TECH',
    colors: [{ name: 'Gunmetal', hex: '#475569' }, { name: 'Dorado Mate', hex: '#C5A059' }],
    tags: ['gafas de sol', 'titanio', 'polarizadas', 'hexagonal', 'uv400'],
    features: ['Marco de titanio aeroespacial de 12 gramos', 'Lentes polarizadas TAC con filtro UV400', 'Plaquetas nasales de silicona médica', 'Bisagras flexibles con micro-tornillos'],
    inventory: 31, rating: 4.9, reviewCount: 94, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Reloj Inteligente Cronógrafo Cuarzo Minimalista',
    desc: 'Reloj híbrido con esfera minimalista, agujas fosforescentes y conectividad Bluetooth sutil para notificaciones de vibración y pasos.',
    price: 360000, discountPrice: 310000, brand: 'MOVI TECH',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['reloj', 'cronografo', 'cuarzo', 'smart', 'titanio'],
    features: ['Caja de acero quirúrgico 316L', 'Cristal de zafiro irrayable', 'Batería de 12 meses sin recargas diarias', 'Resistencia al agua 5 ATM (50 metros)'],
    inventory: 20, rating: 4.9, reviewCount: 78, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Cinturón Reversible en Cuero Bovino y Hebilla Mate',
    desc: 'Cinturón versátil de doble faz: morado oscuro por un lado y negro por el otro. Hebilla giratoria de metal pulido satinado sin níquel.',
    price: 119000, discountPrice: 99000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['cinturon', 'cuero', 'reversible', 'hebilla', 'accesorio'],
    features: ['Mecanismo de giro 360° en hebilla', 'Cuero vacuno plena flor teñido en profundidad', 'Bordes pulidos y pintados a mano', 'Ancho versátil de 3.2 cm'],
    inventory: 40, rating: 4.8, reviewCount: 85, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Bufanda en Cachemira Pura y Flecos Finos',
    desc: 'Bufanda extra larga tejida en 100% cachemira de las tierras altas de Mongolia. Calidez insuperable, ingravidez y acabado con flecos anudados a mano.',
    price: 189000, discountPrice: 159000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Lavanda Suave', hex: '#E9E2FA' }, { name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['bufanda', 'cachemira', 'flecos', 'invierno', 'suave'],
    features: ['100% Cachemira peinada Grado A', 'Largo generoso de 190 x 45 cm', 'Flecos de 8 cm rematados a mano', 'Tratamiento anti-pilling suave'],
    inventory: 25, rating: 4.9, reviewCount: 66, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Collar Eslabones Plata de Ley 925 Movi',
    desc: 'Cadena de eslabones ovalados de diseño contemporáneo en plata maciza 925 con baño de rodio para brillo inalterable y cierre mosquetón sobredimensionado.',
    price: 210000, discountPrice: 179000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Plata Brillante', hex: '#CBD5E1' }],
    tags: ['collar', 'cadena', 'plata 925', 'joyeria', 'eslabones'],
    features: ['Plata de ley 925 certificada', 'Baño de rodio anti-deslustre', 'Largo ajustable 45 - 50 cm', 'Cierre arquitectónico seguro'],
    inventory: 18, rating: 4.9, reviewCount: 51, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Pulsera Brazalete Rígido Bañado en Oro',
    desc: 'Brazalete abierto de perfil triangular facetado con baño de oro amarillo de 18 quilates de 3 micras. Ajustable con delicadeza a la muñeca.',
    price: 175000, discountPrice: 149000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Dorado Mate', hex: '#C5A059' }],
    tags: ['pulsera', 'brazalete', 'oro 18k', 'joyeria', 'dorado'],
    features: ['Baño de oro 18K de triple micra sobre latón', 'Hipoalergénico libre de níquel', 'Apertura flexible para calce perfecto', 'Grabado interior Movi Atelier'],
    inventory: 22, rating: 4.8, reviewCount: 43, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Gorra Urbana Bordado Movi Tonal',
    desc: 'Gorra de 6 paneles en sarga de algodón peinado con corona no estructurada y visera curva. Bordado del monograma Movi al tono en el frente.',
    price: 79000, discountPrice: 65000, brand: 'MOVI URBAN',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Beige Arena', hex: '#D4C5B9' }],
    tags: ['gorra', 'cap', 'bordado', 'urbano', 'algodon'],
    features: ['100% Sarga de algodón lavado', 'Cierre trasero de correa con hebilla de latón', 'Banda interior absorbente de sudor', 'Ojetes bordados para ventilación'],
    inventory: 48, rating: 4.7, reviewCount: 92, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Cartera Billetera Compacta Protección RFID',
    desc: 'Billetera delgada en cuero graneado con capacidad para 8 tarjetas, compartimento para billetes extendidos y lámina de bloqueo electromagnético RFID.',
    price: 109000, discountPrice: 89000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['billetera', 'cartera', 'rfid', 'cuero', 'compacta'],
    features: ['Malla protectora RFID contra clonación', 'Grosor de solo 0.8 cm vacía', 'Ranura exterior para tarjeta de transporte', 'Cuero vacuno suave'],
    inventory: 42, rating: 4.9, reviewCount: 114, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Sombrero Fedora en Fieltro de Lana',
    desc: 'Sombrero fedora de ala ancha con copa en lágrima y cinta perimetral de grogrén al tono. Fieltro de lana 100% que recupera su forma.',
    price: 195000, discountPrice: 165000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['sombrero', 'fedora', 'fieltro', 'lana', 'elegante'],
    features: ['100% Fieltro de lana peinada', 'Ala de 7.5 cm con ribete cosido', 'Cinta interior antitranspirante ajustable', 'Tratamiento hidrófugo'],
    inventory: 14, rating: 4.8, reviewCount: 30, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Pañuelo Cuadrado en Seda Estampado Floral',
    desc: 'Foulard de 70 x 70 cm en twill de seda pura con bordes enrollados a mano. Estampado digital de botánica nocturna en gradientes lavanda.',
    price: 149000, discountPrice: 125000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['pañuelo', 'seda', 'foulard', 'cuadrado', 'estampado'],
    features: ['100% Twill de seda natural de 14 momme', 'Roulotté tradicional cosido a mano', 'Brillo satinado de lujo', 'Multiuso: cuello, bolso o cabello'],
    inventory: 26, rating: 4.9, reviewCount: 58, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Gafas de Sol Estilo Aviador Retro',
    desc: 'El clásico aviador con doble puente metálico y lentes de lágrima en tono humo degradado. Montura de aleación ultrarresistente.',
    price: 219000, discountPrice: 185000, brand: 'MOVI TECH',
    colors: [{ name: 'Dorado Mate', hex: '#C5A059' }, { name: 'Gunmetal', hex: '#475569' }],
    tags: ['aviador', 'gafas de sol', 'retro', 'doble puente', 'uv400'],
    features: ['Doble puente arquitectónico', 'Lentes policarbonato resistentes a impactos', 'Terminales de varilla en acetato', 'Protección 100% UV'],
    inventory: 28, rating: 4.7, reviewCount: 61, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Anillo Sello Esculpido con Onix Negro',
    desc: 'Anillo sello geométrico en plata de ley 925 con piedra de ónix natural tallada en cabujón plano. Fuerza visual y distinción masculina o unisex.',
    price: 165000, discountPrice: 139000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Plata Brillante', hex: '#CBD5E1' }],
    tags: ['anillo', 'sello', 'onix', 'plata 925', 'joyeria'],
    features: ['Piedra natural de ónix negro auténtico', 'Cuerpo de plata maciza no hueca', 'Acabado cepillado satinado', 'Incluye estuche de terciopelo'],
    inventory: 16, rating: 4.9, reviewCount: 48, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Guantes de Conducir en Piel de Cordero',
    desc: 'Guantes ergonómicos con perforaciones para transpiración y cierre con botón de presión en muñeca. Confeccionados en suave piel de cordero italiana.',
    price: 189000, discountPrice: 159000, brand: 'MOVI LEATHER CRAFT',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['guantes', 'piel de cordero', 'conducir', 'perforados', 'cuero'],
    features: ['Piel de cordero de máximo tacto y agarre', 'Nudillos con aberturas anatómicas', 'Puntas compatibles con pantallas táctiles', 'Cierre con broche a presión'],
    inventory: 19, rating: 4.8, reviewCount: 36, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Aretes Pendientes Escultóricos Asimétricos',
    desc: 'Pareja de pendientes con diseño orgánico inspirado en esculturas móviles abstractas. Livianos al uso gracias a su interior ahuecado al vacío.',
    price: 139000, discountPrice: 119000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Dorado Mate', hex: '#C5A059' }, { name: 'Plata Brillante', hex: '#CBD5E1' }],
    tags: ['aretes', 'pendientes', 'escultoricos', 'asimetricos', 'joyeria'],
    features: ['Técnica de electroformado liviano', 'Poste de plata 925 hipoalergénico', 'Cierre a presión tipo mariposa seguro', 'Acabado pulido espejo'],
    inventory: 24, rating: 4.8, reviewCount: 40, isPopular: false, isNew: true, isOffer: true
  },
  {
    name: 'Tirantes Elásticos Sastre con Pasadores de Cuero',
    desc: 'Tirantes en forma de Y con cinta elástica de 3.5 cm de ancho, pasadores de cuero genuino para abotonar al pantalón e inserciones de clips opcionales.',
    price: 115000, discountPrice: 95000, brand: 'ATELIER MOVI',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['tirantes', 'sastre', 'cuero', 'botones', 'formal'],
    features: ['Doble sistema: botón o pinza metálica', 'Cinta elástica de alta densidad que no se deforma', 'Unión dorsal en cuero cosido a mano', 'Reguladores de longitud metálicos'],
    inventory: 22, rating: 4.7, reviewCount: 29, isPopular: false, isNew: false, isOffer: false
  }
];

accesoriosData.forEach((item, idx) => {
  addProduct({
    id: `prod-acc-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Accesorios',
    brand: item.brand,
    images: [`/images/products/accesorios/prod-acc-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/accesorios/prod-acc-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['Única'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-27',
    categorySlug: 'accesorios'
  });
});

// 8. ROPA DEPORTIVA (11 productos)
const ropaDeportivaData = [
  {
    name: 'Set Deportivo Compresión Pro Térmica Movi',
    desc: 'Conjunto completo de top y leggings de compresión gradual en poliamida reciclada. Regulación térmica activa y soporte muscular durante entrenamientos.',
    price: 249000, discountPrice: 209000, brand: 'MOVI TECH',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['set deportivo', 'conjunto', 'compresion', 'fitness', 'activewear'],
    features: ['Tejido seamless sin costuras perjudiciales', 'Compresión zonal graduada', 'Banda de cintura reforzada de 12 cm', 'Cero transparencias test squat-proof'],
    inventory: 33, rating: 4.9, reviewCount: 124, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Leggings Cintura Alta Efecto Segunda Piel',
    desc: 'Mallas deportivas ultra elásticas sin costura frontal. Tejido microcepillado de tacto aterciopelado que abraza el cuerpo sin apretar.',
    price: 149000, discountPrice: 125000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Verde Oliva', hex: '#3F4E3C' }],
    tags: ['leggings', 'mallas', 'segunda piel', 'yoga', 'cintura alta'],
    features: ['Cintura alta ergonómica anti-deslizamiento', 'Bolsillo invisible interior para llave o tarjeta', 'Tejido elástico en 4 direcciones 280g', 'Largo al tobillo 7/8'],
    inventory: 46, rating: 4.9, reviewCount: 135, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Top Deportivo Soporte Medio Espalda Cruzada',
    desc: 'Sujetador deportivo con tirantes dobles cruzados en la espalda que distribuyen el peso. Almohadillas extraíbles transpirables y banda inferior ancha.',
    price: 99000, discountPrice: 82000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['top deportivo', 'bra', 'soporte medio', 'espalda cruzada', 'entrenamiento'],
    features: ['Soporte medio ideal para running y crossfit', 'Copas extraíbles microperforadas', 'Tejido antibacterial de secado rápido', 'Tirantes elásticos que no se clavan'],
    inventory: 41, rating: 4.8, reviewCount: 88, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Shorts Running Livianos con Malla Interior',
    desc: 'Pantalón corto de entrenamiento 2 en 1 con short de compresión interior que previene rozaduras. Tejido exterior microperforado ultra ligero.',
    price: 119000, discountPrice: 99000, brand: 'MOVI TECH',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }],
    tags: ['shorts', 'running', 'malla interior', '2 en 1', 'liviano'],
    features: ['Short interior con bolsillo para celular', 'Bolsillo trasero con cremallera para llaves', 'Cintura elástica con cordón interior plano', 'Aberturas laterales para zancada libre'],
    inventory: 38, rating: 4.8, reviewCount: 72, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Buzo Hoodie Deportivo Transpirable Capucha',
    desc: 'Sudadera técnica con capucha de 3 paneles y orificios para el pulgar en los puños. Interior en micropolar cepillado que abriga sin sobrecalentar.',
    price: 179000, discountPrice: 149000, brand: 'MOVI TECH',
    colors: [{ name: 'Morado Noche', hex: '#30234F' }, { name: 'Gris Platino', hex: '#9E9CA3' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['hoodie', 'buzo', 'capucha', 'deportivo', 'pulgares'],
    features: ['Capucha ergonómica con cuello alto protector', 'Puños con aberturas para pulgares', 'Bolsillo canguro con compartimento oculto', 'Tejido elástico de alta densidad'],
    inventory: 28, rating: 4.9, reviewCount: 65, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Camiseta Técnica de Alto Rendimiento Dry-Fit',
    desc: 'Camiseta de corte atlético con paneles de ventilación mapeados en espalda y laterales. Elimina la humedad al instante manteniéndote seco.',
    price: 89000, discountPrice: 75000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['dry fit', 'transpirable', 'camiseta tecnica', 'maraton', 'gym'],
    features: ['Fibras con tecnología MoviDry hidrofílica', 'Costuras planas que no irritan la piel', 'Tratamiento antimicrobiano de iones', 'Ultraligera de solo 110 gramos'],
    inventory: 50, rating: 4.8, reviewCount: 112, isPopular: true, isNew: false, isOffer: true
  },
  {
    name: 'Chaqueta Rompevientos de Entrenamiento Reflectiva',
    desc: 'Chaqueta ligera para correr al amanecer o de noche con líneas reflectivas 360 grados. Repele viento y llovizna con ventilación dorsal cubierta.',
    price: 210000, discountPrice: 179000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['rompevientos', 'reflectiva', 'running nocturno', 'entrenamiento'],
    features: ['Detalles reflectantes visibles a más de 200m', 'Abertura dorsal para evacuación de calor', 'Cremallera frontal con protector de barbilla', 'Bolsillos laterales con cremallera'],
    inventory: 24, rating: 4.8, reviewCount: 54, isPopular: false, isNew: true, isOffer: false
  },
  {
    name: 'Enterizo Deportivo Seamless Esculpido',
    desc: 'Mono o jumpsuit enterizo de una sola pieza sin costuras laterales. Esculpe y sujeta con elegancia para sesiones de yoga, pilates o barra.',
    price: 219000, discountPrice: 185000, brand: 'MOVI TECH',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Morado Noche', hex: '#30234F' }],
    tags: ['enterizo', 'jumpsuit', 'seamless', 'yoga', 'pilates'],
    features: ['Estructura integral sin costura de cintura', 'Espalda descubierta con tirantes dobles', 'Copas moldeadoras desmontables', 'Tejido opaco de sujeción firme'],
    inventory: 19, rating: 4.9, reviewCount: 48, isPopular: true, isNew: true, isOffer: true
  },
  {
    name: 'Pantalón Jogger Entrenamiento con Puños Rib',
    desc: 'Pantalón deportivo ajustado en tobillo con tejido técnico elástico impermeable a salpicaduras. Cintura con cordón plano y bolsillos profundos.',
    price: 169000, discountPrice: 139000, brand: 'MOVI TECH',
    colors: [{ name: 'Obsidiana', hex: '#25232B' }, { name: 'Gris Platino', hex: '#9E9CA3' }],
    tags: ['jogger deportivo', 'entrenamiento', 'gym', 'puños rib', 'comodo'],
    features: ['Tejido French Terry de alta elasticidad', 'Bolsillo lateral para smartphone con cierre', 'Rodillas con costuras anatómicas', 'Cintura con cordón elástico'],
    inventory: 34, rating: 4.7, reviewCount: 67, isPopular: false, isNew: false, isOffer: true
  },
  {
    name: 'Camisilla Deportiva Tirantes Siliconados',
    desc: 'Camisilla de tirantes finos con inserción interna de silicona para evitar deslizamientos al saltar o agacharse. Espalda tipo nadador.',
    price: 79000, discountPrice: 65000, brand: 'MOVI TECH',
    colors: [{ name: 'Lavanda Suave', hex: '#E9E2FA' }, { name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['camisilla', 'tank', 'nadador', 'yoga', 'tirantes'],
    features: ['Banda de agarre siliconado interior', 'Espalda atlética para omóplatos libres', 'Tejido antibacterial MoviFresh', 'Largo que cubre la cadera'],
    inventory: 39, rating: 4.8, reviewCount: 52, isPopular: false, isNew: false, isOffer: false
  },
  {
    name: 'Falda Short Deportiva Tenis y Pádel',
    desc: 'Falda de pliegues deportivos con pantalón corto interior de compresión que incluye bolsillo invertido para guardar pelotas de tenis o pádel.',
    price: 139000, discountPrice: 115000, brand: 'MOVI TECH',
    colors: [{ name: 'Blanco Lunar', hex: '#FFFFFF' }, { name: 'Lavanda / Violeta', hex: '#7656D6' }, { name: 'Obsidiana', hex: '#25232B' }],
    tags: ['falda short', 'tenis', 'padel', 'skirt', 'deportiva'],
    features: ['Short interior con bolsillo para 2 pelotas', 'Pliegues asimétricos con vuelo dinámico', 'Cintura alta compresiva favorecedora', 'Tejido elástico ultraligero'],
    inventory: 26, rating: 4.9, reviewCount: 61, isPopular: true, isNew: true, isOffer: true
  }
];

ropaDeportivaData.forEach((item, idx) => {
  addProduct({
    id: `prod-dep-${idx + 1}`,
    name: item.name,
    description: item.desc,
    price: item.price,
    discountPrice: item.discountPrice,
    category: 'Ropa deportiva',
    brand: item.brand,
    images: [`/images/products/ropa-deportiva/prod-dep-${idx + 1}-${slugify(item.colors[0].name)}.jpg`],
    colorImages: Object.fromEntries(
      item.colors.map(c => [c.name, [`/images/products/ropa-deportiva/prod-dep-${idx + 1}-${slugify(c.name)}.jpg`]])
    ),
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: item.colors,
    inventory: item.inventory,
    rating: item.rating,
    reviewCount: item.reviewCount,
    isPopular: item.isPopular,
    isNew: item.isNew,
    isOffer: item.isOffer,
    tags: item.tags,
    features: item.features,
    createdAt: '2026-10-28',
    categorySlug: 'ropa-deportiva'
  });
});

console.log(`Total Products defined: ${FULL_PRODUCTS.length}`);

// Category count check
const counts = {};
FULL_PRODUCTS.forEach(p => {
  counts[p.category] = (counts[p.category] || 0) + 1;
});
console.log('Category Counts:', counts);

// -------------------------------------------------------------
// GENERATE ALL IMAGES USING RSVG-CONVERT + CONVERT
// -------------------------------------------------------------
let totalImages = 0;
for (let pIdx = 0; pIdx < FULL_PRODUCTS.length; pIdx++) {
  const prod = FULL_PRODUCTS[pIdx];
  for (const col of prod.colors) {
    const colSlug = slugify(col.name);
    const targetPath = path.join(process.cwd(), 'public', 'images', 'products', prod.categorySlug, `${prod.id}-${colSlug}.jpg`);
    
    // Generate clean SVG
    const svg = renderProductSVG(prod.categorySlug, pIdx, col.hex);
    
    // Pipe to rsvg-convert & imagemagick convert
    try {
      execSync(`rsvg-convert -w 600 -h 600 | convert - -quality 82 "${targetPath}"`, {
        input: svg,
        stdio: ['pipe', 'pipe', 'inherit'],
      });
      totalImages++;
    } catch (err) {
      console.error(`Error rendering ${targetPath}:`, err.message);
    }
  }
}

console.log(`Successfully generated ${totalImages} product variant images!`);

// -------------------------------------------------------------
// WRITE OUT UPDATED src/data/mockProducts.ts
// -------------------------------------------------------------
const mockProductsCode = `import { Product, ProductCategory } from '../types';

export const HERO_BANNER_IMAGE = '/images/hero_fashion_editorial.jpg';
export const SNEAKERS_IMAGE = '/images/products/zapatos/prod-zap-1-lavanda-violeta.jpg';
export const JACKET_IMAGE = '/images/products/chaquetas/prod-cha-1-morado-noche.jpg';
export const BAG_IMAGE = '/images/products/bolsos/prod-bol-1-morado-noche.jpg';

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(FULL_PRODUCTS, null, 2)};

export const INITIAL_CATEGORIES: ProductCategory[] = [
  { id: 'cat-1', name: 'Camisetas', slug: 'camisetas', description: 'Esenciales urbanos, cortes sastre y siluetas contemporáneas', iconName: 'Shirt', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Camisetas').length },
  { id: 'cat-2', name: 'Pantalones', slug: 'pantalones', description: 'Cortes rectos, cargos utilitarios y sastrería moderna', iconName: 'Layers', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Pantalones').length },
  { id: 'cat-3', name: 'Vestidos', slug: 'vestidos', description: 'Siluetas fluidas, asimétricas y minimalismo moderno', iconName: 'Sparkles', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Vestidos').length },
  { id: 'cat-4', name: 'Chaquetas', slug: 'chaquetas', description: 'Blazers estructurados, bombers y abrigos de temporada', iconName: 'Wind', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Chaquetas').length },
  { id: 'cat-5', name: 'Zapatos', slug: 'zapatos', description: 'Calzado ergonómico, mocasines y tenis urbanos de alto confort', iconName: 'Footprints', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Zapatos').length },
  { id: 'cat-6', name: 'Bolsos', slug: 'bolsos', description: 'Totes artesanales en cuero, mochilas modulares y bandoleras', iconName: 'ShoppingBag', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Bolsos').length },
  { id: 'cat-7', name: 'Accesorios', slug: 'accesorios', description: 'Gafas de titanio, joyería sutil y complementos de distinción', iconName: 'Watch', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Accesorios').length },
  { id: 'cat-8', name: 'Ropa deportiva', slug: 'ropa-deportiva', description: 'Prendas seamless térmicas y compresión activewear de alto rendimiento', iconName: 'Flame', itemCount: INITIAL_PRODUCTS.filter(p => p.category === 'Ropa deportiva').length },
];

export const DEMO_USER = {
  id: 'usr-demo-sofia',
  name: 'Sofía Valderrama',
  email: 'cliente@movifashion.ai',
  role: 'cliente' as const,
  addresses: [
    {
      id: 'addr-1',
      recipientName: 'Sofía Valderrama',
      street: 'Carrera 43A # 18 Sur - 122, Edificio Santillana Apto 904',
      city: 'Medellín',
      department: 'Antioquia',
      postalCode: '050022',
      phone: '+57 312 890 4421',
      isDefault: true,
    },
  ],
};

export const DEMO_ADMIN = {
  id: 'usr-admin-valen',
  name: 'Administrador MOVIFASHION',
  email: 'admin@movifashion.ai',
  role: 'admin' as const,
  addresses: [],
};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'mockProducts.ts'), mockProductsCode, 'utf8');
console.log('src/data/mockProducts.ts generated successfully with exact 95 products and dynamic category counters!');
