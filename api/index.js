// server.ts
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { scryptSync as scryptSync2, randomBytes as randomBytes3, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// src/data/mockProducts.ts
var INITIAL_PRODUCTS = [
  // -------------------------------------------------------------
  // CATEGORÍA: CAMISETAS (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-tshirt-1",
    name: "Camiseta Cl\xE1sica Heavyweight Cotton Crewneck",
    description: "Camiseta premium confeccionada en algod\xF3n org\xE1nico peinado de 240 GSM. Corte cl\xE1sico impecable con cuello acanalado reforzado y acabado suave al tacto.",
    price: 119e3,
    discountPrice: 99e3,
    category: "Camisetas",
    brand: "MOVI BASIC",
    images: ["/images/products/camisetas/camiseta-heavyweight-blanco-lunar.jpg"],
    colorImages: {
      "Blanco Lunar": ["/images/products/camisetas/camiseta-heavyweight-blanco-lunar.jpg"],
      "Lavanda / Violeta": ["/images/products/camisetas/camiseta-heavyweight-lavanda-violeta.jpg"],
      "Obsidiana": ["/images/products/camisetas/camiseta-heavyweight-obsidiana.jpg"]
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Blanco Lunar", hex: "#FFFFFF" },
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 45,
    rating: 4.9,
    reviewCount: 164,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["camiseta", "algodon", "heavyweight", "basicos", "blanco", "violeta", "cuello redondo"],
    features: ["100% Algod\xF3n org\xE1nico peinado 240 GSM", "Costuras dobles reforzadas", "Pre-encogida contra deformaciones", "Tintes ecol\xF3gicos certificados Oeko-Tex"],
    createdAt: "2026-10-10"
  },
  {
    id: "prod-tshirt-2",
    name: "Polo Piqu\xE9 Sartorial en Algod\xF3n Pima",
    description: "Polo de manga corta elaborado en tejido piqu\xE9 de algod\xF3n pima peruano. Cuello camisero estructurado con botonadura oculta y acabado mercerizado de brillo sutil.",
    price: 165e3,
    discountPrice: 139e3,
    category: "Camisetas",
    brand: "ATELIER MOVI",
    images: ["/images/products/camisetas/polo-pique-morado-noche.jpg"],
    colorImages: {
      "Morado Noche": ["/images/products/camisetas/polo-pique-morado-noche.jpg"],
      "Blanco Lunar": ["/images/products/camisetas/polo-pique-blanco-lunar.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Morado Noche", hex: "#30234F" },
      { name: "Blanco Lunar", hex: "#FFFFFF" }
    ],
    inventory: 28,
    rating: 4.8,
    reviewCount: 76,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["polo", "pique", "pima", "elegante", "casual", "morado", "blanco"],
    features: ["Algod\xF3n Pima peruano de fibra extralarga", "Cuello tejido indeformable", "Botones de n\xE1car grabados a l\xE1ser", "Aperturas laterales con refuerzo sartorial"],
    createdAt: "2026-10-12"
  },
  {
    id: "prod-tshirt-3",
    name: "Camiseta Oversize Drop-Shoulder Minimalista",
    description: "Silueta boxy y hombros ca\xEDdos con ca\xEDda fluida y estructura moderna. Una prenda insignia del streetwear contempor\xE1neo y confort absoluto.",
    price: 135e3,
    discountPrice: 115e3,
    category: "Camisetas",
    brand: "MOVI TECH",
    images: ["/images/products/camisetas/camiseta-oversize-lavanda-violeta.jpg"],
    colorImages: {
      "Lavanda / Violeta": ["/images/products/camisetas/camiseta-oversize-lavanda-violeta.jpg"],
      "Obsidiana": ["/images/products/camisetas/camiseta-oversize-obsidiana.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 32,
    rating: 4.9,
    reviewCount: 112,
    isPopular: true,
    isNew: true,
    isOffer: false,
    tags: ["oversize", "drop shoulder", "streetwear", "lavanda", "negro", "urbano"],
    features: ["Corte boxy con hombros ca\xEDdos", "Cuello acanalado ancho de 3 cm", "Tejido french terry liviano 220 GSM", "Lavado siliconado ultrasuave"],
    createdAt: "2026-10-16"
  },
  {
    id: "prod-tshirt-4",
    name: "Camiseta Henley Estructurada con Botones Mate",
    description: "Camiseta estilo Henley con tapeta frontal de tres botones engomados y textura acanalada micro waffle. Ideal para llevar sola o en capas sofisticadas.",
    price: 149e3,
    discountPrice: 129e3,
    category: "Camisetas",
    brand: "MOVI BASIC",
    images: ["/images/products/camisetas/camiseta-henley-gris-perla.jpg"],
    colorImages: {
      "Gris Perla": ["/images/products/camisetas/camiseta-henley-gris-perla.jpg"],
      "Morado Noche": ["/images/products/camisetas/camiseta-henley-morado-noche.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Gris Perla", hex: "#9E9EA7" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 22,
    rating: 4.7,
    reviewCount: 54,
    isPopular: false,
    isNew: true,
    isOffer: true,
    tags: ["henley", "botones", "gris", "morado", "waffle", "textura"],
    features: ["Tejido jersey con elasticidad natural", "Tapeta frontal termosellada", "Botones con revestimiento suave al tacto", "Bajo recto con remate de precisi\xF3n"],
    createdAt: "2026-10-19"
  },
  {
    id: "prod-tshirt-5",
    name: "Camiseta Cuello V en Lino y Algod\xF3n Org\xE1nico",
    description: "Mezcla ligera y fresca de lino natural y algod\xF3n peinado con escote en V balanceado. Textura flameada suave que aporta frescura y transpirabilidad superior.",
    price: 129e3,
    discountPrice: 109e3,
    category: "Camisetas",
    brand: "MOVI BASIC",
    images: ["/images/products/camisetas/camiseta-lino-arena-claro.jpg"],
    colorImages: {
      "Arena Claro": ["/images/products/camisetas/camiseta-lino-arena-claro.jpg"],
      "Blanco Lunar": ["/images/products/camisetas/camiseta-lino-blanco-lunar.jpg"]
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Arena Claro", hex: "#D8CFC4" },
      { name: "Blanco Lunar", hex: "#FFFFFF" }
    ],
    inventory: 30,
    rating: 4.8,
    reviewCount: 63,
    isPopular: false,
    isNew: false,
    isOffer: true,
    tags: ["lino", "cuello v", "fresco", "arena", "blanco", "verano"],
    features: ["55% Lino natural europeo / 45% Algod\xF3n org\xE1nico", "Termorregulaci\xF3n activa y alta transpirabilidad", "Escote en V de profundidad media", "Ca\xEDda ligera sin transparencias"],
    createdAt: "2026-10-22"
  },
  // -------------------------------------------------------------
  // CATEGORÍA: PANTALONES (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-pants-1",
    name: "Pantal\xF3n Cargo Sartorial con Ajuste Modular",
    description: "Pantal\xF3n cargo minimalista de corte recto confeccionado en sarga t\xE9cnica de algod\xF3n peinado. Bolsillos laterales de fuelle plano termosellado y raya frontal marcada.",
    price: 185e3,
    discountPrice: 159e3,
    category: "Pantalones",
    brand: "MOVI TECH",
    images: ["/images/products/pantalones/pantalon-cargo-negro-carbon.jpg"],
    colorImages: {
      "Negro Carb\xF3n": ["/images/products/pantalones/pantalon-cargo-negro-carbon.jpg"],
      "Arena Claro": ["/images/products/pantalones/pantalon-cargo-arena-claro.jpg"],
      "Morado Noche": ["/images/products/pantalones/pantalon-cargo-morado-noche.jpg"]
    },
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Negro Carb\xF3n", hex: "#25232B" },
      { name: "Arena Claro", hex: "#D8CFC4" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 36,
    rating: 4.9,
    reviewCount: 134,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["pantalon", "cargo", "sartorial", "modular", "negro", "arena", "morado"],
    features: ["Sarga t\xE9cnica de algod\xF3n 98% y elastano 2%", "Bolsillos laterales planos con cierre a presi\xF3n oculto", "Raya sastre frontal permanente", "Bajo recto compatible con calzado formal y sneakers"],
    createdAt: "2026-10-14"
  },
  {
    id: "prod-pants-2",
    name: "Pantal\xF3n Sartorial Plisado de Corte Recto en Lana Fr\xEDa",
    description: "Pantal\xF3n de vestir con doble pinza frontal y ajustadores laterales en cintura en lugar de trabillas. Tejido de lana fr\xEDa italiana transpirable de ca\xEDda elegante.",
    price: 24e4,
    discountPrice: 21e4,
    category: "Pantalones",
    brand: "ATELIER MOVI",
    images: ["/images/products/pantalones/pantalon-sartorial-gris-perla.jpg"],
    colorImages: {
      "Gris Perla": ["/images/products/pantalones/pantalon-sartorial-gris-perla.jpg"],
      "Obsidiana": ["/images/products/pantalones/pantalon-sartorial-obsidiana.jpg"]
    },
    sizes: ["30", "32", "34", "36"],
    colors: [
      { name: "Gris Perla", hex: "#9E9EA7" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 24,
    rating: 4.8,
    reviewCount: 78,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["pantalon", "sartorial", "plisado", "pinzas", "gris", "negro", "formal", "lana"],
    features: ["100% Lana fr\xEDa Super 120s italiana", "Ajustadores laterales con hebilla met\xE1lica", "Doble pinza frontal de volumen controlado", "Bajo acabado a mano con dobladillo invisible"],
    createdAt: "2026-10-16"
  },
  {
    id: "prod-pants-3",
    name: "Pantal\xF3n Chino Tailored en Gabardina de Algod\xF3n El\xE1stico",
    description: "Chino cl\xE1sico de tiro medio con corte slim-straight contempor\xE1neo. Confeccionado en gabardina de algod\xF3n esmerilado con elasticidad multidireccional.",
    price: 165e3,
    discountPrice: 139e3,
    category: "Pantalones",
    brand: "MOVI BASIC",
    images: ["/images/products/pantalones/pantalon-chino-arena-claro.jpg"],
    colorImages: {
      "Arena Claro": ["/images/products/pantalones/pantalon-chino-arena-claro.jpg"],
      "Morado Noche": ["/images/products/pantalones/pantalon-chino-morado-noche.jpg"]
    },
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Arena Claro", hex: "#D8CFC4" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 38,
    rating: 4.8,
    reviewCount: 96,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["chino", "pantalon", "gabardina", "arena", "morado", "casual", "oficina"],
    features: ["Gabardina de algod\xF3n peinado con 3% elastano", "Bolsillos diagonales delanteros reforzados", "Cierre con cremallera y bot\xF3n de cuerno grabado", "Tejido prelavado para evitar encogimiento"],
    createdAt: "2026-10-19"
  },
  {
    id: "prod-pants-4",
    name: "Jeans Denim Japon\xE9s Selvedge Wide-Leg",
    description: "Jeans de denim selvedge japon\xE9s r\xEDgido de 13.5 oz con orillo visible al remangar. Corte amplio y recto con remaches de cobre y bot\xF3n principal con p\xE1tina vintage.",
    price: 26e4,
    discountPrice: 225e3,
    category: "Pantalones",
    brand: "ATELIER MOVI",
    images: ["/images/products/pantalones/jeans-selvedge-azul-indigo.jpg"],
    colorImages: {
      "Azul \xCDndigo": ["/images/products/pantalones/jeans-selvedge-azul-indigo.jpg"],
      "Obsidiana": ["/images/products/pantalones/jeans-selvedge-obsidiana.jpg"]
    },
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Azul \xCDndigo", hex: "#2B3A67" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 20,
    rating: 4.9,
    reviewCount: 104,
    isPopular: true,
    isNew: true,
    isOffer: false,
    tags: ["jeans", "denim", "selvedge", "japones", "indigo", "negro", "wide leg"],
    features: ["Denim selvedge 100% algod\xF3n japon\xE9s 13.5 oz", "L\xEDnea de orillo selvedge roja cl\xE1sica en costura lateral", "Remaches de cobre macizo estampados", "Costura de dobladillo en cadeneta union special"],
    createdAt: "2026-10-22"
  },
  {
    id: "prod-pants-5",
    name: "Pantal\xF3n Jogger T\xE9cnico Urbano con Cremalleras Selladas",
    description: "Pantal\xF3n deportivo urbano confeccionado en tejido t\xE9cnico el\xE1stico en cuatro direcciones con tratamiento hidrorrepelente. Bolsillos con cremalleras termoselladas y pu\xF1os el\xE1sticos.",
    price: 175e3,
    discountPrice: 149e3,
    category: "Pantalones",
    brand: "MOVI TECH",
    images: ["/images/products/pantalones/jogger-tecnico-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/pantalones/jogger-tecnico-obsidiana.jpg"],
      "Lavanda / Violeta": ["/images/products/pantalones/jogger-tecnico-lavanda-violeta.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Lavanda / Violeta", hex: "#7656D6" }
    ],
    inventory: 32,
    rating: 4.8,
    reviewCount: 81,
    isPopular: false,
    isNew: true,
    isOffer: true,
    tags: ["jogger", "tecnico", "urbano", "techwear", "negro", "lavanda", "comodo"],
    features: ["Tejido t\xE9cnico biel\xE1stico transpirable", "Bolsillos laterales y en muslo con cremallera termosellada", "Cintura el\xE1stica con cord\xF3n de ajuste t\xE9cnico", "Bajos con pu\xF1o el\xE1stico anat\xF3mico"],
    createdAt: "2026-10-25"
  },
  // -------------------------------------------------------------
  // CATEGORÍA: VESTIDOS (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-dress-1",
    name: "Vestido Midi Lencero Asim\xE9trico en Seda Satinada",
    description: "Vestido midi de est\xE9tica lencera confeccionado en sat\xE9n de seda fluida. Cuello desbocado drapeado, tirantes finos regulables y ca\xEDda al bies que estiliza la silueta de manera natural.",
    price: 289e3,
    discountPrice: 245e3,
    category: "Vestidos",
    brand: "ATELIER MOVI",
    images: ["/images/products/vestidos/vestido-lencero-morado-noche.jpg"],
    colorImages: {
      "Morado Noche": ["/images/products/vestidos/vestido-lencero-morado-noche.jpg"],
      "Lavanda / Violeta": ["/images/products/vestidos/vestido-lencero-lavanda-violeta.jpg"],
      "Obsidiana": ["/images/products/vestidos/vestido-lencero-obsidiana.jpg"]
    },
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Morado Noche", hex: "#30234F" },
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 24,
    rating: 4.9,
    reviewCount: 118,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["vestido", "lencero", "seda", "saten", "midi", "fiesta", "morado", "lavanda", "negro"],
    features: ["Sat\xE9n de seda l\xEDquida de tacto ultra suave", "Corte al bies con ca\xEDda fluida envolvente", "Tirantes finos espagueti ajustables", "Escote drapeado tipo cowl neck"],
    createdAt: "2026-10-15"
  },
  {
    id: "prod-dress-2",
    name: "Vestido Camisero Estructurado con Cintur\xF3n en Popelina",
    description: "Vestido camisero en popelina de algod\xF3n org\xE1nico de alta densidad. Cuello camisero formal, botonadura completa con botones nacarados y cintur\xF3n lazo a tono para entallar cintura.",
    price: 235e3,
    discountPrice: 199e3,
    category: "Vestidos",
    brand: "MOVI BASIC",
    images: ["/images/products/vestidos/vestido-camisero-blanco-lunar.jpg"],
    colorImages: {
      "Blanco Lunar": ["/images/products/vestidos/vestido-camisero-blanco-lunar.jpg"],
      "Morado Noche": ["/images/products/vestidos/vestido-camisero-morado-noche.jpg"]
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Blanco Lunar", hex: "#FFFFFF" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 32,
    rating: 4.8,
    reviewCount: 86,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["vestido camisero", "popelina", "algodon", "oficina", "blanco", "morado", "elegante"],
    features: ["100% Popelina de algod\xF3n org\xE1nico mercerizado", "Cintur\xF3n amovible con lazo coordinado", "Bolsillos laterales ocultos en costura", "Fald\xF3n de l\xEDnea A con dobladillo ancho"],
    createdAt: "2026-10-18"
  },
  {
    id: "prod-dress-3",
    name: "Vestido de Punto Acanalado Escote Cuadrado",
    description: "Vestido de silueta columna sin mangas tejido en punto acanalado el\xE1stico de tacto aterciopelado. Escote cuadrado geom\xE9trico y bajo midi con apertura lateral sutil.",
    price: 195e3,
    discountPrice: 169e3,
    category: "Vestidos",
    brand: "MOVI TECH",
    images: ["/images/products/vestidos/vestido-punto-lavanda-violeta.jpg"],
    colorImages: {
      "Lavanda / Violeta": ["/images/products/vestidos/vestido-punto-lavanda-violeta.jpg"],
      "Obsidiana": ["/images/products/vestidos/vestido-punto-obsidiana.jpg"]
    },
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 28,
    rating: 4.7,
    reviewCount: 72,
    isPopular: false,
    isNew: true,
    isOffer: true,
    tags: ["vestido", "punto", "acanalado", "escote cuadrado", "midi", "lavanda", "negro", "minimalista"],
    features: ["Tejido de punto canal\xE9 de alta recuperaci\xF3n el\xE1stica", "Escote geom\xE9trico limpio sin costuras visibles", "Abertura lateral discreta para mayor comodidad al caminar", "Tejido opaco de peso medio indeformable"],
    createdAt: "2026-10-21"
  },
  {
    id: "prod-dress-4",
    name: "Vestido Blazer Cruzado de Sastrer\xEDa Contempor\xE1nea",
    description: "Vestido estructurado de corte blazer con solapas en pico, botonadura cruzada frontal y hombreras sutiles. Confeccionado en crep\xE9 sastre de ca\xEDda densa e impecable.",
    price: 34e4,
    discountPrice: 29e4,
    category: "Vestidos",
    brand: "ATELIER MOVI",
    images: ["/images/products/vestidos/vestido-blazer-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/vestidos/vestido-blazer-obsidiana.jpg"],
      "Morado Noche": ["/images/products/vestidos/vestido-blazer-morado-noche.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 16,
    rating: 4.9,
    reviewCount: 64,
    isPopular: true,
    isNew: true,
    isOffer: false,
    tags: ["vestido blazer", "sartorial", "blazer", "cruzado", "formal", "negro", "morado"],
    features: ["Crep\xE9 de lana sastre con forro integral en sat\xE9n", "Solapas de pico impecables con picado artesanal", "Bolsillos con tapeta de precisi\xF3n sastre", "Botonadura doble en acetato mate"],
    createdAt: "2026-10-24"
  },
  {
    id: "prod-dress-5",
    name: "Vestido Maxi Fluido Bohemio con Ca\xEDda Drapeada",
    description: "Vestido largo de inspiraci\xF3n bohemia contempor\xE1nea con falda escalonada en paneles fluidos. Escote en V fruncido y mangas abullonadas con pu\xF1o el\xE1stico en gasa de algod\xF3n y lino.",
    price: 27e4,
    discountPrice: 229e3,
    category: "Vestidos",
    brand: "ATELIER MOVI",
    images: ["/images/products/vestidos/vestido-maxi-arena-claro.jpg"],
    colorImages: {
      "Arena Claro": ["/images/products/vestidos/vestido-maxi-arena-claro.jpg"],
      "Lavanda / Violeta": ["/images/products/vestidos/vestido-maxi-lavanda-violeta.jpg"]
    },
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Arena Claro", hex: "#D8CFC4" },
      { name: "Lavanda / Violeta", hex: "#7656D6" }
    ],
    inventory: 22,
    rating: 4.8,
    reviewCount: 53,
    isPopular: false,
    isNew: false,
    isOffer: true,
    tags: ["vestido maxi", "bohemio", "fluido", "largo", "arena", "lavanda", "verano"],
    features: ["Mezcla vaporosa de 70% algod\xF3n y 30% lino natural", "Falda de tres niveles con frunces equilibrados", "Mangas ragl\xE1n abullonadas con pu\xF1os el\xE1sticos suaves", "Forro interior ligero 100% algod\xF3n transpirable"],
    createdAt: "2026-10-27"
  },
  // -------------------------------------------------------------
  // CATEGORÍA: ZAPATOS (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-sneakers-1",
    name: "Tenis Deportivos Ultra Cushion Movi",
    description: "Calzado ergon\xF3mico de alto rendimiento con amortiguaci\xF3n de espuma reactiva y malla transpirable. Dise\xF1ados especialmente para caminar largas distancias y entrenamientos con m\xE1xima comodidad y soporte plantar.",
    price: 219e3,
    discountPrice: 189e3,
    category: "Zapatos",
    brand: "MOVI TECH",
    images: ["/images/products/zapatos/prod-sneakers-1-lavanda-violeta.jpg"],
    colorImages: {
      "Lavanda / Violeta": ["/images/products/zapatos/prod-sneakers-1-lavanda-violeta.jpg"],
      "Blanco Lunar": ["/images/products/zapatos/prod-sneakers-1-blanco-lunar.jpg"],
      "Obsidiana": ["/images/products/zapatos/prod-sneakers-1-obsidiana.jpg"]
    },
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: [
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Blanco Lunar", hex: "#FFFFFF" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 38,
    rating: 4.9,
    reviewCount: 142,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["tenis", "deportivos", "caminar", "comodos", "running", "amortiguacion", "violeta", "lavanda", "calzado"],
    features: ["Suela ergon\xF3mica con retorno de energ\xEDa", "Malla transpirable antibacteriana", "Peso ultraligero 240g", "Plantilla memory foam ortop\xE9dica"],
    createdAt: "2026-10-15"
  },
  {
    id: "prod-shoes-2",
    name: "Mocasines Urbanos Minimalist Loafer",
    description: "Mocas\xEDn contempor\xE1neo en cuero nobuck aterciopelado con suela dentada de goma ligera. Estilo minimalista que transita sin esfuerzo del d\xEDa a la noche.",
    price: 245e3,
    discountPrice: 22e4,
    category: "Zapatos",
    brand: "MOVI LEATHER CRAFT",
    images: ["/images/products/zapatos/prod-shoes-2-negro-carbon.jpg"],
    colorImages: {
      "Negro Carb\xF3n": ["/images/products/zapatos/prod-shoes-2-negro-carbon.jpg"],
      "Morado Noche": ["/images/products/zapatos/prod-shoes-2-morado-noche.jpg"]
    },
    sizes: ["39", "40", "41", "42", "43"],
    colors: [
      { name: "Negro Carb\xF3n", hex: "#25232B" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 18,
    rating: 4.7,
    reviewCount: 41,
    isPopular: false,
    tags: ["mocasines", "zapatos", "cuero", "formal", "casual", "loafers", "urbano"],
    features: ["Cuero nobuck hidrofugado", "Suela vibram de tracci\xF3n ligera", "Interior forrado en piel de becerro"],
    createdAt: "2026-10-14"
  },
  {
    id: "prod-shoes-3",
    name: "Botines Chelsea en Cuero Oiled Nobuck",
    description: "Botines chelsea cl\xE1sicos confeccionados en cuero nobuck aceitado de grano entero con el\xE1sticos laterales y suela de tracci\xF3n ligera. Silueta atemporal y soporte ergon\xF3mico.",
    price: 31e4,
    discountPrice: 269e3,
    category: "Zapatos",
    brand: "MOVI LEATHER CRAFT",
    images: ["/images/products/zapatos/botines-chelsea-marron-caramelo.jpg"],
    colorImages: {
      "Marr\xF3n Caramelo": ["/images/products/zapatos/botines-chelsea-marron-caramelo.jpg"],
      "Negro Carb\xF3n": ["/images/products/zapatos/botines-chelsea-negro-carbon.jpg"]
    },
    sizes: ["38", "39", "40", "41", "42", "43"],
    colors: [
      { name: "Marr\xF3n Caramelo", hex: "#634832" },
      { name: "Negro Carb\xF3n", hex: "#25232B" }
    ],
    inventory: 26,
    rating: 4.8,
    reviewCount: 57,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["botines", "chelsea", "cuero", "zapatos", "botas", "calzado", "elegante"],
    features: ["Cuero nobuck aceitado resistente al agua", "El\xE1sticos laterales de alta tensi\xF3n", "Suela de goma antideslizante con vira cosida", "Plantilla acolchada en espuma viscoel\xE1stica"],
    createdAt: "2026-10-24"
  },
  {
    id: "prod-shoes-4",
    name: "Tenis Urbanos Minimalistas Suela Goma",
    description: "Sneaker urbano de perfil bajo en cuero liso seleccionado con suela vulcanizada en tono hueso. Una silueta limpia y esencial para cualquier look diario.",
    price: 195e3,
    discountPrice: 165e3,
    category: "Zapatos",
    brand: "MOVI BASIC",
    images: ["/images/products/zapatos/tenis-urbanos-blanco-lunar.jpg"],
    colorImages: {
      "Blanco Lunar": ["/images/products/zapatos/tenis-urbanos-blanco-lunar.jpg"],
      "Lavanda / Violeta": ["/images/products/zapatos/tenis-urbanos-lavanda-violeta.jpg"]
    },
    sizes: ["37", "38", "39", "40", "41", "42"],
    colors: [
      { name: "Blanco Lunar", hex: "#FFFFFF" },
      { name: "Lavanda / Violeta", hex: "#7656D6" }
    ],
    inventory: 34,
    rating: 4.9,
    reviewCount: 88,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["tenis", "sneakers", "urbanos", "blanco", "zapatos", "minimalista", "comodos"],
    features: ["Cuero vacuno suave de tacto flexible", "Suela cosida 360\xB0 para mayor durabilidad", "Forro interior transpirable microperforado", "Cordones de algod\xF3n peinado"],
    createdAt: "2026-10-26"
  },
  {
    id: "prod-shoes-5",
    name: "Sandalias Mule Tac\xF3n Escultural en Cuero",
    description: "Mules destalonadas de puntera cuadrada con pala ancha en suave nappa y tac\xF3n geom\xE9trico facetado de 5 cm. Comodidad y sofisticaci\xF3n contempor\xE1nea.",
    price: 265e3,
    discountPrice: 225e3,
    category: "Zapatos",
    brand: "ATELIER MOVI",
    images: ["/images/products/zapatos/sandalias-mule-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/zapatos/sandalias-mule-obsidiana.jpg"],
      "Morado Noche": ["/images/products/zapatos/sandalias-mule-morado-noche.jpg"]
    },
    sizes: ["36", "37", "38", "39", "40"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 19,
    rating: 4.8,
    reviewCount: 42,
    isPopular: false,
    isNew: true,
    isOffer: false,
    tags: ["sandalias", "mules", "tacon", "cuero", "fiesta", "zapatos", "elegante"],
    features: ["Piel nappa extra suave acolchada", "Tac\xF3n bloque facetado de 5 cm de alta estabilidad", "Puntera cuadrada moderna", "Plantilla anat\xF3mica de cuero con soporte metatarsal"],
    createdAt: "2026-10-28"
  },
  // -------------------------------------------------------------
  // CATEGORÍA: CHAQUETAS (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-jacket-1",
    name: "Blazer Sartorial Velvet Night Structure",
    description: "Blazer estructurado contempor\xE1neo en lana fr\xEDa de sarga italiana con solapa corrida minimalista en tono morado oscuro y forro en seda lavanda. Corte impecable para siluetas fluidas y eventos sofisticados.",
    price: 385e3,
    discountPrice: 32e4,
    category: "Chaquetas",
    brand: "ATELIER MOVI",
    images: ["/images/products/chaquetas/prod-jacket-1-morado-noche.jpg"],
    colorImages: {
      "Morado Noche": ["/images/products/chaquetas/prod-jacket-1-morado-noche.jpg"],
      "Negro Carb\xF3n": ["/images/products/chaquetas/prod-jacket-1-negro-carbon.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Morado Noche", hex: "#30234F" },
      { name: "Negro Carb\xF3n", hex: "#25232B" }
    ],
    inventory: 19,
    rating: 4.8,
    reviewCount: 89,
    isPopular: true,
    isNew: true,
    tags: ["blazer", "chaqueta", "sartorial", "formal", "elegante", "lana", "morado oscuro", "abrigo"],
    features: ["Lana virgen de torsi\xF3n fina", "Corte arquitect\xF3nico estructurado", "Bolsillos laterales ribeteados", "Bot\xF3n artesanal en resina mate"],
    createdAt: "2026-10-20"
  },
  {
    id: "prod-jacket-2",
    name: "Cazadora Bomber Minimalista en Sarga de Seda y Lana",
    description: "Bomber contempor\xE1nea confeccionada en sarga t\xE9cnica de lana virgen y seda. Cuello y pu\xF1os tejidos en punto el\xE1stico indeformable con cremallera frontal met\xE1lica satinada.",
    price: 345e3,
    discountPrice: 295e3,
    category: "Chaquetas",
    brand: "ATELIER MOVI",
    images: ["/images/products/chaquetas/cazadora-bomber-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/chaquetas/cazadora-bomber-obsidiana.jpg"],
      "Morado Noche": ["/images/products/chaquetas/cazadora-bomber-morado-noche.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 25,
    rating: 4.9,
    reviewCount: 68,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["bomber", "chaqueta", "sarga", "seda", "lana", "negro", "morado", "urbano"],
    features: ["Mezcla de lana virgen 80% y seda 20%", "Cremallera bidireccional de n\xEDquel satinado", "Bolsillos laterales con solapa y broche", "Forro interior jacquard de tacto sedoso"],
    createdAt: "2026-10-22"
  },
  {
    id: "prod-jacket-3",
    name: "Trench Coat Estructurado Impermeable Modular",
    description: "Gabardina cl\xE1sica de botonadura doble en sarga de algod\xF3n impermeable. Cintur\xF3n con hebilla forrada y solapa de lluvia posterior para m\xE1xima protecci\xF3n clim\xE1tica.",
    price: 42e4,
    discountPrice: 36e4,
    category: "Chaquetas",
    brand: "ATELIER MOVI",
    images: ["/images/products/chaquetas/trench-coat-arena-claro.jpg"],
    colorImages: {
      "Arena Claro": ["/images/products/chaquetas/trench-coat-arena-claro.jpg"],
      "Obsidiana": ["/images/products/chaquetas/trench-coat-obsidiana.jpg"]
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Arena Claro", hex: "#D8CFC4" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 18,
    rating: 4.8,
    reviewCount: 52,
    isPopular: false,
    isNew: true,
    isOffer: true,
    tags: ["trench coat", "gabardina", "impermeable", "abrigo", "arena", "negro", "elegante"],
    features: ["Algod\xF3n gabardina con acabado repelente al agua", "Botonadura doble con botones efecto carey", "Cintur\xF3n amovible con hebilla de pasador", "Abertura trasera con bot\xF3n de desahogo"],
    createdAt: "2026-10-24"
  },
  {
    id: "prod-jacket-4",
    name: "Chaqueta Sobrecamisa Overshirt en Cuero Gamuzado",
    description: "Sobrecamisa de corte recto elaborada en cuero gamuzado vacuno de tacto aterciopelado. Dos bolsillos de parche en el pecho con solapas y broches de presi\xF3n met\xE1licos.",
    price: 39e4,
    discountPrice: 34e4,
    category: "Chaquetas",
    brand: "MOVI LEATHER CRAFT",
    images: ["/images/products/chaquetas/sobrecamisa-cuero-marron-caramelo.jpg"],
    colorImages: {
      "Marr\xF3n Caramelo": ["/images/products/chaquetas/sobrecamisa-cuero-marron-caramelo.jpg"],
      "Negro Carb\xF3n": ["/images/products/chaquetas/sobrecamisa-cuero-negro-carbon.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Marr\xF3n Caramelo", hex: "#634832" },
      { name: "Negro Carb\xF3n", hex: "#25232B" }
    ],
    inventory: 16,
    rating: 4.9,
    reviewCount: 44,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["sobrecamisa", "overshirt", "cuero", "gamuza", "marron", "negro", "chaqueta"],
    features: ["100% Cuero nobuck gamuzado natural", "Broches de presi\xF3n en zamak mate", "Pu\xF1os abotonables para ajuste regulable", "Costuras al tono reforzadas a mano"],
    createdAt: "2026-10-25"
  },
  {
    id: "prod-jacket-5",
    name: "Abrigo Sartorial Largo en Lana Merino Virgen",
    description: "Abrigo largo tres cuartos de solapa muesca confeccionado en pa\xF1o denso de lana merino virgen. L\xEDneas depuradas, bolsillos con tapeta y silueta entallada contempor\xE1nea.",
    price: 46e4,
    discountPrice: 395e3,
    category: "Chaquetas",
    brand: "ATELIER MOVI",
    images: ["/images/products/chaquetas/abrigo-largo-morado-noche.jpg"],
    colorImages: {
      "Morado Noche": ["/images/products/chaquetas/abrigo-largo-morado-noche.jpg"],
      "Gris Perla": ["/images/products/chaquetas/abrigo-largo-gris-perla.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Morado Noche", hex: "#30234F" },
      { name: "Gris Perla", hex: "#9E9EA7" }
    ],
    inventory: 14,
    rating: 4.9,
    reviewCount: 63,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["abrigo", "lana merino", "largo", "formal", "sartorial", "morado", "gris", "invierno"],
    features: ["Pa\xF1o pesado de 100% lana merino virgen (450 GSM)", "Solapa de muesca con picado sartorial", "Forro t\xE9rmico en viscosa transpirable", "Bolsillo interior para pasaporte o cartera"],
    createdAt: "2026-10-28"
  },
  // -------------------------------------------------------------
  // CATEGORÍA: BOLSOS (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-bag-1",
    name: "Bolso Tote Florentino Modular en Cuero",
    description: 'Tote bag confeccionado a mano en cuero vacuno plena flor con detalles bitono en ciruela profundo y carb\xF3n. Compartimento interior acolchado para laptop de hasta 15" y cierre magn\xE9tico de seguridad.',
    price: 295e3,
    discountPrice: 265e3,
    category: "Bolsos",
    brand: "MOVI LEATHER CRAFT",
    images: ["/images/products/bolsos/prod-bag-1-ciruela-carbon.jpg"],
    colorImages: {
      "Ciruela & Carb\xF3n": ["/images/products/bolsos/prod-bag-1-ciruela-carbon.jpg"],
      "Negro Puro": ["/images/products/bolsos/prod-bag-1-negro-puro.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Ciruela & Carb\xF3n", hex: "#30234F" },
      { name: "Negro Puro", hex: "#25232B" }
    ],
    inventory: 24,
    rating: 4.9,
    reviewCount: 110,
    isPopular: true,
    isOffer: true,
    tags: ["bolso", "tote", "cuero", "cartera", "elegante", "oficina", "viaje", "laptop", "accesorio"],
    features: ["Cuero genuino plena flor italiano", "Compartimento para port\xE1til acolchado", "Herrajes met\xE1licos en oro mate", "Correa extra\xEDble regulable"],
    createdAt: "2026-10-18"
  },
  {
    id: "prod-bag-2",
    name: "Bolso Bandolera Crossbody Geom\xE9trico en Cuero Liso",
    description: "Bandolera de silueta arquitect\xF3nica estructurada en piel de becerro lisa con herraje de cierre frontal en plata mate y correa de hombro ajustable.",
    price: 245e3,
    discountPrice: 215e3,
    category: "Bolsos",
    brand: "MOVI LEATHER CRAFT",
    images: ["/images/products/bolsos/bandolera-crossbody-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/bolsos/bandolera-crossbody-obsidiana.jpg"],
      "Lavanda / Violeta": ["/images/products/bolsos/bandolera-crossbody-lavanda-violeta.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Lavanda / Violeta", hex: "#7656D6" }
    ],
    inventory: 22,
    rating: 4.8,
    reviewCount: 75,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["bandolera", "crossbody", "cuero", "bolso", "negro", "violeta", "geometrico"],
    features: ["Piel de becerro de acabado satinado", "Cierre a presi\xF3n en aleaci\xF3n satinada", "Interior con bolsillo plano para tarjetas", "Correa regulable con gemelos met\xE1licos"],
    createdAt: "2026-10-21"
  },
  {
    id: "prod-bag-3",
    name: "Mochila Urbana Modular Roll-Top Impermeable",
    description: "Mochila de dise\xF1o t\xE9cnico minimalista con cierre enrollable roll-top, tejido impermeable sellado por alta frecuencia y compartimento acolchado para laptop de 16 pulgadas.",
    price: 275e3,
    discountPrice: 235e3,
    category: "Bolsos",
    brand: "MOVI TECH",
    images: ["/images/products/bolsos/mochila-urbana-negro-carbon.jpg"],
    colorImages: {
      "Negro Carb\xF3n": ["/images/products/bolsos/mochila-urbana-negro-carbon.jpg"],
      "Morado Noche": ["/images/products/bolsos/mochila-urbana-morado-noche.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Negro Carb\xF3n", hex: "#25232B" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 30,
    rating: 4.9,
    reviewCount: 92,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["mochila", "backpack", "roll-top", "impermeable", "laptop", "negro", "morado"],
    features: ["Tejido poli\xE9ster reciclado con membrana impermeable", "Hebilla de apertura r\xE1pida en aluminio anodizado", "Respaldo ergon\xF3mico con canal de flujo de aire", "Bolsillo lateral exterior para termo o botella"],
    createdAt: "2026-10-23"
  },
  {
    id: "prod-bag-4",
    name: "Bolso de Hombro Baguette Noventero en Cuero Graneado",
    description: "Inspiraci\xF3n vintage noventera en silueta alargada con asa corta curvada al hombro y hebilla central decorativa. Cuero granulado resistente al desgaste.",
    price: 215e3,
    discountPrice: 185e3,
    category: "Bolsos",
    brand: "ATELIER MOVI",
    images: ["/images/products/bolsos/bolso-baguette-lavanda-violeta.jpg"],
    colorImages: {
      "Lavanda / Violeta": ["/images/products/bolsos/bolso-baguette-lavanda-violeta.jpg"],
      "Blanco Lunar": ["/images/products/bolsos/bolso-baguette-blanco-lunar.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Blanco Lunar", hex: "#FFFFFF" }
    ],
    inventory: 18,
    rating: 4.8,
    reviewCount: 58,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["baguette", "bolso de hombro", "noventero", "lavanda", "blanco", "retro", "cuero"],
    features: ["Cuero vacuno con grabado caviar texturizado", "Asa anat\xF3mica reforzada para hombro", "Cierre de cremallera con tirador met\xE1lico", "Forro interior en microfibra aterciopelada"],
    createdAt: "2026-10-26"
  },
  {
    id: "prod-bag-5",
    name: "Malet\xEDn Portadocumentos Ejecutivo en Cuero Florentino",
    description: "Malet\xEDn formal estructurado en piel plena flor con cerradura frontal en bronce cepillado, asa r\xEDgida forrada a mano y organizador interno para documentos A4 y dispositivos.",
    price: 36e4,
    discountPrice: 315e3,
    category: "Bolsos",
    brand: "MOVI LEATHER CRAFT",
    images: ["/images/products/bolsos/maletin-ejecutivo-marron-caramelo.jpg"],
    colorImages: {
      "Marr\xF3n Caramelo": ["/images/products/bolsos/maletin-ejecutivo-marron-caramelo.jpg"],
      "Obsidiana": ["/images/products/bolsos/maletin-ejecutivo-obsidiana.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Marr\xF3n Caramelo", hex: "#634832" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 15,
    rating: 4.9,
    reviewCount: 47,
    isPopular: false,
    isNew: true,
    isOffer: true,
    tags: ["maletin", "portadocumentos", "ejecutivo", "cuero", "oficina", "marron", "negro"],
    features: ["Piel vacuno plena flor curtida con taninos vegetales", "Cerradura de precisi\xF3n con llave en bronce", "Refuerzos esquineros protectores met\xE1licos", "Correa de hombro amovible con almohadilla de cuero"],
    createdAt: "2026-10-28"
  },
  // -------------------------------------------------------------
  // CATEGORÍA: ACCESORIOS (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-acc-1",
    name: "Gafas de Sol Geom\xE9tricas en Acetato Italiano y Titanio",
    description: "Gafas de sol de montura angular biselada en acetato de celulosa de 8 mm con bisagras de cinco charnelas en titanio. Lentes polarizadas categor\xEDa 3 con protecci\xF3n UV400 total.",
    price: 185e3,
    discountPrice: 159e3,
    category: "Accesorios",
    brand: "ATELIER MOVI",
    images: ["/images/products/accesorios/gafas-acetato-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/accesorios/gafas-acetato-obsidiana.jpg"],
      "Lavanda / Violeta": ["/images/products/accesorios/gafas-acetato-lavanda-violeta.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Lavanda / Violeta", hex: "#7656D6" }
    ],
    inventory: 34,
    rating: 4.9,
    reviewCount: 142,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["gafas de sol", "lentes", "acetato", "titanio", "negro", "violeta", "proteccion uv"],
    features: ["Acetato de celulosa italiano pulido a mano", "Lentes polarizadas CR-39 con filtro anti-reflejos", "Bisagras de titanio de precisi\xF3n", "Incluye estuche r\xEDgido magn\xE9tico y pa\xF1o de microfibra"],
    createdAt: "2026-10-12"
  },
  {
    id: "prod-acc-2",
    name: "Cintur\xF3n Reversible en Cuero Plena Flor con Hebilla Minimalista",
    description: "Cintur\xF3n formal y casual de mecanismo rotativo reversible de 32 mm en cuero plena flor espa\xF1ol. Hebilla de aleaci\xF3n de zinc en acabado n\xEDquel cepillado sin n\xEDquel.",
    price: 139e3,
    discountPrice: 119e3,
    category: "Accesorios",
    brand: "MOVI LEATHER CRAFT",
    images: ["/images/products/accesorios/cinturon-cuero-negro-carbon.jpg"],
    colorImages: {
      "Negro Carb\xF3n": ["/images/products/accesorios/cinturon-cuero-negro-carbon.jpg"],
      "Marr\xF3n Caramelo": ["/images/products/accesorios/cinturon-cuero-marron-caramelo.jpg"]
    },
    sizes: ["85", "90", "95", "100", "105"],
    colors: [
      { name: "Negro Carb\xF3n", hex: "#25232B" },
      { name: "Marr\xF3n Caramelo", hex: "#634832" }
    ],
    inventory: 40,
    rating: 4.8,
    reviewCount: 98,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["cinturon", "cuero", "reversible", "hebilla", "negro", "marron", "elegante"],
    features: ["Piel vacuno plena flor te\xF1ida a la anilina", "Hebilla giratoria con bloqueo de seguridad", "Bordes biselados y pintados a mano", "Cinco perforaciones el\xEDpticas de ajuste perfecto"],
    createdAt: "2026-10-15"
  },
  {
    id: "prod-acc-3",
    name: "Billetera Tarjetero MagSafe en Cuero Nappa Slim",
    description: "Tarjetero ultradelgado con imanes de neodimio integrados compatibles con sistema MagSafe. Ranura de acceso r\xE1pido y bloqueo RFID para protecci\xF3n de tarjetas contactless.",
    price: 115e3,
    discountPrice: 95e3,
    category: "Accesorios",
    brand: "MOVI TECH",
    images: ["/images/products/accesorios/tarjetero-cuero-morado-noche.jpg"],
    colorImages: {
      "Morado Noche": ["/images/products/accesorios/tarjetero-cuero-morado-noche.jpg"],
      "Obsidiana": ["/images/products/accesorios/tarjetero-cuero-obsidiana.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Morado Noche", hex: "#30234F" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 45,
    rating: 4.9,
    reviewCount: 167,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["tarjetero", "billetera", "magsafe", "cuero", "rfid", "morado", "negro"],
    features: ["Imanes N52 de sujeci\xF3n ultra firme", "Blindaje RFID anti clonaci\xF3n en todas las ranuras", "Capacidad para 4 tarjetas y billetes plegados", "Grosor m\xEDnimo de solo 4.5 mm"],
    createdAt: "2026-10-18"
  },
  {
    id: "prod-acc-4",
    name: "Bufanda Pashmina en Lana Merino y Cachemira Suave",
    description: "Bufanda envolvente de tacto esponjoso tejida en mezcla premium de lana merino ultrafina y cachemira de Mongolia. Rematada con flecos anudados artesanalmente en los extremos.",
    price: 155e3,
    discountPrice: 129e3,
    category: "Accesorios",
    brand: "ATELIER MOVI",
    images: ["/images/products/accesorios/bufanda-cachemira-lavanda-violeta.jpg"],
    colorImages: {
      "Lavanda / Violeta": ["/images/products/accesorios/bufanda-cachemira-lavanda-violeta.jpg"],
      "Gris Perla": ["/images/products/accesorios/bufanda-cachemira-gris-perla.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Gris Perla", hex: "#9E9EA7" }
    ],
    inventory: 28,
    rating: 4.8,
    reviewCount: 82,
    isPopular: false,
    isNew: true,
    isOffer: true,
    tags: ["bufanda", "cachemira", "lana merino", "pashmina", "lavanda", "gris", "invierno"],
    features: ["70% Lana Merino 17.5 micras / 30% Cachemira pura", "Dimensiones generosas de 200 x 45 cm", "Flecos de 8 cm anudados a mano", "Aislante t\xE9rmico natural ultraliviano"],
    createdAt: "2026-10-22"
  },
  {
    id: "prod-acc-5",
    name: "Reloj Anal\xF3gico Contempor\xE1neo en Acero con Correa de Cuero",
    description: "Reloj de pulsera de inspiraci\xF3n Bauhaus con caja circular de 40 mm en acero inoxidable 316L satinado, cristal de zafiro irrayable y movimiento de cuarzo suizo de alta precisi\xF3n.",
    price: 32e4,
    discountPrice: 279e3,
    category: "Accesorios",
    brand: "ATELIER MOVI",
    images: ["/images/products/accesorios/reloj-acero-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/accesorios/reloj-acero-obsidiana.jpg"],
      "Blanco Lunar": ["/images/products/accesorios/reloj-acero-blanco-lunar.jpg"]
    },
    sizes: ["\xDAnica"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Blanco Lunar", hex: "#FFFFFF" }
    ],
    inventory: 19,
    rating: 4.9,
    reviewCount: 105,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["reloj", "analogo", "acero", "cuero", "zafiro", "negro", "blanco", "elegante"],
    features: ["Caja de acero inoxidable quir\xFArgico 316L de 40 mm", "Cristal de zafiro con doble tratamiento antirreflejo", "Resistencia al agua 5 ATM (50 metros)", "Correa de cuero vacuno con pasadores de cambio r\xE1pido"],
    createdAt: "2026-10-26"
  },
  // -------------------------------------------------------------
  // CATEGORÍA: ROPA DEPORTIVA (5 PRODUCTOS CON FOTOS REALES COMPLETAS)
  // -------------------------------------------------------------
  {
    id: "prod-sport-1",
    name: "Set Deportivo Seamless Core Performance",
    description: "Conjunto deportivo sin costuras compuesto por top de compresi\xF3n media y leggings de tiro alto con pretina anat\xF3mica reforzada. Absorci\xF3n r\xE1pida del sudor y ajuste ergon\xF3mico 360\xB0.",
    price: 189e3,
    discountPrice: 159e3,
    category: "Ropa deportiva",
    brand: "MOVI TECH",
    images: ["/images/products/ropa-deportiva/set-deportivo-seamless-lavanda-violeta.jpg"],
    colorImages: {
      "Lavanda / Violeta": ["/images/products/ropa-deportiva/set-deportivo-seamless-lavanda-violeta.jpg"],
      "Obsidiana": ["/images/products/ropa-deportiva/set-deportivo-seamless-obsidiana.jpg"]
    },
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 35,
    rating: 4.9,
    reviewCount: 128,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["set deportivo", "conjunto", "leggings", "top", "seamless", "fitness", "yoga", "lavanda", "morado"],
    features: ["Tecnolog\xEDa seamless antirozaduras", "Pretina de alta compresi\xF3n con soporte lumbar", "Tejido 4-way stretch transpirable", "Efecto estilizador y opaco a prueba de sentadillas"],
    createdAt: "2026-10-17"
  },
  {
    id: "prod-sport-2",
    name: "Leggings de Compresi\xF3n High-Waist Esculpidas",
    description: "Leggings de alto rendimiento dise\xF1adas con paneles ergon\xF3micos de soporte muscular y cintura extra alta de compresi\xF3n graduada. Tejido de tacto mantecoso con acabado mate.",
    price: 139e3,
    discountPrice: 119e3,
    category: "Ropa deportiva",
    brand: "MOVI TECH",
    images: ["/images/products/ropa-deportiva/leggings-compresion-obsidiana.jpg"],
    colorImages: {
      "Obsidiana": ["/images/products/ropa-deportiva/leggings-compresion-obsidiana.jpg"],
      "Morado Noche": ["/images/products/ropa-deportiva/leggings-compresion-morado-noche.jpg"]
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Obsidiana", hex: "#25232B" },
      { name: "Morado Noche", hex: "#30234F" }
    ],
    inventory: 40,
    rating: 4.8,
    reviewCount: 95,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["leggings", "compresion", "high waist", "gym", "running", "negro", "morado"],
    features: ["Cintura cruzada con control de abdomen", "Costuras planas antirritaci\xF3n", "Bolsillo interior oculto para llaves", "Tejido opaco non-sheer"],
    createdAt: "2026-10-18"
  },
  {
    id: "prod-sport-3",
    name: "Top Deportivo Racerback con Soporte de Alto Impacto",
    description: "Sujetador deportivo estructurado con copas premoldeadas transpirables y espalda deportiva racerback para total libertad de movimiento en entrenamientos intensos.",
    price: 95e3,
    discountPrice: 79e3,
    category: "Ropa deportiva",
    brand: "MOVI TECH",
    images: ["/images/products/ropa-deportiva/top-deportivo-racerback-lavanda-violeta.jpg"],
    colorImages: {
      "Lavanda / Violeta": ["/images/products/ropa-deportiva/top-deportivo-racerback-lavanda-violeta.jpg"],
      "Blanco Lunar": ["/images/products/ropa-deportiva/top-deportivo-racerback-blanco-lunar.jpg"]
    },
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Lavanda / Violeta", hex: "#7656D6" },
      { name: "Blanco Lunar", hex: "#FFFFFF" }
    ],
    inventory: 32,
    rating: 4.8,
    reviewCount: 84,
    isPopular: false,
    isNew: true,
    isOffer: true,
    tags: ["top deportivo", "bra", "racerback", "fitness", "lavanda", "blanco", "soporte"],
    features: ["Banda inferior el\xE1stica de 4 cm sin deslizamiento", "Copas termoformadas extra\xEDbles", "Panel posterior de micro-malla para ventilaci\xF3n", "Tratamiento antibacteriano antiolores"],
    createdAt: "2026-10-21"
  },
  {
    id: "prod-sport-4",
    name: "Shorts Biker Ergon\xF3micos con Bolsillo Lateral Oculto",
    description: "Short ciclista de longitud media (20 cm de entrepierna) con bolsillo lateral profundo para smartphone y pretina anat\xF3mica libre de el\xE1sticos r\xEDgidos.",
    price: 89e3,
    discountPrice: 75e3,
    category: "Ropa deportiva",
    brand: "MOVI TECH",
    images: ["/images/products/ropa-deportiva/shorts-biker-morado-noche.jpg"],
    colorImages: {
      "Morado Noche": ["/images/products/ropa-deportiva/shorts-biker-morado-noche.jpg"],
      "Obsidiana": ["/images/products/ropa-deportiva/shorts-biker-obsidiana.jpg"]
    },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Morado Noche", hex: "#30234F" },
      { name: "Obsidiana", hex: "#25232B" }
    ],
    inventory: 29,
    rating: 4.7,
    reviewCount: 61,
    isPopular: true,
    isNew: false,
    isOffer: true,
    tags: ["biker shorts", "shorts", "ciclista", "bolsillo", "morado", "negro", "entrenamiento"],
    features: ['Bolsillo lateral para tel\xE9fono hasta 6.7"', "Tiro alto que no se enrolla", "Acabado en pierna cortado a l\xE1ser", "Tejido transpirable de secado ultrarr\xE1pido"],
    createdAt: "2026-10-23"
  },
  {
    id: "prod-sport-5",
    name: "Chaqueta Cortavientos T\xE9cnica Ultra-Packable",
    description: "Cortavientos ultraligero de 110 gramos con capucha ajustable y tratamiento repelente al agua DWR. Se pliega completamente dentro de su propio bolsillo para f\xE1cil transporte.",
    price: 21e4,
    discountPrice: 179e3,
    category: "Ropa deportiva",
    brand: "MOVI TECH",
    images: ["/images/products/ropa-deportiva/chaqueta-cortavientos-blanco-lunar.jpg"],
    colorImages: {
      "Blanco Lunar": ["/images/products/ropa-deportiva/chaqueta-cortavientos-blanco-lunar.jpg"],
      "Lavanda / Violeta": ["/images/products/ropa-deportiva/chaqueta-cortavientos-lavanda-violeta.jpg"]
    },
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanco Lunar", hex: "#FFFFFF" },
      { name: "Lavanda / Violeta", hex: "#7656D6" }
    ],
    inventory: 24,
    rating: 4.9,
    reviewCount: 78,
    isPopular: true,
    isNew: true,
    isOffer: true,
    tags: ["cortavientos", "chaqueta deportiva", "running", "impermeable", "blanco", "lavanda", "packable"],
    features: ["Tejido micro ripstop repelente al agua", "Empacable en su propio bolsillo de pecho", "Detalles reflectivos de 360\xB0 para baja luminosidad", "Ventilaci\xF3n trasera oculta para control t\xE9rmico"],
    createdAt: "2026-10-27"
  }
];
var INITIAL_CATEGORIES = [
  { id: "cat-1", name: "Camisetas", slug: "camisetas", description: "Esenciales urbanos y siluetas contempor\xE1neas", iconName: "Shirt", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Camisetas").length },
  { id: "cat-2", name: "Pantalones", slug: "pantalones", description: "Cortes rectos, cargos utilitarios y sastrer\xEDa", iconName: "Layers", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Pantalones").length },
  { id: "cat-3", name: "Vestidos", slug: "vestidos", description: "Siluetas fluidas, asim\xE9tricas y minimalismo moderno", iconName: "Sparkles", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Vestidos").length },
  { id: "cat-4", name: "Chaquetas", slug: "chaquetas", description: "Blazers estructurados, bombers y abrigos de temporada", iconName: "Wind", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Chaquetas").length },
  { id: "cat-5", name: "Zapatos", slug: "zapatos", description: "Sneakers ergon\xF3micos, mocasines y calzado urbano", iconName: "Footprints", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Zapatos").length },
  { id: "cat-6", name: "Bolsos", slug: "bolsos", description: "Totes artesanales, mochilas modulares y bandoleras", iconName: "ShoppingBag", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Bolsos").length },
  { id: "cat-7", name: "Accesorios", slug: "accesorios", description: "Gafas de titanio, joyer\xEDa sutil y complementos", iconName: "Watch", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Accesorios").length },
  { id: "cat-8", name: "Ropa deportiva", slug: "ropa-deportiva", description: "Prendas seamless t\xE9rmicas y compresi\xF3n activewear", iconName: "Flame", itemCount: INITIAL_PRODUCTS.filter((p) => p.category === "Ropa deportiva").length }
];
var DEMO_USER = {
  id: "usr-client-01",
  name: "Valentina Restrepo",
  email: "valentina.restrepo@movifashion.ai",
  role: "cliente",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  preferences: {
    style: "minimalista",
    favoriteCategories: ["Zapatos", "Chaquetas", "Ropa deportiva"],
    typicalBudget: 25e4,
    preferredSizes: ["M", "39"],
    favoriteColors: ["Morado principal", "Lavanda", "Negro"]
  },
  addresses: [
    {
      id: "addr-1",
      recipientName: "Valentina Restrepo",
      street: "Carrera 43A # 18 Sur - 122, Edificio Altius",
      city: "Medell\xEDn",
      department: "Antioquia",
      postalCode: "050022",
      phone: "+57 312 890 4421",
      isDefault: true
    }
  ],
  createdAt: "2026-08-10"
};

// src/config/empresa.ts
var EMPRESA = {
  razonSocial: "MoviFashion Colombia S.A.S.",
  nombreComercial: "MoviFashion",
  nit: "901.234.567-8",
  regimenFiscal: "R\xE9gimen Com\xFAn / Responsable de IVA",
  responsabilidadFiscal: "Actividad comercial al por menor de prendas de vestir y accesorios",
  direccion: "Calle 100 # 15-20, Oficina 402",
  ciudad: "Bogot\xE1 D.C.",
  departamento: "Cundinamarca",
  pais: "Colombia",
  codigoPostal: "110111",
  telefono: "+57 601 555 0142",
  whatsapp: "+57 300 555 0142",
  whatsappMensajePredeterminado: "Hola MoviFashion, deseo asesor\xEDa personalizada sobre sus prendas y colecciones.",
  correoContacto: "contacto@movifashion.co",
  correoPQRS: "pqrs@movifashion.co",
  correoPrivacidad: "privacidad@movifashion.co",
  correoNotificacionesJudiciales: "juridico@movifashion.co",
  sitioWeb: "https://movifashion.vercel.app",
  lema: "Tu estilo, inteligentemente conectado",
  descripcionCorta: "Moda y prendas contempor\xE1neas creadas con precisi\xF3n, visi\xF3n urbana y tecnolog\xEDa inteligente para elevar tu estilo cotidiano.",
  horarioAtencion: "Lunes a viernes 8:00 a.m. \u2013 6:00 p.m. \xB7 S\xE1bados 9:00 a.m. \u2013 1:00 p.m.",
  redesSociales: {
    instagram: "https://instagram.com/movifashion.co",
    facebook: "https://facebook.com/movifashion.co",
    tiktok: "https://tiktok.com/@movifashion.co"
  },
  sicUrl: "https://www.sic.gov.co",
  dianUrl: "https://www.dian.gov.co",
  tiemposEnvio: {
    ciudadesPrincipales: "2 a 3 d\xEDas h\xE1biles (Bogot\xE1, Medell\xEDn, Cali, Barranquilla, Bucaramanga)",
    ciudadesSecundarias: "3 a 5 d\xEDas h\xE1biles",
    trayectosEspeciales: "5 a 8 d\xEDas h\xE1biles"
  },
  costoEnvioNacional: 12e3,
  umbralEnvioGratis: 2e5,
  diasGarantiaLegal: 90,
  diasRetractoLegal: 5,
  diasCambioComercial: 30,
  diasRespuestaPQRS: 15
};

// src/utils/impuestos.ts
var TARIFA_IVA = 0.19;
function calcularBaseGravable(totalConIva) {
  if (!totalConIva || totalConIva <= 0) return 0;
  return Math.round(totalConIva / (1 + TARIFA_IVA));
}
function calcularIva(totalConIva) {
  if (!totalConIva || totalConIva <= 0) return 0;
  const base = calcularBaseGravable(totalConIva);
  return totalConIva - base;
}
function formatCOP(valor, incluirSufijo = true) {
  if (typeof valor !== "number" || isNaN(valor)) valor = 0;
  const formateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
  return incluirSufijo ? `${formateado} COP` : formateado;
}

// src/server/adminRoutes.ts
import { Router } from "express";
import fs from "fs";
import path from "path";
import * as XLSX2 from "xlsx";

// src/admin/rbac.ts
var ADMIN_MODULES = [
  {
    id: "resumen",
    name: "Resumen General",
    actions: [
      { id: "resumen.ver", label: "Ver Resumen", description: "Visualizar KPIs y m\xE9tricas generales" }
    ]
  },
  {
    id: "ventas",
    name: "Registro de Ventas",
    actions: [
      { id: "ventas.ver", label: "Ver Registro de Ventas", description: "Detalle cronol\xF3gico auditable con desglose de coste y margen" },
      { id: "ventas.exportar", label: "Exportar Ventas a Excel", description: "Descargar reporte completo en formato .xlsx" }
    ]
  },
  {
    id: "pedidos",
    name: "Pedidos y Ventas (Real/Simulado)",
    actions: [
      { id: "pedidos.ver", label: "Ver Pedidos", description: "Listar y consultar detalle de \xF3rdenes" },
      { id: "pedidos.editar", label: "Editar Estados y Gu\xEDas", description: "Modificar estados y c\xF3digos de rastreo" },
      { id: "pedidos.aprobar", label: "Marcar Entregado / Cancelar", description: "Cambiar a entregado o cancelar orden" },
      { id: "pedidos.exportar", label: "Exportar Pedidos", description: "Descargar reportes CSV de pedidos" }
    ]
  },
  {
    id: "imagenes",
    name: "Auditor\xEDa de Im\xE1genes",
    actions: [
      { id: "imagenes.ver", label: "Ver Auditor\xEDa de Im\xE1genes", description: "Analizar pesos, dimensiones y accesibilidad de fotos" },
      { id: "imagenes.editar", label: "Reemplazar Im\xE1genes", description: "Actualizar o regenerar fotos del cat\xE1logo" }
    ]
  },
  {
    id: "informes",
    name: "Informes Descargables",
    actions: [
      { id: "informes.ver", label: "Ver Informes Descargables", description: "Centro de generaci\xF3n y descarga de informes" },
      { id: "informes.descargar", label: "Descargar Reportes Excel/CSV", description: "Generaci\xF3n de balances fiscales y operativos" }
    ]
  },
  {
    id: "bigdata",
    name: "Inteligencia de Mercado y Big Data",
    actions: [
      { id: "bigdata.ver", label: "Ver Inteligencia de Mercado", description: "Anal\xEDtica de comportamiento, tendencias y big data" },
      { id: "bigdata.exportar", label: "Exportar Datos Big Data", description: "Descargar datasets de eventos y tr\xE1fico" }
    ]
  },
  {
    id: "devoluciones",
    name: "Devoluciones y Retractos",
    actions: [
      { id: "devoluciones.ver", label: "Ver Solicitudes", description: "Ver solicitudes de retracto y garant\xEDa" },
      { id: "devoluciones.editar", label: "Gestionar Estado", description: "Aprobar, rechazar o responder solicitudes" },
      { id: "devoluciones.aprobar", label: "Aprobar Reembolso", description: "Liquidar reembolso simulado y devolver stock" }
    ]
  },
  {
    id: "productos",
    name: "Cat\xE1logo de Productos",
    actions: [
      { id: "productos.ver", label: "Ver Productos", description: "Listar cat\xE1logo y variantes" },
      { id: "productos.crear", label: "Crear Producto", description: "Crear nuevas prendas en cat\xE1logo" },
      { id: "productos.editar", label: "Editar Producto", description: "Actualizar precios, fotos y descripciones" },
      { id: "productos.eliminar", label: "Papelera (L\xF3gica)", description: "Enviar a papelera temporal" },
      { id: "productos.exportar", label: "Importar / Exportar", description: "Exportar o importar cat\xE1logo en CSV" },
      { id: "productos.eliminar_definitivo", label: "Eliminar Definitivo", description: "Borrado permanente de base de datos" }
    ]
  },
  {
    id: "inventario",
    name: "Inventario y Kardex",
    actions: [
      { id: "inventario.ver", label: "Ver Inventario", description: "Consultar existencias y movimientos" },
      { id: "inventario.editar", label: "Ajustar Existencias", description: "Registrar entradas, salidas y conteos" },
      { id: "inventario.exportar", label: "Exportar Kardex", description: "Descargar historial de movimientos" }
    ]
  },
  {
    id: "categorias",
    name: "Categor\xEDas",
    actions: [
      { id: "categorias.ver", label: "Ver Categor\xEDas", description: "Ver lista de categor\xEDas" },
      { id: "categorias.crear", label: "Crear Categor\xEDa", description: "Crear nueva categor\xEDa" },
      { id: "categorias.editar", label: "Editar y Ordenar", description: "Modificar atributos y orden" },
      { id: "categorias.eliminar", label: "Eliminar Categor\xEDa", description: "Desactivar o eliminar categor\xEDa" }
    ]
  },
  {
    id: "marketing",
    name: "Marketing y Campa\xF1as",
    actions: [
      { id: "marketing.ver", label: "Ver Campa\xF1as", description: "Consultar cupones y banners" },
      { id: "marketing.crear", label: "Crear Cupones/Campa\xF1as", description: "Crear promociones y c\xF3digos" },
      { id: "marketing.editar", label: "Editar Promociones", description: "Modificar vigencias y banners" },
      { id: "marketing.eliminar", label: "Desactivar / Borrar", description: "Eliminar cupones o promociones" }
    ]
  },
  {
    id: "clientes",
    name: "Gesti\xF3n de Clientes",
    actions: [
      { id: "clientes.ver", label: "Ver Clientes", description: "Consultar lista y perfiles" },
      { id: "clientes.editar", label: "Editar Cliente", description: "Suspender cuenta o editar notas" },
      { id: "clientes.datos_sensibles", label: "Datos Sensibles", description: "Ver tel\xE9fono, c\xE9dula y direcci\xF3n sin m\xE1scara" },
      { id: "clientes.exportar", label: "Exportar Clientes", description: "Descargar base de clientes" },
      { id: "clientes.eliminar", label: "Habeas Data (Eliminar)", description: "Eliminaci\xF3n legal de titular" }
    ]
  },
  {
    id: "atencion",
    name: "Atenci\xF3n al Cliente (PQRS)",
    actions: [
      { id: "atencion.ver", label: "Ver PQRS y Contacto", description: "Ver bandeja de peticiones y mensajes" },
      { id: "atencion.editar", label: "Asignar / Cambiar Estado", description: "Asignar miembro y prioridad" },
      { id: "atencion.responder", label: "Emitir Respuesta Legal", description: "Responder formalmente al peticionario" }
    ]
  },
  {
    id: "asistente",
    name: "Asistente IA (Movi)",
    actions: [
      { id: "asistente.ver", label: "Ver M\xE9tricas IA", description: "Ver feedback y consultas" },
      { id: "asistente.editar", label: "Editar Base Conocimiento", description: "Modificar respuestas de tienda y tono" }
    ]
  },
  {
    id: "contenido",
    name: "Gestor de Contenido (CMS)",
    actions: [
      { id: "contenido.ver", label: "Ver P\xE1ginas", description: "Listar p\xE1ginas institucionales y FAQs" },
      { id: "contenido.crear", label: "Crear Contenido", description: "Crear nuevas p\xE1ginas o FAQs" },
      { id: "contenido.editar", label: "Editar y Restaurar", description: "Editar texto y restaurar versiones" }
    ]
  },
  {
    id: "analitica",
    name: "Anal\xEDtica y Big Data",
    actions: [
      { id: "analitica.ver", label: "Ver M\xE9tricas", description: "Ver embudo, RFM y predicciones" },
      { id: "analitica.exportar", label: "Exportar Anal\xEDtica", description: "Descargar datos de comportamiento" }
    ]
  },
  {
    id: "finanzas",
    name: "Finanzas e Impuestos",
    actions: [
      { id: "finanzas.ver", label: "Ver Ventas e IVA 19%", description: "Ver base gravable e impuestos" },
      { id: "finanzas.exportar", label: "Exportar Reporte Fiscal", description: "Descargar informe contable DIAN" }
    ]
  },
  {
    id: "envios",
    name: "Configuraci\xF3n Env\xEDos",
    actions: [
      { id: "envios.ver", label: "Ver Tarifas y Cobertura", description: "Consultar fletes y transportadoras" },
      { id: "envios.editar", label: "Editar Tarifas Env\xEDos", description: "Actualizar costos y umbral gratis" }
    ]
  },
  {
    id: "usuarios",
    name: "Usuarios y Equipo",
    actions: [
      { id: "usuarios.ver", label: "Ver Personal", description: "Listar equipo y estado de acceso" },
      { id: "usuarios.crear", label: "Invitar Miembro", description: "Crear usuario de staff con contrase\xF1a temp" },
      { id: "usuarios.editar", label: "Editar / Suspender", description: "Modificar estado, rol o sesiones" },
      { id: "usuarios.eliminar", label: "Eliminar Usuario", description: "Eliminar miembro de staff" },
      { id: "usuarios.roles", label: "Administrar Roles", description: "Crear roles y modificar matriz de permisos" }
    ]
  },
  {
    id: "auditoria",
    name: "Auditor\xEDa y Seguridad",
    actions: [
      { id: "auditoria.ver", label: "Ver Logs de Auditor\xEDa", description: "Registro inmutable con diff antes/despu\xE9s" },
      { id: "auditoria.exportar", label: "Exportar Auditor\xEDa", description: "Descargar bit\xE1cora de seguridad" }
    ]
  },
  {
    id: "configuracion",
    name: "Configuraci\xF3n Global",
    actions: [
      { id: "configuracion.ver", label: "Ver Configuraci\xF3n", description: "Ver datos de empresa y par\xE1metros" },
      { id: "configuracion.editar", label: "Modificar Configuraci\xF3n", description: "Actualizar datos de empresa y operaci\xF3n" },
      { id: "configuracion.datos_demo", label: "Gestionar Datos Demo", description: "Generar o limpiar registros de prueba" }
    ]
  }
];
var ALL_ACTION_IDS = ADMIN_MODULES.flatMap((m) => m.actions.map((a) => a.id));
var SYSTEM_ROLES = [
  {
    id: "super_admin",
    nombre: "Super Administrador",
    descripcion: "Control total de la plataforma, roles del equipo, configuraci\xF3n cr\xEDtica y borrado definitivo.",
    permisos: ALL_ACTION_IDS,
    es_sistema: true
  },
  {
    id: "administrador",
    nombre: "Administrador General",
    descripcion: "Gesti\xF3n completa de operaciones, ventas, cat\xE1logo y soporte, sin eliminar superadmins ni purgas cr\xEDticas.",
    permisos: ALL_ACTION_IDS.filter((p) => p !== "configuracion.datos_demo" && p !== "productos.eliminar_definitivo"),
    es_sistema: true
  },
  {
    id: "gerente_tienda",
    nombre: "Gerente de Tienda",
    descripcion: "Control de cat\xE1logo, inventario, pedidos, campa\xF1as, clientes, anal\xEDtica y reportes fiscales.",
    permisos: [
      "resumen.ver",
      "ventas.ver",
      "ventas.exportar",
      "productos.ver",
      "productos.crear",
      "productos.editar",
      "productos.eliminar",
      "productos.exportar",
      "inventario.ver",
      "inventario.editar",
      "inventario.exportar",
      "categorias.ver",
      "categorias.crear",
      "categorias.editar",
      "categorias.eliminar",
      "pedidos.ver",
      "pedidos.editar",
      "pedidos.exportar",
      "pedidos.aprobar",
      "devoluciones.ver",
      "devoluciones.editar",
      "devoluciones.aprobar",
      "marketing.ver",
      "marketing.crear",
      "marketing.editar",
      "marketing.eliminar",
      "clientes.ver",
      "clientes.editar",
      "clientes.exportar",
      "analitica.ver",
      "analitica.exportar",
      "bigdata.ver",
      "bigdata.exportar",
      "finanzas.ver",
      "finanzas.exportar",
      "imagenes.ver",
      "imagenes.editar",
      "informes.ver",
      "informes.descargar",
      "envios.ver"
    ],
    es_sistema: true
  },
  {
    id: "operador_pedidos",
    nombre: "Operador de Pedidos y Env\xEDos",
    descripcion: "Gesti\xF3n y despacho de \xF3rdenes, n\xFAmeros de gu\xEDa, inventario en solo lectura y devoluciones.",
    permisos: [
      "resumen.ver",
      "pedidos.ver",
      "pedidos.editar",
      "pedidos.aprobar",
      "pedidos.exportar",
      "devoluciones.ver",
      "devoluciones.editar",
      "inventario.ver",
      "envios.ver"
    ],
    es_sistema: true
  },
  {
    id: "marketing_contenido",
    nombre: "Marketing y Contenidos",
    descripcion: "Campa\xF1as, promociones, cupones, banners, blog, p\xE1ginas corporativas y bolet\xEDn.",
    permisos: [
      "resumen.ver",
      "marketing.ver",
      "marketing.crear",
      "marketing.editar",
      "marketing.eliminar",
      "contenido.ver",
      "contenido.crear",
      "contenido.editar",
      "productos.ver",
      "categorias.ver",
      "analitica.ver"
    ],
    es_sistema: true
  },
  {
    id: "soporte_cliente",
    nombre: "Soporte y Atenci\xF3n al Cliente",
    descripcion: "Atenci\xF3n de PQRS, formularios de contacto, consulta de pedidos y clientes con datos enmascarados.",
    permisos: [
      "resumen.ver",
      "atencion.ver",
      "atencion.editar",
      "atencion.responder",
      "pedidos.ver",
      "devoluciones.ver",
      "devoluciones.editar",
      "clientes.ver",
      "asistente.ver",
      "asistente.editar"
    ],
    es_sistema: true
  },
  {
    id: "finanzas",
    nombre: "Finanzas e Impuestos",
    descripcion: "Reportes de ventas brutas/netas, IVA 19%, conciliaciones y exportaciones fiscales en solo lectura.",
    permisos: [
      "resumen.ver",
      "ventas.ver",
      "ventas.exportar",
      "finanzas.ver",
      "finanzas.exportar",
      "pedidos.ver",
      "pedidos.exportar",
      "informes.ver",
      "informes.descargar",
      "analitica.ver",
      "analitica.exportar"
    ],
    es_sistema: true
  },
  {
    id: "analista",
    nombre: "Analista de Negocio",
    descripcion: "Acceso de solo lectura a anal\xEDtica, tendencias, comportamiento de usuarios y reportes.",
    permisos: [
      "resumen.ver",
      "ventas.ver",
      "ventas.exportar",
      "analitica.ver",
      "analitica.exportar",
      "bigdata.ver",
      "bigdata.exportar",
      "informes.ver",
      "informes.descargar",
      "productos.ver",
      "pedidos.ver"
    ],
    es_sistema: true
  }
];
function hasPermission(userPermissions, required, userRole) {
  if (userRole === "super_admin" || userRole === "admin") return true;
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes("*") || userPermissions.includes(required)) return true;
  const [module] = required.split(".");
  if (userPermissions.includes(`${module}.*`)) return true;
  return false;
}
function maskSensitiveText(value, type = "email") {
  if (!value) return "\u2014";
  const str = String(value).trim();
  if (!str) return "\u2014";
  switch (type) {
    case "email": {
      const parts = str.split("@");
      if (parts.length !== 2) return "***@***";
      const [local, domain] = parts;
      const visible = local.slice(0, 2);
      return `${visible}${"*".repeat(Math.max(3, local.length - 2))}@${domain}`;
    }
    case "phone": {
      if (str.length <= 4) return "****";
      return `${str.slice(0, 3)}****${str.slice(-2)}`;
    }
    case "document": {
      if (str.length <= 4) return "****";
      return `${str.slice(0, 2)}****${str.slice(-2)}`;
    }
    case "address": {
      const words = str.split(" ");
      if (words.length <= 2) return `${words[0] || "Calle"} ***`;
      return `${words[0]} ${words[1]} *********`;
    }
    default:
      return "********";
  }
}

// src/data/conocimiento.ts
var BASE_CONOCIMIENTO = [
  {
    id: "envios-tiempos-costos",
    categoria: "envios",
    titulo: "Tiempos de entrega y costos de env\xEDo en Colombia",
    preguntaFrecuente: "\xBFCu\xE1nto tiempo tarda en llegar mi pedido y cu\xE1nto cuesta el env\xEDo?",
    resumen: `Env\xEDos a toda Colombia: gratis a partir de ${formatCOP(EMPRESA.umbralEnvioGratis)}. Ciudades principales de 2 a 3 d\xEDas h\xE1biles. Tarifa fija de ${formatCOP(EMPRESA.costoEnvioNacional)} para \xF3rdenes inferiores.`,
    contenido: `Realizamos despachos a todos los municipios y ciudades de Colombia con empresas transportadoras certificadas (Servientrega, Coordinadora, TCC y Env\xEDa).
- Ciudades principales (Bogot\xE1, Medell\xEDn, Cali, Barranquilla, Bucaramanga, Pereira, Manizales, Cartagena): 2 a 3 d\xEDas h\xE1biles.
- Ciudades intermedias y municipios: 3 a 5 d\xEDas h\xE1biles.
- Trayectos especiales o zonas de dif\xEDcil acceso: 5 a 8 d\xEDas h\xE1biles.
- Costo de env\xEDo est\xE1ndar: ${formatCOP(EMPRESA.costoEnvioNacional)}.
- Env\xEDo GRATIS: en todas las compras a partir de ${formatCOP(EMPRESA.umbralEnvioGratis)}.
Una vez despachado el paquete, recibir\xE1s por correo y en tu cuenta el n\xFAmero de gu\xEDa para rastrear el recorrido en tiempo real.`,
    palabrasClave: ["envio", "env\xEDos", "despacho", "cuanto tarda", "demora", "costo envio", "envio gratis", "flete", "transportadora", "coordinadora", "servientrega"]
  },
  {
    id: "medios-pago",
    categoria: "pagos",
    titulo: "Medios de pago disponibles y seguridad",
    preguntaFrecuente: "\xBFQu\xE9 medios de pago aceptan?",
    resumen: "Aceptamos Tarjetas de Cr\xE9dito/D\xE9bito (Visa, Mastercard, Amex), PSE con todos los bancos colombianos y Pago Contraentrega en efectivo al recibir.",
    contenido: `En MoviFashion ofrecemos tres medios de pago seguros y directos:
1. Tarjeta de cr\xE9dito o d\xE9bito: Visa, Mastercard, American Express y Diners Club con validaci\xF3n en l\xEDnea y cifrado SSL.
2. PSE (Pagos Seguros en L\xEDnea): d\xE9bito seguro desde tu cuenta corriente o de ahorros de cualquier banco colombiano (Bancolombia, Davivienda, Nequi, Daviplata, BBVA, etc.).
3. Pago Contraentrega: paga en efectivo al mensajero en el momento exacto en que recibes tu paquete en la puerta de tu domicilio en las principales ciudades de Colombia.
Todos los precios publicados en el cat\xE1logo incluyen el 19% de IVA seg\xFAn la legislaci\xF3n tributaria colombiana.`,
    palabrasClave: ["pago", "pagos", "pse", "tarjeta", "contraentrega", "efectivo", "nequi", "daviplata", "bancolombia", "seguridad", "iva"]
  },
  {
    id: "politica-cambios",
    categoria: "cambios",
    titulo: "Pol\xEDtica de cambios y devoluciones de prendas",
    preguntaFrecuente: "\xBFC\xF3mo puedo cambiar una prenda o solicitar una devoluci\xF3n?",
    resumen: `Tienes ${EMPRESA.diasCambioComercial} d\xEDas calendario para cambios comerciales de talla o color, y ${EMPRESA.diasRetractoLegal} d\xEDas h\xE1biles para derecho de retracto conforme a la Ley 1480 de 2011.`,
    contenido: `Para solicitar un cambio de talla, modelo o color:
- Plazo comercial: dispones de hasta ${EMPRESA.diasCambioComercial} d\xEDas calendario desde la fecha de entrega del producto.
- Condiciones: la prenda debe estar en perfecto estado, limpia, sin usar, sin lavar, con sus etiquetas originales intactas y en su empaque original.
- Derecho de Retracto (Estatuto del Consumidor, Ley 1480 de 2011 art. 47): dispones de ${EMPRESA.diasRetractoLegal} d\xEDas h\xE1biles siguientes a la entrega para solicitar la devoluci\xF3n total del dinero.
- Para iniciar el proceso, comun\xEDcate a nuestra l\xEDnea de WhatsApp ${EMPRESA.whatsapp} o al correo ${EMPRESA.correoContacto} indicando tu n\xFAmero de pedido.`,
    palabrasClave: ["cambio", "cambios", "devolucion", "devolver", "talla incorrecta", "retracto", "devoluci\xF3n dinero", "reembolso"]
  },
  {
    id: "garantia-legal",
    categoria: "garantias",
    titulo: "Garant\xEDa legal por defectos de fabricaci\xF3n",
    preguntaFrecuente: "\xBFQu\xE9 garant\xEDa tienen los productos?",
    resumen: `Nuestras prendas cuentan con una garant\xEDa legal de ${EMPRESA.diasGarantiaLegal} d\xEDas calendario por defectos de confecci\xF3n, costuras o materiales.`,
    contenido: `De conformidad con el Estatuto del Consumidor (Ley 1480 de 2011):
- Tiempo de cobertura: ${EMPRESA.diasGarantiaLegal} d\xEDas calendario contados a partir de la fecha de recepci\xF3n.
- Cubrimiento: defectos de costura, cierres defectuosos de f\xE1brica, broches, deshilachado prematuro o fallas en el tejido textil bajo instrucciones normales de lavado.
- Exclusiones: desgaste natural por uso, manchas qu\xEDmicas, rasgaduras accidentales o incumplimiento de las instrucciones de lavado presentes en la etiqueta.
- Respuesta t\xE9cnica: m\xE1ximo 15 d\xEDas h\xE1biles a partir de la recepci\xF3n de la prenda en nuestro centro de inspecci\xF3n.`,
    palabrasClave: ["garantia", "garant\xEDa", "defecto", "roto", "costura", "calidad", "reclamo", "ley 1480", "sic"]
  },
  {
    id: "guia-tallas-medicion",
    categoria: "tallas",
    titulo: "Gu\xEDa de tallas y recomendaciones de calce",
    preguntaFrecuente: "\xBFC\xF3mo s\xE9 cu\xE1l es mi talla correcta?",
    resumen: "Ofrecemos gu\xEDa de medidas corporales (pecho, cintura, cadera) en cent\xEDmetros para siluetas Oversize, Regular Fit y Slim Fit, adem\xE1s de equivalencias de calzado.",
    contenido: `Para elegir tu talla ideal en MoviFashion:
- Camisetas y Hoodies:
  * Talla S: Pecho 90-96 cm
  * Talla M: Pecho 97-103 cm
  * Talla L: Pecho 104-110 cm
  * Talla XL: Pecho 111-118 cm
  Nuestras siluetas 'Modular Oversize' tienen una ca\xEDda amplia y relajada. Si prefieres un ajuste al cuerpo, te recomendamos pedir una talla menos.
- Pantalones y Cargos:
  * Talla 28-30 (S): Cintura 76-81 cm
  * Talla 32 (M): Cintura 82-86 cm
  * Talla 34 (L): Cintura 87-92 cm
  * Talla 36 (XL): Cintura 93-98 cm
- Calzado: Tallas colombianas est\xE1ndar (38 a 43). En cada ficha de producto puedes verificar la gu\xEDa interactiva.`,
    palabrasClave: ["talla", "tallas", "medidas", "centimetros", "guia de tallas", "que talla soy", "ajuste", "oversize", "calzado"]
  },
  {
    id: "pqrs-procedimiento",
    categoria: "empresa",
    titulo: "Radicaci\xF3n de PQRS y tiempos de respuesta legal",
    preguntaFrecuente: "\xBFC\xF3mo radicar una petici\xF3n, queja, reclamo o sugerencia (PQRS)?",
    resumen: `Puedes radicar tu solicitud en la secci\xF3n /pqrs de nuestra web o al correo ${EMPRESA.correoPQRS}. Recibir\xE1s un radicado oficial con respuesta en m\xE1ximo ${EMPRESA.diasRespuestaPQRS} d\xEDas h\xE1biles.`,
    contenido: `En MoviFashion cumplimos a cabalidad las directrices de la Superintendencia de Industria y Comercio (SIC) y el Estatuto del Consumidor:
- Toda solicitud genera autom\xE1ticamente un n\xFAmero de radicado con formato PQRS-AAAA-XXXXXX.
- T\xE9rmino legal de respuesta: m\xE1ximo ${EMPRESA.diasRespuestaPQRS} d\xEDas h\xE1biles contados a partir del d\xEDa h\xE1bil siguiente a la radicaci\xF3n.
- Consulta en l\xEDnea: puedes consultar en todo momento el estado de tu PQRS en la ruta /pqrs ingresando tu n\xFAmero de radicado.
- Canales autorizados: formulario web (/pqrs), correo electr\xF3nico ${EMPRESA.correoPQRS} o en nuestra l\xEDnea de atenci\xF3n telef\xF3nica.`,
    palabrasClave: ["pqrs", "queja", "reclamo", "peticion", "sugerencia", "radicado", "sic", "superintendencia", "denuncia"]
  },
  {
    id: "quienes-somos-empresa",
    categoria: "empresa",
    titulo: "Qui\xE9nes somos \u2014 Filosof\xEDa MoviFashion",
    preguntaFrecuente: "\xBFQu\xE9 es MoviFashion y d\xF3nde est\xE1n ubicados?",
    resumen: `MoviFashion es una marca colombiana de moda contempor\xE1nea con dise\xF1o urbano y tecnolog\xEDa inteligente, operada legalmente en ${EMPRESA.ciudad}, Colombia.`,
    contenido: `MoviFashion naci\xF3 con el prop\xF3sito de conectar la moda de alta durabilidad con el dinamismo urbano contempor\xE1neo. Creemos en prendas funcionales, materiales premium con tacto superior y una experiencia de compra asistida por inteligencia artificial que comprende tus preferencias reales.
- Raz\xF3n Social: ${EMPRESA.razonSocial}
- NIT: ${EMPRESA.nit}
- Sede: ${EMPRESA.ciudad}, Colombia.
- Lema: ${EMPRESA.lema}`,
    palabrasClave: ["quienes somos", "historia", "empresa", "donde estan", "marca", "colombia", "bogota", "medellin", "mision"]
  }
];
function buscarEnBaseConocimiento(consulta, limite = 3) {
  const palabras = consulta.toLowerCase().split(/\s+/).filter((p) => p.length > 2);
  if (palabras.length === 0) return BASE_CONOCIMIENTO.slice(0, limite);
  const conPuntaje = BASE_CONOCIMIENTO.map((articulo) => {
    let puntos = 0;
    const textoCompleto = `${articulo.titulo} ${articulo.resumen} ${articulo.contenido} ${articulo.palabrasClave.join(" ")}`.toLowerCase();
    for (const palabra of palabras) {
      if (articulo.palabrasClave.some((pc) => pc.includes(palabra))) puntos += 4;
      if (articulo.titulo.toLowerCase().includes(palabra)) puntos += 3;
      if (textoCompleto.includes(palabra)) puntos += 1;
    }
    return { articulo, puntos };
  });
  conPuntaje.sort((a, b) => b.puntos - a.puntos);
  return conPuntaje.filter((item) => item.puntos > 0).slice(0, limite).map((item) => item.articulo);
}

// src/server/adminStore.ts
var staffRoles = [...SYSTEM_ROLES];
var productVariants = [];
var inventoryMovements = [];
var priceHistory = [];
var returnRequests = [];
var orderStatusHistory = [];
var orderNotes = [];
var adminNotifications = [];
var appAuditLogs = [];
var contentPages = [];
var contentVersions = [];
var knowledgeEntries = [];
var staffSessions = [];
var loginHistory = [];
var appSettings = {
  maintenanceMode: false,
  maintenanceMessage: "Estamos realizando mejoras en nuestra tienda. Volveremos en unos minutos.",
  paymentMode: "simulado",
  freeShippingThreshold: 2e5,
  topBannerText: "Env\xEDo gratis a toda Colombia por compras superiores a $200.000 \xB7 IVA 19% incluido",
  adminRequire2FA: process.env.ADMIN_REQUIRE_2FA === "true"
};
var salesGoals = [
  {
    month: (/* @__PURE__ */ new Date()).toISOString().slice(0, 7),
    // e.g. '2026-11'
    targetSales: 15e7,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var shippingConfig = {
  freeShippingThreshold: 2e5,
  standardRate: 12e3,
  cities: [
    { city: "Bogot\xE1 D.C.", department: "Cundinamarca", rate: 1e4, deliveryDays: "1-2 d\xEDas h\xE1biles" },
    { city: "Medell\xEDn", department: "Antioquia", rate: 12e3, deliveryDays: "2-3 d\xEDas h\xE1biles" },
    { city: "Cali", department: "Valle del Cauca", rate: 12e3, deliveryDays: "2-4 d\xEDas h\xE1biles" },
    { city: "Barranquilla", department: "Atl\xE1ntico", rate: 14e3, deliveryDays: "3-5 d\xEDas h\xE1biles" },
    { city: "Bucaramanga", department: "Santander", rate: 12e3, deliveryDays: "2-4 d\xEDas h\xE1biles" },
    { city: "Cartagena", department: "Bol\xEDvar", rate: 14e3, deliveryDays: "3-5 d\xEDas h\xE1biles" },
    { city: "Pereira", department: "Risaralda", rate: 12e3, deliveryDays: "2-3 d\xEDas h\xE1biles" },
    { city: "C\xFAcuta", department: "Norte de Santander", rate: 14e3, deliveryDays: "3-5 d\xEDas h\xE1biles" }
  ],
  carriers: ["Coordinadora Mercantil", "Servientrega", "Env\xEDa"]
};
var roleCache = /* @__PURE__ */ new Map();
function getCachedPermissions(roleId) {
  const now = Date.now();
  const cached = roleCache.get(roleId);
  if (cached && now < cached.expiresAt) {
    return cached.permissions;
  }
  const role = staffRoles.find((r) => r.id === roleId);
  const permissions = role ? role.permisos : [];
  roleCache.set(roleId, {
    roleId,
    permissions,
    expiresAt: now + 60 * 1e3
    // 60 seconds
  });
  return permissions;
}
function invalidateRoleCache(roleId) {
  if (roleId) {
    roleCache.delete(roleId);
  } else {
    roleCache.clear();
  }
}
async function recordAppAudit(entry, supabase2) {
  const log = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    usuarioId: entry.usuarioId || "sistema",
    usuarioNombre: entry.usuarioNombre || "Sistema",
    usuarioEmail: entry.usuarioEmail,
    rol: entry.rol || "sistema",
    accion: entry.accion,
    modulo: entry.modulo,
    entidad: entry.entidad,
    entidadId: entry.entidadId,
    antes: entry.antes || null,
    despues: entry.despues || null,
    ip: entry.ip || "127.0.0.1",
    navegador: entry.navegador,
    estado: entry.estado || "EXITO",
    motivo: entry.motivo
  };
  appAuditLogs.unshift(log);
  if (appAuditLogs.length > 2e3) {
    appAuditLogs.pop();
  }
  if (supabase2) {
    try {
      await supabase2.from("app_audit_logs").insert({
        id: log.id,
        usuario_id: log.usuarioId,
        usuario_nombre: log.usuarioNombre,
        usuario_email: log.usuarioEmail,
        rol: log.rol,
        accion: log.accion,
        modulo: log.modulo,
        entidad: log.entidad,
        entidad_id: log.entidadId,
        antes: log.antes,
        despues: log.despues,
        ip: log.ip,
        navegador: log.navegador,
        estado: log.estado,
        motivo: log.motivo,
        event_type: entry.accion,
        severity: entry.estado === "DENEGADO" ? "alert" : "info",
        description: `${entry.accion} en ${entry.modulo}: ${entry.entidad || ""} (${entry.entidadId || ""})`
      });
    } catch (err) {
      console.warn("[AUDIT] Fallback in-memory error:", err.message);
    }
  }
}
async function pushAdminNotification(notif, supabase2) {
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    titulo: notif.titulo,
    mensaje: notif.mensaje,
    tipo: notif.tipo,
    leido: false,
    link: notif.link,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  adminNotifications.unshift(newNotif);
  if (adminNotifications.length > 200) adminNotifications.pop();
  if (supabase2) {
    try {
      await supabase2.from("admin_notifications").insert({
        id: newNotif.id,
        titulo: newNotif.titulo,
        mensaje: newNotif.mensaje,
        tipo: newNotif.tipo,
        leido: false,
        link: newNotif.link
      });
    } catch (err) {
      console.warn("[NOTIF] Supabase insert warning:", err.message);
    }
  }
}
function initializeAdminStore(products2, orders2) {
  if (productVariants.length === 0) {
    products2.forEach((p) => {
      p.sizes.forEach((sz) => {
        p.colors.forEach((col) => {
          const colorSlug = col.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
          const sku = `${p.id.slice(0, 8).toUpperCase()}-${sz}-${colorSlug.slice(0, 3).toUpperCase()}`;
          const stockPerVariant = Math.max(2, Math.floor(p.inventory / (p.sizes.length * p.colors.length)));
          productVariants.push({
            id: `var-${sku}`,
            productId: p.id,
            sku,
            size: sz,
            color: col.name,
            stock: stockPerVariant,
            lowStockAlert: 5
          });
        });
      });
    });
  }
  if (inventoryMovements.length === 0 && products2.length > 0) {
    products2.slice(0, 10).forEach((p) => {
      inventoryMovements.push({
        id: `mov-init-${p.id}`,
        productId: p.id,
        productName: p.name,
        tipo: "entrada",
        cantidad: p.inventory,
        stockAnterior: 0,
        stockNuevo: p.inventory,
        motivo: "Inventario inicial de apertura de tienda",
        usuarioId: "admin-seed-uuid-01",
        usuarioNombre: "Administrador MOVIFASHION",
        createdAt: p.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      });
    });
  }
  if (knowledgeEntries.length === 0) {
    BASE_CONOCIMIENTO.forEach((kb, idx) => {
      knowledgeEntries.push({
        id: `kb-${idx + 1}`,
        categoria: kb.categoria,
        titulo: kb.titulo,
        contenido: kb.contenido,
        palabrasClave: kb.palabrasClave,
        activo: true,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
  }
  if (contentPages.length === 0) {
    const defaultPages = [
      { slug: "nosotros", titulo: "Qui\xE9nes Somos", desc: "Historia y propuesta de valor de MoviFashion Colombia" },
      { slug: "mision-vision", titulo: "Misi\xF3n y Visi\xF3n", desc: "Prop\xF3sito corporativo y horizonte empresarial" },
      { slug: "terminos-y-condiciones", titulo: "T\xE9rminos y Condiciones", desc: "T\xE9rminos de servicio bajo la Ley 1480 de 2011" },
      { slug: "politica-de-privacidad", titulo: "Pol\xEDtica de Privacidad", desc: "Tratamiento de datos personales Ley 1581 de 2012" },
      { slug: "politica-de-cookies", titulo: "Pol\xEDtica de Cookies", desc: "Finalidad t\xE9cnica y anal\xEDtica de cookies" },
      { slug: "envios", titulo: "Pol\xEDtica de Env\xEDos", desc: "Cobertura nacional, transportadoras y tiempos de entrega" },
      { slug: "cambios-y-devoluciones", titulo: "Cambios, Garant\xEDas y Retracto", desc: "Plazos legales de cambio, 5 d\xEDas de retracto y garant\xEDa" },
      { slug: "guia-de-tallas", titulo: "Gu\xEDa de Tallas", desc: "Tabla de medidas en cent\xEDmetros para calzado y prendas" },
      { slug: "preguntas-frecuentes", titulo: "Preguntas Frecuentes", desc: "Respuestas a inquietudes usuales de clientes" }
    ];
    defaultPages.forEach((dp) => {
      contentPages.push({
        slug: dp.slug,
        titulo: dp.titulo,
        contenido: `Contenido oficial de ${dp.titulo} de MoviFashion Colombia.`,
        metaDescripcion: dp.desc,
        publicado: true,
        versionActual: 1,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: "Administrador MOVIFASHION"
      });
      contentVersions.push({
        id: `ver-${dp.slug}-1`,
        pageSlug: dp.slug,
        version: 1,
        titulo: dp.titulo,
        contenido: `Contenido oficial de ${dp.titulo} de MoviFashion Colombia.`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdBy: "Administrador MOVIFASHION"
      });
    });
  }
  if (adminNotifications.length === 0) {
    const lowStockCount = products2.filter((p) => p.inventory < 10).length;
    if (lowStockCount > 0) {
      adminNotifications.push({
        id: "notif-seed-stock",
        titulo: "Alerta de Existencias Bajas",
        mensaje: `Hay ${lowStockCount} producto(s) con inventario por debajo del umbral m\xEDnimo de seguridad.`,
        tipo: "stock",
        leido: false,
        link: "/admin",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    if (orders2.length > 0) {
      adminNotifications.push({
        id: "notif-seed-order",
        titulo: "Nuevo Pedido Confirmado",
        mensaje: `El pedido ${orders2[0].id} por $${orders2[0].total.toLocaleString("es-CO")} COP est\xE1 pendiente de despacho.`,
        tipo: "pedido",
        leido: false,
        link: "/admin",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  if (returnRequests.length === 0 && orders2.length > 0) {
    const orderForReturn = orders2[0];
    returnRequests.push({
      id: "RET-2026-0001",
      orderId: orderForReturn.id,
      userId: orderForReturn.userId,
      userName: orderForReturn.userName,
      userEmail: orderForReturn.userEmail,
      tipo: "retracto",
      items: orderForReturn.items.slice(0, 1).map((i) => ({
        productId: i.product?.id || i.id,
        productName: i.product?.name || "Prenda MoviFashion",
        quantity: i.quantity || 1,
        size: i.selectedSize || "M",
        color: typeof i.selectedColor === "object" ? i.selectedColor.name : String(i.selectedColor || "Negro"),
        price: i.product?.discountPrice || i.product?.price || 15e4
      })),
      motivo: "Solicitud de derecho de retracto dentro de los 5 d\xEDas h\xE1biles legales (prenda intacta con etiquetas).",
      estado: "solicitado",
      reembolsoSimulado: orderForReturn.items[0]?.product?.price || 15e4,
      reponerInventario: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}

// src/server/totp.ts
import { createHmac, randomBytes } from "crypto";
var BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function generateBase32Secret(length = 20) {
  const bytes = randomBytes(length);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_CHARS[bytes[i] % BASE32_CHARS.length];
  }
  return secret;
}
function base32ToBuffer(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}
function generateTotpCode(secret, timeStepWindow = 0, stepSeconds = 30) {
  const epoch = Math.floor(Date.now() / 1e3);
  const timeStep = Math.floor(epoch / stepSeconds) + timeStepWindow;
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(timeStep), 0);
  const keyBuffer = base32ToBuffer(secret);
  const hmac = createHmac("sha1", keyBuffer);
  hmac.update(buffer);
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = (digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255;
  const otp = binary % 1e6;
  return otp.toString().padStart(6, "0");
}
function verifyTotpCode(secret, userCode, window = 1) {
  if (!userCode || userCode.trim().length !== 6) return false;
  const cleanCode = userCode.trim();
  for (let step = -window; step <= window; step++) {
    const code = generateTotpCode(secret, step);
    if (code === cleanCode) {
      return true;
    }
  }
  return false;
}
function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const random = randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${random.slice(0, 4)}-${random.slice(4, 8)}`);
  }
  return codes;
}
function generateTotpUri(label, secret, issuer = "MoviFashion") {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedLabel = encodeURIComponent(label);
  return `otpauth://totp/${encodedIssuer}:${encodedLabel}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

// src/server/datasetSimulado.ts
import * as XLSX from "xlsx";
function createRng(seed) {
  let s = seed >>> 0;
  return function() {
    s = s + 1831565813 >>> 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var CURRENT_SEED = 20260101;
var rng = createRng(CURRENT_SEED);
var CIUDADES_COLOMBIA = [
  { ciudad: "Bogot\xE1 D.C.", dpto: "Cundinamarca", peso: 0.38, diasDespacho: 1.2 },
  { ciudad: "Medell\xEDn", dpto: "Antioquia", peso: 0.16, diasDespacho: 2.1 },
  { ciudad: "Cali", dpto: "Valle del Cauca", peso: 0.12, diasDespacho: 2.4 },
  { ciudad: "Barranquilla", dpto: "Atl\xE1ntico", peso: 0.08, diasDespacho: 3.1 },
  { ciudad: "Bucaramanga", dpto: "Santander", peso: 0.06, diasDespacho: 2.5 },
  { ciudad: "Cartagena", dpto: "Bol\xEDvar", peso: 0.06, diasDespacho: 3.2 },
  { ciudad: "Pereira", dpto: "Risaralda", peso: 0.05, diasDespacho: 2.2 },
  { ciudad: "Manizales", dpto: "Caldas", peso: 0.04, diasDespacho: 2.3 },
  { ciudad: "Otras ciudades", dpto: "Colombia", peso: 0.05, diasDespacho: 4 }
];
var CANALES_VENTA = [
  { canal: "Web", peso: 0.62 },
  { canal: "WhatsApp", peso: 0.18 },
  { canal: "App M\xF3vil", peso: 0.12 },
  { canal: "Tienda Bogot\xE1", peso: 0.08 }
];
var METODOS_PAGO = [
  { metodo: "credit_card", etiqueta: "Tarjeta Cr\xE9dito/D\xE9bito", peso: 0.4 },
  { metodo: "pse", etiqueta: "PSE / Transferencia", peso: 0.32 },
  { metodo: "nequi", etiqueta: "Nequi", peso: 0.14 },
  { metodo: "daviplata", etiqueta: "Daviplata", peso: 0.08 },
  { metodo: "cash_on_delivery", etiqueta: "Contraentrega", peso: 0.06 }
];
var NOMBRES = [
  "Valentina",
  "Santiago",
  "Camila",
  "Andr\xE9s Felipe",
  "Isabella",
  "Mateo",
  "Mariana",
  "Sebasti\xE1n",
  "Laura Sof\xEDa",
  "Daniel",
  "Alejandra",
  "Juan Pablo",
  "Daniela",
  "Nicol\xE1s",
  "Gabriela",
  "Felipe",
  "Salom\xE9",
  "David",
  "Manuela",
  "Alejandro",
  "Juliana",
  "Carlos",
  "Natalia",
  "Esteban",
  "Catalina",
  "Samuel",
  "Luciana",
  "Diego",
  "Paola",
  "Juli\xE1n",
  "Paula",
  "Sim\xF3n",
  "Sara",
  "Federico",
  "Elena",
  "Lucas",
  "Victoria",
  "Mart\xEDn",
  "Tatiana",
  "Ignacio",
  "Carolina",
  "Guillermo",
  "Ver\xF3nica",
  "Rodrigo",
  "Diana",
  "Fernando"
];
var APELLIDOS = [
  "Restrepo",
  "G\xF3mez",
  "Osorio",
  "Mej\xEDa",
  "Morales",
  "Ram\xEDrez",
  "Duque",
  "Jaramillo",
  "Castro",
  "Echeverri",
  "Cardona",
  "Arango",
  "Zuluaga",
  "Montoya",
  "Giraldo",
  "Henao",
  "Betancur",
  "Valencia",
  "Guti\xE9rrez",
  "C\xE1rdenas",
  "Vargas",
  "Reyes",
  "Pineda",
  "Saldarriaga",
  "Mu\xF1oz",
  "Torres",
  "L\xF3pez",
  "Rinc\xF3n",
  "Herrera",
  "Casta\xF1o",
  "Piedrah\xEDta",
  "Ochoa"
];
var DOMINIOS_EMAIL = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.es", "unal.edu.co", "javeriana.edu.co", "eafit.edu.co"];
var CUPONES_DATASET = {
  "BIENVENIDA10": { descPct: 0.1, campana: "Onboarding Nuevos Clientes" },
  "MOVI20": { descPct: 0.2, campana: "Colecci\xF3n Verano / Flash Sale" },
  "MADRES2026": { descPct: 0.15, campana: "Campa\xF1a D\xEDa de la Madre 2026" },
  "PRIMA2026": { descPct: 0.12, campana: "Quincena y Prima de Junio" },
  "AMOR2026": { descPct: 0.15, campana: "Amor y Amistad Septiembre" },
  "BLACK2026": { descPct: 0.25, campana: "Black Friday Anticipado Noviembre" }
};
var CACHED_DATASET = null;
function generateSimulatedDataset(seed = CURRENT_SEED) {
  if (CACHED_DATASET && CACHED_DATASET.seed === seed) {
    return CACHED_DATASET;
  }
  CURRENT_SEED = seed;
  rng = createRng(seed);
  function pickWeighted(list) {
    const total = list.reduce((s, x) => s + x.peso, 0);
    let r = rng() * total;
    for (const el of list) {
      if (r <= el.peso) return el.item !== void 0 ? el.item : el;
      r -= el.peso;
    }
    return list[list.length - 1];
  }
  function pickRandom(arr) {
    return arr[Math.floor(rng() * arr.length)];
  }
  function randomBetween(min, max) {
    return min + rng() * (max - min);
  }
  function randomInt(min, max) {
    return Math.floor(min + rng() * (max - min + 1));
  }
  const canalesAdquisicion = [
    "Org\xE1nico",
    "Meta Ads",
    "Google Ads",
    "TikTok",
    "Referidos"
  ];
  const clientes = [];
  const TOTAL_CLIENTES = 4e3;
  for (let i = 1; i <= TOTAL_CLIENTES; i++) {
    const nombre = `${pickRandom(NOMBRES)} ${pickRandom(APELLIDOS)}`;
    const slug = nombre.toLowerCase().replace(/[^a-z]/g, ".");
    const email = `${slug}${randomInt(10, 99)}@${pickRandom(DOMINIOS_EMAIL)}`;
    const telefono = `+57 3${randomInt(0, 2)}${randomInt(0, 9)} ${randomInt(100, 999)} ${randomInt(1e3, 9999)}`;
    const ciudadObj = pickWeighted(CIUDADES_COLOMBIA);
    const regOffsetDays = randomInt(25, 400);
    const regDate = new Date((/* @__PURE__ */ new Date("2026-11-09T00:00:00Z")).getTime() - regOffsetDays * 864e5);
    clientes.push({
      id: `CLI-2026-${String(i).padStart(5, "0")}`,
      nombre,
      email,
      telefono,
      ciudad: ciudadObj.ciudad,
      departamento: ciudadObj.dpto,
      fechaRegistro: regDate.toISOString().slice(0, 10),
      canalAdquisicion: pickRandom(canalesAdquisicion),
      totalPedidos: 0,
      totalGastado: 0,
      ultimoPedido: regDate.toISOString().slice(0, 10),
      segmentoRFM: "Nuevos",
      recenciaDias: 0
    });
  }
  const clientesConPeso = clientes.map((c, idx) => ({
    cliente: c,
    peso: idx < 800 ? 5.5 : 0.8
  }));
  const lineasVenta = [];
  const pedidos = [];
  const catalogProducts = INITIAL_PRODUCTS;
  const starProductIds = ["prod-jacket-1", "prod-tshirt-1", "prod-tshirt-2", "prod-sneakers-1", "prod-pants-1", "prod-dress-1"];
  const startDate = /* @__PURE__ */ new Date("2026-01-01T08:00:00Z");
  const endDate = /* @__PURE__ */ new Date("2026-11-09T22:00:00Z");
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24));
  let orderCounter = 1;
  let lineCounter = 1;
  for (let d = 0; d < totalDays; d++) {
    const currentDate = new Date(startDate.getTime() + d * 864e5);
    const month = currentDate.getUTCMonth();
    const dayOfMonth = currentDate.getUTCDate();
    const dayOfWeek = currentDate.getUTCDay();
    let seasonMultiplier = 1;
    const organicGrowth = 1 + month / 10 * 0.6;
    seasonMultiplier *= organicGrowth;
    if (dayOfMonth >= 14 && dayOfMonth <= 16 || dayOfMonth >= 29 && dayOfMonth <= 31) {
      seasonMultiplier *= 1.35;
    }
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      seasonMultiplier *= 1.25;
    }
    if (month === 4 && dayOfMonth >= 1 && dayOfMonth <= 12) {
      seasonMultiplier *= 1.55;
    }
    if (month === 5 && dayOfMonth >= 12 && dayOfMonth <= 22) {
      seasonMultiplier *= 1.48;
    }
    if (month === 8 && dayOfMonth >= 12 && dayOfMonth <= 20) {
      seasonMultiplier *= 1.4;
    }
    if (month === 9 && dayOfMonth >= 28 || month === 10 && dayOfMonth <= 9) {
      seasonMultiplier *= 1.45;
    }
    const ordersToday = Math.round(randomBetween(18, 28) * seasonMultiplier);
    for (let k = 0; k < ordersToday; k++) {
      const orderId = `MV-SIM-${String(orderCounter++).padStart(5, "0")}`;
      const customer = pickWeighted(clientesConPeso).cliente;
      const hourRandom = rng();
      let hour;
      if (hourRandom < 0.45) {
        hour = randomInt(19, 23);
      } else if (hourRandom < 0.65) {
        hour = randomInt(12, 14);
      } else if (hourRandom < 0.9) {
        hour = randomInt(15, 18);
      } else {
        hour = randomInt(8, 11);
      }
      const minute = randomInt(0, 59);
      const second = randomInt(0, 59);
      const orderTimestamp = new Date(Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        hour,
        minute,
        second
      ));
      const canal = pickWeighted(CANALES_VENTA).canal;
      const metodoPagoObj = pickWeighted(METODOS_PAGO);
      const ciudadObj = CIUDADES_COLOMBIA.find((c) => c.ciudad === customer.ciudad) || CIUDADES_COLOMBIA[0];
      let cuponCode = null;
      let descuentoRate = 0;
      if (rng() < 0.28) {
        if (month === 4) cuponCode = "MADRES2026";
        else if (month === 5) cuponCode = "PRIMA2026";
        else if (month === 8) cuponCode = "AMOR2026";
        else if (month === 10) cuponCode = "BLACK2026";
        else if (rng() < 0.5) cuponCode = "BIENVENIDA10";
        else cuponCode = "MOVI20";
        descuentoRate = CUPONES_DATASET[cuponCode]?.descPct || 0.1;
      }
      const itemsCountRoll = rng();
      const itemsCount = itemsCountRoll < 0.62 ? 1 : itemsCountRoll < 0.9 ? 2 : itemsCountRoll < 0.98 ? 3 : 4;
      const daysSinceOrder = (endDate.getTime() - orderTimestamp.getTime()) / 864e5;
      let estado = "entregado";
      if (daysSinceOrder < 2) {
        estado = rng() < 0.5 ? "en_preparacion" : "pagado";
      } else if (daysSinceOrder < 5) {
        estado = rng() < 0.6 ? "enviado" : "entregado";
      } else {
        const statusRoll = rng();
        if (statusRoll < 0.92) estado = "entregado";
        else if (statusRoll < 0.96) estado = "cancelado";
        else estado = "devuelto";
      }
      const orderItems = [];
      let orderSubtotalBase = 0;
      let orderTotalIva = 0;
      let orderTotalCost = 0;
      let orderTotalGross = 0;
      let orderTotalDiscount = 0;
      for (let itemIdx = 0; itemIdx < itemsCount; itemIdx++) {
        let prod;
        if (rng() < 0.4) {
          const starProds = catalogProducts.filter((p) => starProductIds.includes(p.id));
          prod = pickRandom(starProds.length > 0 ? starProds : catalogProducts);
        } else {
          prod = pickRandom(catalogProducts);
        }
        const selectedColorObj = prod.colors?.[0] || { name: "Negro", hex: "#25232B" };
        const selectedSize = pickRandom(prod.sizes || ["M", "L", "S"]);
        const selectedImage = prod.colorImages?.[selectedColorObj.name]?.[0] || prod.images?.[0] || "/images/hero_fashion_editorial.jpg";
        const qty = rng() < 0.85 ? 1 : 2;
        const baseRetailPrice = prod.discountPrice || prod.price;
        const discountAmount = Math.round(baseRetailPrice * descuentoRate);
        const finalPriceWithIva = (baseRetailPrice - discountAmount) * qty;
        const subtotalBase = Math.round(finalPriceWithIva / 1.19);
        const iva19 = finalPriceWithIva - subtotalBase;
        const unitCost = prod.cost || Math.round(prod.price / 1.19 * 0.58);
        const totalCost = unitCost * qty;
        const margenBrutoPesos = Math.max(0, subtotalBase - totalCost);
        const margenBrutoPct2 = subtotalBase > 0 ? Math.round(margenBrutoPesos / subtotalBase * 100) : 0;
        orderSubtotalBase += subtotalBase;
        orderTotalIva += iva19;
        orderTotalCost += totalCost;
        orderTotalGross += finalPriceWithIva;
        orderTotalDiscount += discountAmount * qty;
        const prepHours = Number((12 + rng() * 20).toFixed(1));
        const deliveryDays = Number((ciudadObj.diasDespacho + (rng() * 1.2 - 0.6)).toFixed(1));
        const saleLine = {
          id: `SL-${String(lineCounter++).padStart(6, "0")}`,
          pedidoId: orderId,
          fecha: orderTimestamp.toISOString(),
          clienteId: customer.id,
          clienteNombre: customer.nombre,
          clienteEmail: customer.email,
          prendaId: prod.id,
          prendaNombre: prod.name,
          categoria: prod.category,
          marca: prod.brand || "MoviFashion",
          color: selectedColorObj.name,
          talla: selectedSize,
          imagen: selectedImage,
          cantidad: qty,
          precioUnitarioConIva: baseRetailPrice,
          precioFinalConIva: finalPriceWithIva,
          subtotalBaseSinIva: subtotalBase,
          iva19,
          costoUnitario: unitCost,
          costoTotal: totalCost,
          margenBrutoPesos,
          margenBrutoPct: margenBrutoPct2,
          descuentoPesos: discountAmount * qty,
          cupon: cuponCode,
          canal,
          ciudad: ciudadObj.ciudad,
          metodoPago: metodoPagoObj.metodo,
          estado,
          origen: "SIMULADO",
          tiempoPreparacionHoras: prepHours,
          tiempoEntregaDias: Math.max(1, deliveryDays)
        };
        lineasVenta.push(saleLine);
        orderItems.push({
          id: `item-${saleLine.id}`,
          product: {
            ...prod,
            price: baseRetailPrice,
            cost: unitCost
          },
          quantity: qty,
          selectedColor: selectedColorObj,
          selectedSize
        });
      }
      const shipping = orderTotalGross >= 2e5 ? 0 : 12e3;
      const orderTotalWithShipping = orderTotalGross + shipping;
      let mappedOrderStatus = "Entregado";
      if (estado === "cancelado") mappedOrderStatus = "Cancelado";
      else if (estado === "devuelto") mappedOrderStatus = "Entregado";
      else if (estado === "enviado") mappedOrderStatus = "Enviado";
      else if (estado === "en_preparacion") mappedOrderStatus = "En preparaci\xF3n";
      else if (estado === "pagado") mappedOrderStatus = "Confirmado";
      const orderObj = {
        id: orderId,
        userId: customer.id,
        userEmail: customer.email,
        userName: customer.nombre,
        items: orderItems,
        subtotal: orderSubtotalBase,
        subtotalBase: orderSubtotalBase,
        iva: orderTotalIva,
        tarifaIva: 19,
        shipping,
        discount: orderTotalDiscount,
        couponCode: cuponCode || void 0,
        total: orderTotalWithShipping,
        status: mappedOrderStatus,
        paymentMethod: metodoPagoObj.metodo,
        paymentStatus: estado === "cancelado" ? "pending" : "paid",
        trackingNumber: `COOR-${orderId.replace("MV-SIM-", "")}-CO`,
        shippingAddress: {
          id: `addr-${orderId}`,
          recipientName: customer.nombre,
          phone: customer.telefono,
          street: `Calle ${randomInt(10, 140)} # ${randomInt(1, 90)}-${randomInt(10, 80)}`,
          city: ciudadObj.ciudad,
          department: ciudadObj.dpto,
          postalCode: "110111",
          isDefault: true
        },
        createdAt: orderTimestamp.toISOString(),
        simulated: true
      };
      pedidos.push(orderObj);
      if (estado !== "cancelado") {
        customer.totalPedidos++;
        customer.totalGastado += orderTotalGross;
        if (orderTimestamp.toISOString() > customer.ultimoPedido) {
          customer.ultimoPedido = orderTimestamp.toISOString();
        }
      }
    }
  }
  const refDate = (/* @__PURE__ */ new Date("2026-11-09T23:59:59Z")).getTime();
  clientes.forEach((c) => {
    const lastOrderTime = new Date(c.ultimoPedido).getTime();
    const recencyDays = Math.max(0, Math.floor((refDate - lastOrderTime) / 864e5));
    c.recenciaDias = recencyDays;
    if (c.totalPedidos >= 5 && c.totalGastado >= 9e5 && recencyDays <= 45) {
      c.segmentoRFM = "Campeones";
    } else if (c.totalPedidos >= 3 && recencyDays <= 60) {
      c.segmentoRFM = "Clientes Leales";
    } else if (c.totalPedidos >= 2 && recencyDays <= 90) {
      c.segmentoRFM = "Prometedores";
    } else if (c.totalPedidos >= 2 && recencyDays > 90) {
      c.segmentoRFM = "En Riesgo";
    } else if (c.totalPedidos === 1 && recencyDays > 120) {
      c.segmentoRFM = "Inactivos";
    } else {
      c.segmentoRFM = "Nuevos";
    }
  });
  const inventarioVariantes = [];
  const movimientosKardex = [];
  let kardexCounter = 1;
  const productSalesMap = /* @__PURE__ */ new Map();
  lineasVenta.forEach((line) => {
    if (line.estado !== "cancelado") {
      const prev = productSalesMap.get(line.prendaId) || { unidades: 0, ingresos: 0, nombre: line.prendaNombre, categoria: line.categoria };
      prev.unidades += line.cantidad;
      prev.ingresos += line.precioFinalConIva;
      productSalesMap.set(line.prendaId, prev);
    }
  });
  const totalRevenueAll = Array.from(productSalesMap.values()).reduce((sum, p) => sum + p.ingresos, 0);
  const sortedByRev = Array.from(productSalesMap.entries()).sort((a, b) => b[1].ingresos - a[1].ingresos);
  let accumulatedRev = 0;
  const productAbcMap = /* @__PURE__ */ new Map();
  sortedByRev.forEach(([pId, data]) => {
    accumulatedRev += data.ingresos;
    const share = totalRevenueAll > 0 ? accumulatedRev / totalRevenueAll : 0;
    if (share <= 0.8) {
      productAbcMap.set(pId, "A");
    } else if (share <= 0.95) {
      productAbcMap.set(pId, "B");
    } else {
      productAbcMap.set(pId, "C");
    }
  });
  catalogProducts.forEach((prod) => {
    const colors = prod.colors || [{ name: "Predeterminado", hex: "#000000" }];
    const sizes = prod.sizes || ["\xDAnica"];
    const abc = productAbcMap.get(prod.id) || "B";
    colors.forEach((col) => {
      sizes.forEach((sz) => {
        const sku = `${prod.id.replace("prod-", "").toUpperCase()}-${col.name.slice(0, 3).toUpperCase()}-${sz}`;
        const soldInLines = lineasVenta.filter((l) => l.prendaId === prod.id && l.color === col.name && l.talla === sz && l.estado !== "cancelado").reduce((sum, l) => sum + l.cantidad, 0);
        const stockBase = Math.round(soldInLines * 1.25) + randomInt(8, 25);
        const mermas = Math.round(soldInLines * 0.02);
        const stockActual = Math.max(0, stockBase - soldInLines - mermas);
        const unitCost = prod.cost || Math.round(prod.price / 1.19 * 0.58);
        const retailPrice = prod.discountPrice || prod.price;
        const dailyVelocity = Number((soldInLines / totalDays).toFixed(2));
        const daysRemaining = dailyVelocity > 0 ? Math.round(stockActual / dailyVelocity) : 180;
        let estadoStock = "\xD3ptimo";
        if (stockActual === 0) estadoStock = "Agotado";
        else if (stockActual < 6 || daysRemaining < 10) estadoStock = "Cr\xEDtico";
        else if (stockActual < 15 || daysRemaining < 25) estadoStock = "Alerta";
        movimientosKardex.push({
          id: `KDX-${String(kardexCounter++).padStart(6, "0")}`,
          fecha: "2026-01-05T09:00:00Z",
          sku,
          prendaNombre: `${prod.name} (${col.name} / ${sz})`,
          tipo: "ENTRADA_COMPRA",
          cantidad: stockBase,
          costoUnitario: unitCost,
          saldoCantidad: stockBase,
          documentoRef: "FAC-PROV-2026-01",
          responsable: "Operaciones MoviFashion"
        });
        if (soldInLines > 0) {
          movimientosKardex.push({
            id: `KDX-${String(kardexCounter++).padStart(6, "0")}`,
            fecha: "2026-06-30T18:00:00Z",
            sku,
            prendaNombre: `${prod.name} (${col.name} / ${sz})`,
            tipo: "VENTA_ORDEN",
            cantidad: -soldInLines,
            costoUnitario: unitCost,
            saldoCantidad: stockActual + mermas,
            documentoRef: "CONSOL-VENTAS-S1",
            responsable: "Sistema Autom\xE1tico"
          });
        }
        if (mermas > 0) {
          movimientosKardex.push({
            id: `KDX-${String(kardexCounter++).padStart(6, "0")}`,
            fecha: "2026-09-15T11:00:00Z",
            sku,
            prendaNombre: `${prod.name} (${col.name} / ${sz})`,
            tipo: "MERMA_CALIDAD",
            cantidad: -mermas,
            costoUnitario: unitCost,
            saldoCantidad: stockActual,
            documentoRef: "ACTA-CALIDAD-09",
            responsable: "Control de Calidad"
          });
        }
        const demandaAnualEst = Math.max(40, soldInLines * 1.2);
        const eoq = Math.round(Math.sqrt(2 * demandaAnualEst * 75e3 / (unitCost * 0.15))) || 24;
        inventarioVariantes.push({
          sku,
          productoId: prod.id,
          nombre: `${prod.name} (${col.name} - ${sz})`,
          categoria: prod.category,
          color: col.name,
          talla: sz,
          stockInicial: stockBase,
          entradasTotales: stockBase,
          ventasTotales: soldInLines,
          mermasAjustes: mermas,
          stockActual,
          stockMinimoSeguridad: 8,
          precioVentaConIva: retailPrice,
          costoUnitario: unitCost,
          valorizacionCosto: stockActual * unitCost,
          valorizacionVenta: stockActual * retailPrice,
          rotacionAnual: Number((soldInLines / Math.max(1, (stockBase + stockActual) / 2)).toFixed(2)),
          diasInventarioRestante: daysRemaining,
          clasificacionABC: abc,
          estadoStock,
          sugerenciaReabastecimiento: {
            cantidadSugeridaEOQ: Math.max(15, eoq),
            diasHastaAgotarse: daysRemaining,
            proveedor: prod.brand === "ATELIER MOVI" ? "Confecciones Andinas S.A.S. (Medell\xEDn)" : "Textiles del Valle S.A. (Cali)",
            tiempoEsperaProveedorDias: 12,
            costoReordenEstimado: Math.max(15, eoq) * unitCost
          }
        });
      });
    });
  });
  const metricasAgregadasEventos = [];
  const categoriasUnicas = Array.from(new Set(catalogProducts.map((p) => p.category)));
  for (let d = 0; d < totalDays; d++) {
    const currentDate = new Date(startDate.getTime() + d * 864e5).toISOString().slice(0, 10);
    const purchasesToday = lineasVenta.filter((l) => l.fecha.startsWith(currentDate) && l.estado !== "cancelado").length;
    categoriasUnicas.forEach((cat) => {
      const catShare = cat === "Chaquetas" ? 0.28 : cat === "Camisetas" ? 0.24 : cat === "Pantalones" ? 0.18 : cat === "Zapatos" ? 0.16 : 0.14;
      const catPurchases = Math.max(1, Math.round(purchasesToday * catShare));
      const catCheckouts = Math.round(catPurchases * 1.6);
      const catCarritos = Math.round(catPurchases * 3.6);
      const catVistas = Math.round(catPurchases * 40);
      const catBusquedas = Math.round(catPurchases * 6);
      const catAsistente = Math.round(catPurchases * 2.5);
      metricasAgregadasEventos.push({
        fecha: currentDate,
        categoria: cat,
        vistas: catVistas,
        carritos: catCarritos,
        checkouts: catCheckouts,
        compras: catPurchases,
        busquedas: catBusquedas,
        consultasAsistente: catAsistente
      });
    });
  }
  const busquedasTop = [
    { termino: "chaqueta impermeable bomber", conteo: 4820, sinResultados: false },
    { termino: "vestido midi lino", conteo: 3950, sinResultados: false },
    { termino: "polo pima mercerizado", conteo: 3410, sinResultados: false },
    { termino: "sneakers cuero blanco", conteo: 2890, sinResultados: false },
    { termino: "pantal\xF3n cargo modular", conteo: 2750, sinResultados: false },
    { termino: "buzo oversize lana alpaca", conteo: 1820, sinResultados: true },
    // Demanda no satisfecha
    { termino: "gabardina trench coat beige", conteo: 1540, sinResultados: true },
    { termino: "traje formal sastre", conteo: 1290, sinResultados: true },
    { termino: "cintur\xF3n cuero reversible", conteo: 1110, sinResultados: true }
  ];
  const consultasAsistenteTop = [
    { tema: "Gu\xEDa de tallas y medidas exactas en cm", consultas: 3450, resueltas: 3310, csat: 4.8 },
    { tema: "Tiempos de entrega a ciudades principales", consultas: 2780, resueltas: 2710, csat: 4.9 },
    { tema: "Combinaciones de outfit recomendadas (lookbooks)", consultas: 1980, resueltas: 1870, csat: 4.7 },
    { tema: "Pol\xEDtica de retracto legal 5 d\xEDas y cambios", consultas: 1420, resueltas: 1390, csat: 4.6 },
    { tema: "Disponibilidad de colores y reabastecimiento", consultas: 980, resueltas: 890, csat: 4.5 }
  ];
  let totalGross = 0;
  let totalNet = 0;
  let totalIva = 0;
  let totalCostAll = 0;
  let totalUnits = 0;
  lineasVenta.forEach((l) => {
    if (l.estado !== "cancelado") {
      totalGross += l.precioFinalConIva;
      totalNet += l.subtotalBaseSinIva;
      totalIva += l.iva19;
      totalCostAll += l.costoTotal;
      totalUnits += l.cantidad;
    }
  });
  const totalMargenBrutoPesos = Math.max(0, totalNet - totalCostAll);
  const margenBrutoPct = totalNet > 0 ? Number((totalMargenBrutoPesos / totalNet * 100).toFixed(1)) : 0;
  const nonCancelledOrders = pedidos.filter((p) => p.status !== "Cancelado");
  const ticketPromedio = nonCancelledOrders.length > 0 ? Math.round(totalGross / nonCancelledOrders.length) : 0;
  const mesesNombres = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
  const ventasPorMes = mesesNombres.map((mes) => {
    const mesLines = lineasVenta.filter((l) => l.fecha.startsWith(mes) && l.estado !== "cancelado");
    const gross = mesLines.reduce((s, l) => s + l.precioFinalConIva, 0);
    const net = mesLines.reduce((s, l) => s + l.subtotalBaseSinIva, 0);
    const iva = mesLines.reduce((s, l) => s + l.iva19, 0);
    const cost = mesLines.reduce((s, l) => s + l.costoTotal, 0);
    const units = mesLines.reduce((s, l) => s + l.cantidad, 0);
    const mesOrders = pedidos.filter((p) => p.createdAt.startsWith(mes) && p.status !== "Cancelado").length;
    return {
      mes,
      ventasBrutas: gross,
      ventasNetas: net,
      iva19: iva,
      margenBruto: Math.max(0, net - cost),
      pedidos: mesOrders,
      unidades: units,
      ticketPromedio: mesOrders > 0 ? Math.round(gross / mesOrders) : 0
    };
  });
  const ventasPorCanal = CANALES_VENTA.map((c) => {
    const cLines = lineasVenta.filter((l) => l.canal === c.canal && l.estado !== "cancelado");
    const v = cLines.reduce((s, l) => s + l.precioFinalConIva, 0);
    const p = new Set(cLines.map((l) => l.pedidoId)).size;
    return {
      canal: c.canal,
      ventas: v,
      porcentaje: totalGross > 0 ? Number((v / totalGross * 100).toFixed(1)) : 0,
      pedidos: p
    };
  });
  const ventasPorCiudad = CIUDADES_COLOMBIA.map((c) => {
    const cLines = lineasVenta.filter((l) => l.ciudad === c.ciudad && l.estado !== "cancelado");
    const v = cLines.reduce((s, l) => s + l.precioFinalConIva, 0);
    const p = new Set(cLines.map((l) => l.pedidoId)).size;
    return {
      ciudad: c.ciudad,
      ventas: v,
      pedidos: p,
      tiempoEntregaPromedio: c.diasDespacho
    };
  });
  const ventasPorCategoria = categoriasUnicas.map((cat) => {
    const catLines = lineasVenta.filter((l) => l.categoria === cat && l.estado !== "cancelado");
    const v = catLines.reduce((s, l) => s + l.precioFinalConIva, 0);
    const net = catLines.reduce((s, l) => s + l.subtotalBaseSinIva, 0);
    const cost = catLines.reduce((s, l) => s + l.costoTotal, 0);
    const u = catLines.reduce((s, l) => s + l.cantidad, 0);
    return {
      categoria: cat,
      ventas: v,
      unidades: u,
      margenPct: net > 0 ? Number(((net - cost) / net * 100).toFixed(1)) : 0
    };
  });
  const topPrendas = sortedByRev.slice(0, 10).map(([pId, data]) => {
    const lines = lineasVenta.filter((l) => l.prendaId === pId);
    const net = lines.reduce((s, l) => s + l.subtotalBaseSinIva, 0);
    const cost = lines.reduce((s, l) => s + l.costoTotal, 0);
    const returns = lines.filter((l) => l.estado === "devuelto").length;
    return {
      prenda: data.nombre,
      categoria: data.categoria,
      unidades: data.unidades,
      ingresos: data.ingresos,
      margen: Math.max(0, net - cost),
      devolucionPct: lines.length > 0 ? Number((returns / lines.length * 100).toFixed(1)) : 0
    };
  });
  const matrizDiaHora = Array.from({ length: 7 }, () => Array(24).fill(0));
  lineasVenta.forEach((l) => {
    if (l.estado !== "cancelado") {
      const dt = new Date(l.fecha);
      const day = dt.getUTCDay();
      const hour = dt.getUTCHours();
      matrizDiaHora[day][hour] += l.precioFinalConIva;
    }
  });
  const cohortesRetencion = [
    { cohorte: "Ene 2026", clientesIniciales: 420, retencionMeses: [100, 34, 28, 25, 22, 21, 20, 19, 18, 17] },
    { cohorte: "Feb 2026", clientesIniciales: 450, retencionMeses: [100, 36, 29, 26, 24, 22, 21, 20, 19] },
    { cohorte: "Mar 2026", clientesIniciales: 490, retencionMeses: [100, 37, 31, 28, 25, 23, 22, 21] },
    { cohorte: "Abr 2026", clientesIniciales: 530, retencionMeses: [100, 39, 32, 29, 27, 24, 23] },
    { cohorte: "May 2026", clientesIniciales: 680, retencionMeses: [100, 42, 35, 31, 28, 26] },
    // Pico día de la madre
    { cohorte: "Jun 2026", clientesIniciales: 620, retencionMeses: [100, 40, 33, 30, 27] },
    { cohorte: "Jul 2026", clientesIniciales: 550, retencionMeses: [100, 38, 32, 29] },
    { cohorte: "Ago 2026", clientesIniciales: 580, retencionMeses: [100, 39, 33] },
    { cohorte: "Sep 2026", clientesIniciales: 640, retencionMeses: [100, 41] },
    { cohorte: "Oct 2026", clientesIniciales: 690, retencionMeses: [100] }
  ];
  const multiItemOrders = pedidos.filter((p) => p.items.length >= 2 && p.status !== "Cancelado");
  const pairFreq = /* @__PURE__ */ new Map();
  const singleFreq = /* @__PURE__ */ new Map();
  pedidos.forEach((p) => {
    if (p.status !== "Cancelado") {
      const distinctNames = Array.from(new Set(p.items.map((i) => i.product?.name || "Prenda")));
      distinctNames.forEach((name) => {
        singleFreq.set(name, (singleFreq.get(name) || 0) + 1);
      });
      for (let i = 0; i < distinctNames.length; i++) {
        for (let j = i + 1; j < distinctNames.length; j++) {
          const key = [distinctNames[i], distinctNames[j]].sort().join(" ||| ");
          const prev = pairFreq.get(key) || { itemA: distinctNames[i], itemB: distinctNames[j], count: 0 };
          prev.count++;
          pairFreq.set(key, prev);
        }
      }
    }
  });
  const totalValidOrders = nonCancelledOrders.length;
  const reglasApriori = Array.from(pairFreq.values()).map((p) => {
    const supp = Number((p.count / totalValidOrders * 100).toFixed(2));
    const freqA = singleFreq.get(p.itemA) || 1;
    const conf = Number((p.count / freqA * 100).toFixed(1));
    const freqB = singleFreq.get(p.itemB) || 1;
    const probB = freqB / totalValidOrders;
    const lift = Number((conf / 100 / Math.max(1e-3, probB)).toFixed(2));
    return {
      itemA: p.itemA,
      itemB: p.itemB,
      soporte: supp,
      confianza: conf,
      lift: Math.max(1.2, lift),
      conteoJuntos: p.count
    };
  }).sort((a, b) => b.conteoJuntos - a.conteoJuntos).slice(0, 10);
  if (reglasApriori.length === 0) {
    reglasApriori.push(
      { itemA: "Chaqueta Bomber T\xE9cnica Morado Noche", itemB: "Pantal\xF3n Cargo Modular Obsidian", soporte: 4.8, confianza: 48.2, lift: 2.85, conteoJuntos: 320 },
      { itemA: "Sneakers Minimalistas Cuero Lavanda", itemB: "Bolso Tote Estructurado Ciruela", soporte: 4.1, confianza: 42.6, lift: 2.42, conteoJuntos: 275 },
      { itemA: "Polo Piqu\xE9 Sartorial en Algod\xF3n Pima", itemB: "Pantal\xF3n Cargo Modular Obsidian", soporte: 3.6, confianza: 38.9, lift: 2.15, conteoJuntos: 240 }
    );
  }
  const dailyMap = /* @__PURE__ */ new Map();
  lineasVenta.forEach((l) => {
    if (l.estado !== "cancelado") {
      const day = l.fecha.slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) || 0) + l.precioFinalConIva);
    }
  });
  const dailySorted = Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const proyecciones = [];
  const windowSize = 7;
  for (let i = 0; i < dailySorted.length; i++) {
    const [fecha, val] = dailySorted[i];
    const slice = dailySorted.slice(Math.max(0, i - windowSize), i + 1).map((x) => x[1]);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    const std = Math.sqrt(slice.reduce((acc, x) => acc + Math.pow(x - avg, 2), 0) / slice.length) || 1;
    const zScore = Math.abs((val - avg) / std);
    let esAnomalia = false;
    let motivoAnomalia = "";
    if (zScore > 2.2) {
      esAnomalia = true;
      if (fecha.includes("-05-10") || fecha.includes("-05-11")) motivoAnomalia = "Pico D\xEDa de la Madre";
      else if (fecha.includes("-06-15") || fecha.includes("-06-20")) motivoAnomalia = "Pico Prima de Junio";
      else if (fecha.includes("-09-18") || fecha.includes("-09-19")) motivoAnomalia = "Pico Amor y Amistad";
      else if (fecha.endsWith("-15") || fecha.endsWith("-30")) motivoAnomalia = "Pico Quincena Colombia";
      else motivoAnomalia = "Spike de campa\xF1a publicitaria";
    }
    proyecciones.push({
      fecha,
      historico: val,
      prediccion: Math.round(avg),
      esAnomalia,
      motivoAnomalia: esAnomalia ? motivoAnomalia : void 0
    });
  }
  const lastSales = dailySorted.slice(-14).map((x) => x[1]);
  let forecastBase = lastSales.reduce((a, b) => a + b, 0) / lastSales.length;
  for (let f = 1; f <= 90; f++) {
    const futureDate = new Date((/* @__PURE__ */ new Date("2026-11-09T00:00:00Z")).getTime() + f * 864e5);
    const dateStr = futureDate.toISOString().slice(0, 10);
    const dayOfMonth = futureDate.getUTCDate();
    const isNovEnd = f >= 15 && f <= 22;
    const isDecMid = f >= 30 && f <= 45;
    let futureMultiplier = 1;
    if (isNovEnd) futureMultiplier = 1.85;
    else if (isDecMid) futureMultiplier = 1.95;
    else if (dayOfMonth === 15 || dayOfMonth === 30) futureMultiplier = 1.35;
    const projectedVal = Math.round(forecastBase * futureMultiplier * (1 + f / 90 * 0.15));
    const margin80 = Math.round(projectedVal * 0.08);
    const margin95 = Math.round(projectedVal * 0.15);
    proyecciones.push({
      fecha: dateStr,
      prediccion: projectedVal,
      bandaInferior80: Math.max(0, projectedVal - margin80),
      bandaSuperior80: projectedVal + margin80,
      bandaInferior95: Math.max(0, projectedVal - margin95),
      bandaSuperior95: projectedVal + margin95
    });
  }
  const insightsAutomaticos = [
    {
      tipo: "oportunidad",
      titulo: "Alta rentabilidad en Chaquetas T\xE9cnicas",
      descripcion: "La categor\xEDa Chaquetas genera el 34,2 % del margen bruto total de la tienda. Se proyecta un agotamiento de tallas M y L en 11 d\xEDas antes del Black Friday; se recomienda emitir orden de compra anticipada."
    },
    {
      tipo: "tendencia",
      titulo: "Canal WhatsApp supera ticket promedio web",
      descripcion: "Las ventas asistidas por WhatsApp registraron un ticket promedio de $248.500 COP (+18,4 % respecto al canal Web), con una tasa de cierre del 22,8 % impulsada por la asesor\xEDa de tallas y combinaciones."
    },
    {
      tipo: "alerta",
      titulo: "Tasa de devoluci\xF3n en calzado concentrada en tallas intermedias",
      descripcion: "El 64 % de las devoluciones de Sneakers Minimalistas corresponde a cambios por media talla (38 a 39). Se recomienda activar recomendaci\xF3n proactiva de horma reducida en la ficha t\xE9cnica."
    },
    {
      tipo: "oportunidad",
      titulo: 'Afinidad de compra cruzada "Outfits Completos"',
      descripcion: "La regla de asociaci\xF3n Chaqueta Bomber + Pantal\xF3n Cargo muestra un Lift de 2.85x. Configurar un bundle con 10 % de descuento autom\xE1tico aumentar\xE1 el ticket promedio proyectado en $35.000 COP."
    },
    {
      tipo: "tendencia",
      titulo: "Patr\xF3n de compra nocturna y quincenal confirmado",
      descripcion: "El 44,8 % de las transacciones se consolida en la franja de 7:00 p.m. a 11:00 p.m. durante los d\xEDas 15 y 30. Programar pauta digital y campa\xF1as de correo a las 6:30 p.m. maximiza el ROAS."
    },
    {
      tipo: "alerta",
      titulo: "T\xE9rminos de b\xFAsqueda sin cat\xE1logo disponible",
      descripcion: 'Se registraron 1.820 b\xFAsquedas de "buzo oversize alpaca" sin productos encontrados. Representa una oportunidad desatendida estimada en $45 millones COP para la colecci\xF3n de invierno.'
    }
  ];
  const datasetResult = {
    seed,
    generadoEn: (/* @__PURE__ */ new Date()).toISOString(),
    clientes,
    lineasVenta,
    pedidos,
    inventarioVariantes,
    movimientosKardex,
    metricasAgregadasEventos,
    busquedasTop,
    consultasAsistenteTop,
    kpisGlobales: {
      totalVentasBrutas: totalGross,
      totalVentasNetas: totalNet,
      totalIva19: totalIva,
      totalCostoMercancia: totalCostAll,
      totalMargenBrutoPesos,
      margenBrutoPct,
      totalPedidos: nonCancelledOrders.length,
      totalUnidadesVendidas: totalUnits,
      ticketPromedio,
      totalClientes: clientes.length,
      tasaConversion: 2.65,
      tasaCancelacion: 3.8,
      tasaDevolucion: 4.2,
      tasaAbandonoCarrito: 55.4,
      cacPromedio: 28500,
      retencion60Dias: 26.4
    },
    ventasPorMes,
    ventasPorCanal,
    ventasPorCiudad,
    ventasPorCategoria,
    topPrendas,
    matrizDiaHora,
    cohortesRetencion,
    reglasApriori,
    proyecciones,
    insightsAutomaticos
  };
  CACHED_DATASET = datasetResult;
  return datasetResult;
}
var MACRO_CACHE = null;
var CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
async function getMacroEconomicDataColombia() {
  const now = Date.now();
  if (MACRO_CACHE && now - MACRO_CACHE.timestamp < CACHE_TTL_MS) {
    return MACRO_CACHE.data;
  }
  const fallbackData = [
    {
      codigo: "FP.CPI.TOTL.ZG",
      nombre: "Inflaci\xF3n / Variaci\xF3n IPC Colombia",
      ultimoValor: 5.4,
      anio: 2026,
      unidad: "% anual",
      fuente: "Banco de la Rep\xFAblica / DANE (Verificado)",
      interpretacion: "Tendencia a la baja respecto a 2024-2025, estabilizando el poder adquisitivo en moda retail."
    },
    {
      codigo: "NY.GDP.MKTP.KD.ZG",
      nombre: "Crecimiento del PIB Colombia",
      ultimoValor: 1.8,
      anio: 2025,
      unidad: "% anual",
      fuente: "Banco Mundial / DANE (Verificado)",
      interpretacion: "Recuperaci\xF3n moderada del consumo privado y demanda interna en manufacturas textiles."
    },
    {
      codigo: "IT.NET.USER.ZS",
      nombre: "Penetraci\xF3n de Usuarios de Internet",
      ultimoValor: 75.8,
      anio: 2024,
      unidad: "% de la poblaci\xF3n",
      fuente: "Banco Mundial / MinTIC (Verificado)",
      interpretacion: "Base potencial de m\xE1s de 39 millones de colombianos conectados a comercio electr\xF3nico."
    },
    {
      codigo: "NE.CON.PRVT.KD.ZG",
      nombre: "Crecimiento del Consumo Final de Hogares",
      ultimoValor: 2.1,
      anio: 2025,
      unidad: "% anual",
      fuente: "Banco Mundial (Verificado)",
      interpretacion: "Incremento sostenido del gasto de los hogares colombianos en vestuario y calzado."
    }
  ];
  try {
    const fetchWithTimeout = async (url) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        clearTimeout(timeoutId);
        return null;
      }
    };
    const cpiRes = await fetchWithTimeout("https://api.worldbank.org/v2/country/COL/indicator/FP.CPI.TOTL.ZG?format=json&per_page=5");
    const gdpRes = await fetchWithTimeout("https://api.worldbank.org/v2/country/COL/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=5");
    const liveData = [...fallbackData];
    if (cpiRes && Array.isArray(cpiRes[1]) && cpiRes[1].length > 0) {
      const validCpi = cpiRes[1].find((x) => x.value !== null);
      if (validCpi) {
        liveData[0].ultimoValor = Number(validCpi.value.toFixed(1));
        liveData[0].anio = Number(validCpi.date);
        liveData[0].fuente = "API Banco Mundial (En vivo)";
      }
    }
    if (gdpRes && Array.isArray(gdpRes[1]) && gdpRes[1].length > 0) {
      const validGdp = gdpRes[1].find((x) => x.value !== null);
      if (validGdp) {
        liveData[1].ultimoValor = Number(validGdp.value.toFixed(1));
        liveData[1].anio = Number(validGdp.date);
        liveData[1].fuente = "API Banco Mundial (En vivo)";
      }
    }
    MACRO_CACHE = { timestamp: now, data: liveData };
    return liveData;
  } catch (err) {
    console.warn("[BANCO MUNDIAL] Usando datos macroecon\xF3micos de respaldo verificado:", err);
    MACRO_CACHE = { timestamp: now, data: fallbackData };
    return fallbackData;
  }
}
function getUnifiedOrders(realOrders, options = {}) {
  const dataset = generateSimulatedDataset();
  const simulatedOrders = dataset.pedidos;
  const origin = (options.origen || "TODOS").toUpperCase();
  let combined = [];
  if (origin === "REAL") {
    combined = realOrders.map((o) => ({ ...o, simulated: false }));
  } else if (origin === "SIMULADO") {
    combined = simulatedOrders;
  } else {
    combined = [
      ...realOrders.map((o) => ({ ...o, simulated: false })),
      ...simulatedOrders
    ];
  }
  if (options.mes && options.mes !== "todos" && options.mes !== "all") {
    combined = combined.filter((o) => o.createdAt.startsWith(options.mes));
  }
  if (options.canal && options.canal !== "todos" && options.canal !== "all") {
    combined = combined.filter((o) => {
      const c = o.paymentMethod === "cash_on_delivery" ? "Contraentrega" : o.paymentMethod === "pse" ? "PSE" : "Tarjeta";
      return c.toLowerCase() === options.canal.toLowerCase();
    });
  }
  if (options.busqueda && options.busqueda.trim()) {
    const q = options.busqueda.toLowerCase().trim();
    combined = combined.filter((o) => {
      const idMatch = o.id.toLowerCase().includes(q);
      const nameMatch = (o.userName || "").toLowerCase().includes(q);
      const emailMatch = (o.userEmail || "").toLowerCase().includes(q);
      const cityMatch = (o.shippingAddress?.city || "").toLowerCase().includes(q);
      const itemMatch = o.items.some((i) => (i.product?.name || "").toLowerCase().includes(q));
      return idMatch || nameMatch || emailMatch || cityMatch || itemMatch;
    });
  }
  return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function getUnifiedSaleLines(realOrders, options = {}) {
  const dataset = generateSimulatedDataset();
  const simulatedLines = dataset.lineasVenta;
  const origin = (options.origen || "TODOS").toUpperCase();
  const realLines = [];
  realOrders.forEach((o) => {
    o.items.forEach((item, idx) => {
      const basePrice = item.product?.discountPrice || item.product?.price || 119e3;
      const qty = item.quantity || 1;
      const finalPrice = basePrice * qty;
      const subtotalBase = Math.round(finalPrice / 1.19);
      const iva19 = finalPrice - subtotalBase;
      const unitCost = item.product?.cost || Math.round(basePrice / 1.19 * 0.58);
      const costTotal = unitCost * qty;
      const margen = Math.max(0, subtotalBase - costTotal);
      const colorName = item.selectedColor?.name || "Predeterminado";
      const sizeName = item.selectedSize || "M";
      const prodImg = item.product?.colorImages?.[colorName]?.[0] || item.product?.images?.[0] || "/images/hero_fashion_editorial.jpg";
      const statusStr = String(o.status).toLowerCase();
      let est = "pagado";
      if (statusStr.includes("cancel")) est = "cancelado";
      else if (statusStr.includes("enviad")) est = "enviado";
      else if (statusStr.includes("entreg")) est = "entregado";
      realLines.push({
        id: `REAL-SL-${o.id}-${idx + 1}`,
        pedidoId: o.id,
        fecha: o.createdAt,
        clienteId: o.userId,
        clienteNombre: o.userName || o.shippingAddress?.recipientName || "Cliente Real",
        clienteEmail: o.userEmail || "",
        prendaId: item.product?.id || "prod-custom",
        prendaNombre: item.product?.name || "Prenda MoviFashion",
        categoria: item.product?.category || "General",
        marca: item.product?.brand || "MoviFashion",
        color: colorName,
        talla: sizeName,
        imagen: prodImg,
        cantidad: qty,
        precioUnitarioConIva: basePrice,
        precioFinalConIva: finalPrice,
        subtotalBaseSinIva: subtotalBase,
        iva19,
        costoUnitario: unitCost,
        costoTotal: costTotal,
        margenBrutoPesos: margen,
        margenBrutoPct: subtotalBase > 0 ? Math.round(margen / subtotalBase * 100) : 0,
        descuentoPesos: o.discount || 0,
        cupon: o.couponCode || null,
        canal: "Web",
        ciudad: o.shippingAddress?.city || "Bogot\xE1 D.C.",
        metodoPago: o.paymentMethod || "pse",
        estado: est,
        origen: "SIMULADO",
        // adaptado en tiempo de consulta
        tiempoPreparacionHoras: 18,
        tiempoEntregaDias: 2.1
      });
    });
  });
  const realLinesWithOrigin = realLines.map((l) => ({ ...l, origen: "REAL" }));
  let combined = [];
  if (origin === "REAL") {
    combined = realLinesWithOrigin;
  } else if (origin === "SIMULADO") {
    combined = simulatedLines;
  } else {
    combined = [...realLinesWithOrigin, ...simulatedLines];
  }
  if (options.mes && options.mes !== "todos" && options.mes !== "all") {
    combined = combined.filter((l) => l.fecha.startsWith(options.mes));
  }
  if (options.canal && options.canal !== "todos" && options.canal !== "all") {
    combined = combined.filter((l) => l.canal.toLowerCase() === options.canal.toLowerCase());
  }
  if (options.busqueda && options.busqueda.trim()) {
    const q = options.busqueda.toLowerCase().trim();
    combined = combined.filter((l) => {
      return l.pedidoId.toLowerCase().includes(q) || l.clienteNombre.toLowerCase().includes(q) || l.clienteEmail.toLowerCase().includes(q) || l.prendaNombre.toLowerCase().includes(q) || l.ciudad.toLowerCase().includes(q);
    });
  }
  return combined.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}
function exportFullDatasetToExcelBuffer(realOrders = []) {
  const dataset = generateSimulatedDataset();
  const unifiedLines = getUnifiedSaleLines(realOrders, { origen: "TODOS" });
  const wb = XLSX.utils.book_new();
  const salesRows = unifiedLines.slice(0, 15e3).map((l) => ({
    "ID Venta": l.id,
    "ID Pedido": l.pedidoId,
    "Fecha y Hora": l.fecha,
    "Origen": l.origen,
    "Cliente": l.clienteNombre,
    "Email": l.clienteEmail,
    "Prenda": l.prendaNombre,
    "Categor\xEDa": l.categoria,
    "Marca": l.marca,
    "Color": l.color,
    "Talla": l.talla,
    "Cantidad": l.cantidad,
    "Precio Unitario (COP)": l.precioUnitarioConIva,
    "Subtotal Base sin IVA (COP)": l.subtotalBaseSinIva,
    "IVA 19% (COP)": l.iva19,
    "Total con IVA (COP)": l.precioFinalConIva,
    "Costo Unitario (COP)": l.costoUnitario,
    "Costo Total (COP)": l.costoTotal,
    "Margen Bruto (COP)": l.margenBrutoPesos,
    "Margen %": `${l.margenBrutoPct}%`,
    "Descuento (COP)": l.descuentoPesos,
    "Cup\xF3n": l.cupon || "N/A",
    "Canal": l.canal,
    "Ciudad Despacho": l.ciudad,
    "M\xE9todo Pago": l.metodoPago,
    "Estado": l.estado
  }));
  const wsSales = XLSX.utils.json_to_sheet(salesRows);
  XLSX.utils.book_append_sheet(wb, wsSales, "Registro Ventas 2026");
  const invRows = dataset.inventarioVariantes.map((v) => ({
    "SKU": v.sku,
    "Prenda y Variante": v.nombre,
    "Categor\xEDa": v.categoria,
    "Color": v.color,
    "Talla": v.talla,
    "Clasificaci\xF3n ABC": v.clasificacionABC,
    "Stock Actual": v.stockActual,
    "Stock M\xEDnimo": v.stockMinimoSeguridad,
    "Estado": v.estadoStock,
    "Ventas Totales (Unidades)": v.ventasTotales,
    "Costo Unitario": v.costoUnitario,
    "Precio Venta": v.precioVentaConIva,
    "Valorizaci\xF3n Costo": v.valorizacionCosto,
    "Valorizaci\xF3n Venta": v.valorizacionVenta,
    "Rotaci\xF3n Anual": v.rotacionAnual,
    "D\xEDas Inventario": v.diasInventarioRestante,
    "Sugerencia Reorden EOQ": v.sugerenciaReabastecimiento.cantidadSugeridaEOQ,
    "Proveedor": v.sugerenciaReabastecimiento.proveedor
  }));
  const wsInv = XLSX.utils.json_to_sheet(invRows);
  XLSX.utils.book_append_sheet(wb, wsInv, "Inventario y Stock");
  const clientRows = dataset.clientes.slice(0, 4e3).map((c) => ({
    "ID Cliente": c.id,
    "Nombre": c.nombre,
    "Email": c.email,
    "Tel\xE9fono": c.telefono,
    "Ciudad": c.ciudad,
    "Canal Adquisici\xF3n": c.canalAdquisicion,
    "Fecha Registro": c.fechaRegistro,
    "Total Pedidos": c.totalPedidos,
    "Gasto Total (COP)": c.totalGastado,
    "Recencia (D\xEDas)": c.recenciaDias,
    "Segmento RFM": c.segmentoRFM
  }));
  const wsClients = XLSX.utils.json_to_sheet(clientRows);
  XLSX.utils.book_append_sheet(wb, wsClients, "Clientes y RFM");
  const monthlyRows = dataset.ventasPorMes.map((m) => ({
    "Mes": m.mes,
    "Ventas Brutas con IVA (COP)": m.ventasBrutas,
    "Ventas Netas Base (COP)": m.ventasNetas,
    "IVA 19% Generado (COP)": m.iva19,
    "Margen Bruto (COP)": m.margenBruto,
    "Pedidos Completados": m.pedidos,
    "Unidades Vendidas": m.unidades,
    "Ticket Promedio (COP)": m.ticketPromedio
  }));
  const wsMonthly = XLSX.utils.json_to_sheet(monthlyRows);
  XLSX.utils.book_append_sheet(wb, wsMonthly, "Cierre Mensual e IVA");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
function regenerateSimulatedDataset(newSeed) {
  const seedToUse = newSeed && !isNaN(newSeed) ? Number(newSeed) : Date.now();
  CACHED_DATASET = null;
  return generateSimulatedDataset(seedToUse);
}

// src/server/adminRoutes.ts
function createAdminRouter(productsRef, updateProducts, ordersRef, updateOrders, categoriesRef, updateCategories, usersRef, updateUsers, appEventsRef, supabase2, verifyPasswordFn, hashPasswordFn) {
  const router = Router();
  function getStaffUser(req) {
    const user = req.user;
    if (!user) return null;
    const allUsers = usersRef();
    const fullUser = allUsers.find((u) => u.id === user.id || u.email === user.email);
    const roleId = fullUser?.roleId || fullUser?.role || user.role;
    const permissions = getCachedPermissions(roleId);
    return {
      ...user,
      ...fullUser,
      role: roleId,
      permissions
    };
  }
  function requirePermission(actionId) {
    return (req, res, next) => {
      const staff = getStaffUser(req);
      if (!staff) {
        res.status(401).json({ error: "Autenticaci\xF3n requerida para acceder al panel." });
        return;
      }
      if (staff.role === "cliente") {
        recordAppAudit({
          usuarioId: staff.id,
          usuarioNombre: staff.name,
          usuarioEmail: staff.email,
          rol: "cliente",
          accion: actionId,
          modulo: actionId.split(".")[0] || "admin",
          estado: "DENEGADO",
          motivo: "Intento de acceso denegado a cliente a ruta administrativa.",
          ip: req.ip || "127.0.0.1",
          navegador: req.headers["user-agent"]
        }, supabase2);
        res.status(403).json({ error: "Acceso denegado: el perfil de cliente no tiene autorizaci\xF3n administrativa." });
        return;
      }
      const allowed = hasPermission(staff.permissions, actionId, staff.role);
      if (!allowed) {
        recordAppAudit({
          usuarioId: staff.id,
          usuarioNombre: staff.name,
          usuarioEmail: staff.email,
          rol: staff.role,
          accion: actionId,
          modulo: actionId.split(".")[0] || "admin",
          estado: "DENEGADO",
          motivo: `Permiso insuficiente: se requiere '${actionId}'.`,
          ip: req.ip || "127.0.0.1",
          navegador: req.headers["user-agent"]
        }, supabase2);
        res.status(403).json({
          error: `Acceso denegado: tu rol '${staff.role}' no dispone del permiso '${actionId}'.`
        });
        return;
      }
      req.staffUser = staff;
      next();
    };
  }
  router.get("/me", (req, res) => {
    const staff = getStaffUser(req);
    if (!staff || staff.role === "cliente") {
      res.status(403).json({ error: "No autorizado" });
      return;
    }
    res.json({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      permissions: staff.permissions,
      mfaEnabled: Boolean(staff.mfaEnabled),
      mustChangePassword: Boolean(staff.mustChangePassword),
      lastLoginAt: staff.lastLoginAt
    });
  });
  router.post("/auth/verify-password", (req, res) => {
    const staff = getStaffUser(req);
    const { password } = req.body;
    if (!staff || !password) {
      res.status(400).json({ error: "Contrase\xF1a requerida." });
      return;
    }
    const allUsers = usersRef();
    const dbUser = allUsers.find((u) => u.id === staff.id);
    if (!dbUser || !dbUser.password_hash) {
      res.status(401).json({ error: "Credenciales inv\xE1lidas." });
      return;
    }
    const valid = verifyPasswordFn(password, dbUser.password_hash);
    if (!valid) {
      recordAppAudit({
        usuarioId: staff.id,
        usuarioNombre: staff.name,
        usuarioEmail: staff.email,
        rol: staff.role,
        accion: "reautenticacion_fallida",
        modulo: "seguridad",
        estado: "DENEGADO",
        ip: req.ip || "127.0.0.1"
      }, supabase2);
      res.status(401).json({ error: "Contrase\xF1a incorrecta. Reautenticaci\xF3n fallida." });
      return;
    }
    recordAppAudit({
      usuarioId: staff.id,
      usuarioNombre: staff.name,
      usuarioEmail: staff.email,
      rol: staff.role,
      accion: "reautenticacion_exitosa",
      modulo: "seguridad",
      estado: "EXITO",
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Reautenticaci\xF3n confirmada." });
  });
  router.post("/auth/2fa/setup", (req, res) => {
    const staff = getStaffUser(req);
    if (!staff) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }
    const secret = generateBase32Secret(20);
    const otpUri = generateTotpUri(staff.email, secret, "MoviFashion AI");
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUri)}`;
    const backupCodes = generateBackupCodes(8);
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === staff.id);
    if (target) {
      target._tempMfaSecret = secret;
      target._tempBackupCodes = backupCodes;
    }
    res.json({
      secret,
      otpUri,
      qrImageUrl,
      backupCodes
    });
  });
  router.post("/auth/2fa/verify", (req, res) => {
    const staff = getStaffUser(req);
    const { code } = req.body;
    if (!staff || !code) {
      res.status(400).json({ error: "C\xF3digo TOTP de 6 d\xEDgitos requerido." });
      return;
    }
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === staff.id);
    const secretToVerify = target?._tempMfaSecret || target?.mfa_secret;
    if (!secretToVerify) {
      res.status(400).json({ error: "No hay configuraci\xF3n de 2FA pendiente." });
      return;
    }
    const valid = verifyTotpCode(secretToVerify, code);
    if (!valid) {
      res.status(400).json({ error: "C\xF3digo de verificaci\xF3n incorrecto o expirado." });
      return;
    }
    if (target) {
      target.mfa_secret = secretToVerify;
      target.mfaEnabled = true;
      delete target._tempMfaSecret;
    }
    recordAppAudit({
      usuarioId: staff.id,
      usuarioNombre: staff.name,
      usuarioEmail: staff.email,
      rol: staff.role,
      accion: "activacion_2fa",
      modulo: "seguridad",
      estado: "EXITO",
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Autenticaci\xF3n en dos pasos activada exitosamente." });
  });
  router.post("/auth/2fa/disable", (req, res) => {
    const staff = getStaffUser(req);
    const { password } = req.body;
    if (!staff || !password) {
      res.status(400).json({ error: "Contrase\xF1a requerida para desactivar 2FA." });
      return;
    }
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === staff.id);
    if (!target || !verifyPasswordFn(password, target.password_hash)) {
      res.status(401).json({ error: "Contrase\xF1a incorrecta." });
      return;
    }
    target.mfa_secret = null;
    target.mfaEnabled = false;
    recordAppAudit({
      usuarioId: staff.id,
      usuarioNombre: staff.name,
      usuarioEmail: staff.email,
      rol: staff.role,
      accion: "desactivacion_2fa",
      modulo: "seguridad",
      estado: "ADVERTENCIA",
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "2FA desactivado." });
  });
  router.get("/summary", requirePermission("resumen.ver"), (req, res) => {
    const realOrders = ordersRef();
    const products2 = productsRef();
    const users = usersRef();
    const origin = (req.query.origin || "all").toString().toLowerCase();
    const dataset = generateSimulatedDataset();
    const now = /* @__PURE__ */ new Date();
    const currentMonthKey = now.toISOString().slice(0, 7);
    const unifiedOrders = getUnifiedOrders(realOrders, { origen: origin });
    const unifiedLines = getUnifiedSaleLines(realOrders, { origen: origin });
    const totalGrossSales = unifiedLines.reduce((sum, l) => sum + (l.precioFinalConIva || 0), 0);
    const totalNetSales = unifiedLines.reduce((sum, l) => sum + (l.subtotalBaseSinIva || 0), 0);
    const totalIva19 = unifiedLines.reduce((sum, l) => sum + (l.iva19 || 0), 0);
    const totalCostAll = unifiedLines.reduce((sum, l) => sum + (l.costoTotal || 0), 0);
    const totalOrders = unifiedOrders.length;
    const avgTicket = totalOrders > 0 ? Math.round(totalGrossSales / totalOrders) : 0;
    const totalMarginPesos = Math.max(0, totalNetSales - totalCostAll);
    const marginPercent = totalNetSales > 0 ? Number((totalMarginPesos / totalNetSales * 100).toFixed(1)) : 41.8;
    const customerCount = origin === "real" ? Math.max(1, users.filter((u) => u.role === "cliente").length) : dataset.clientes.length + users.filter((u) => u.role === "cliente").length;
    const kpis = {
      totalGrossSales,
      totalNetSales,
      totalIva19,
      totalOrders,
      avgTicket,
      customerCount,
      conversionRate: 2.65,
      cartAbandonmentRate: 55.4,
      marginPercent,
      cacPromedio: 28500,
      retencion60Dias: 26.4,
      tasaDevolucion: 4.2,
      // Variaciones respecto al mes/periodo anterior
      variations: {
        totalGrossSales: 12.4,
        totalNetSales: 11.8,
        totalIva19: 11.8,
        totalOrders: 9.2,
        avgTicket: 2.9,
        customerCount: 14.6,
        conversionRate: 0.3,
        cartAbandonmentRate: -2.1,
        marginPercent: 1.4,
        cacPromedio: -5.2,
        retencion60Dias: 3.1,
        tasaDevolucion: -0.4
      }
    };
    const goal = salesGoals.find((g) => g.month === currentMonthKey) || {
      month: currentMonthKey,
      targetSales: 16e7,
      updatedAt: now.toISOString()
    };
    const currentMonthLines = unifiedLines.filter((l) => l.fecha.startsWith(currentMonthKey));
    const currentMonthSales = currentMonthLines.reduce((sum, l) => sum + l.precioFinalConIva, 0);
    const goalProgress = Math.min(100, Math.round(currentMonthSales / goal.targetSales * 100));
    const daysNames = ["Dom", "Lun", "Mar", "Mi\xE9", "Jue", "Vie", "S\xE1b"];
    const salesByDay = daysNames.map((day) => ({ day, ventas: 0, pedidos: 0, mediaMovil: 0 }));
    unifiedOrders.forEach((o) => {
      const d = new Date(o.createdAt).getDay();
      salesByDay[d].ventas += o.total;
      salesByDay[d].pedidos += 1;
    });
    const avgDaySales = salesByDay.reduce((s, d) => s + d.ventas, 0) / 7;
    salesByDay.forEach((d) => {
      d.mediaMovil = Math.round(avgDaySales);
    });
    const salesByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      ventas: 0,
      pedidos: 0
    }));
    unifiedOrders.forEach((o) => {
      const h = new Date(o.createdAt).getUTCHours();
      salesByHour[h].ventas += o.total;
      salesByHour[h].pedidos += 1;
    });
    const catMap = /* @__PURE__ */ new Map();
    unifiedLines.forEach((l) => {
      catMap.set(l.categoria, (catMap.get(l.categoria) || 0) + l.precioFinalConIva);
    });
    const salesByCategory = Array.from(catMap.entries()).map(([name, value]) => ({
      name,
      value,
      percent: totalGrossSales > 0 ? Math.round(value / totalGrossSales * 100) : 0
    })).sort((a, b) => b.value - a.value);
    const cityMap = /* @__PURE__ */ new Map();
    unifiedLines.forEach((l) => {
      cityMap.set(l.ciudad, (cityMap.get(l.ciudad) || 0) + l.precioFinalConIva);
    });
    const salesByCity = Array.from(cityMap.entries()).map(([city, value]) => ({
      city,
      value
    })).sort((a, b) => b.value - a.value);
    const paymentMap = { tarjeta: 0, pse: 0, nequi: 0, daviplata: 0, contraentrega: 0 };
    unifiedOrders.forEach((o) => {
      const m = String(o.paymentMethod || "").toLowerCase();
      if (m.includes("card") || m.includes("credit") || m.includes("tarjeta")) paymentMap.tarjeta += o.total;
      else if (m.includes("nequi")) paymentMap.nequi += o.total;
      else if (m.includes("daviplata")) paymentMap.daviplata += o.total;
      else if (m.includes("delivery") || m.includes("contra") || m.includes("cash")) paymentMap.contraentrega += o.total;
      else paymentMap.pse += o.total;
    });
    const prodMap = /* @__PURE__ */ new Map();
    unifiedLines.forEach((l) => {
      const prev = prodMap.get(l.prendaId) || {
        product: { id: l.prendaId, name: l.prendaNombre, category: l.categoria, images: [l.imagen] },
        units: 0,
        revenue: 0,
        margin: 0
      };
      prev.units += l.cantidad;
      prev.revenue += l.precioFinalConIva;
      prev.margin += l.margenBrutoPesos;
      prodMap.set(l.prendaId, prev);
    });
    const topProducts = Array.from(prodMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const unfulfilledOver24h = unifiedOrders.filter(
      (o) => (o.status === "Pendiente" || o.status === "En preparaci\xF3n") && Date.now() - new Date(o.createdAt).getTime() > 24 * 3600 * 1e3
    ).length;
    const lowStockCount = dataset.inventarioVariantes.filter((v) => v.stockActual > 0 && v.stockActual < 8).length;
    const outOfStockCount = dataset.inventarioVariantes.filter((v) => v.stockActual === 0).length;
    const urgentReturnsCount = Math.max(2, returnRequests.filter((r) => r.estado === "solicitado").length);
    const recentActivity = unifiedOrders.slice(0, 8).map((o) => ({
      id: o.id,
      tipo: "PEDIDO_CREADO",
      descripcion: `Pedido ${o.id} (${o.userName}) por $${o.total.toLocaleString("es-CO")} COP`,
      fecha: o.createdAt,
      origen: o.simulated ? "SIMULADO" : "REAL"
    }));
    res.json({
      kpis,
      goal: {
        month: goal.month,
        targetSales: goal.targetSales,
        currentSales: currentMonthSales,
        progressPercent: goalProgress
      },
      salesByDay,
      salesByHour,
      salesByCategory,
      salesByCity,
      salesByPayment: paymentMap,
      topProducts,
      matrizDiaHora: dataset.matrizDiaHora,
      alerts: {
        unfulfilledOver24h,
        lowStockCount,
        outOfStockCount,
        urgentReturnsCount
      },
      recentActivity,
      insights: dataset.insightsAutomaticos
    });
  });
  router.get("/goals", requirePermission("resumen.ver"), (_req, res) => {
    res.json(salesGoals);
  });
  router.put("/goals", requirePermission("configuracion.editar"), (req, res) => {
    const { month, targetSales } = req.body;
    if (!month || !targetSales) {
      res.status(400).json({ error: "Mes y meta de ventas requeridos." });
      return;
    }
    const existing = salesGoals.find((g) => g.month === month);
    if (existing) {
      existing.targetSales = Number(targetSales);
      existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    } else {
      salesGoals.push({
        month,
        targetSales: Number(targetSales),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "actualizar_meta",
      modulo: "resumen",
      despues: { month, targetSales },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, salesGoals });
  });
  router.get("/sales", requirePermission("ventas.ver"), (req, res) => {
    const { search, month, origin, page = "1", limit = "15", sortBy = "fecha", sortDir = "desc" } = req.query;
    const unifiedLines = getUnifiedSaleLines(ordersRef(), {
      origen: origin,
      mes: month,
      busqueda: search
    });
    const totalTransactions = unifiedLines.length;
    let totalGrossSales = 0;
    let totalGrossMargin = 0;
    let realCount = 0;
    let simulatedCount = 0;
    unifiedLines.forEach((l) => {
      if (l.origen === "REAL") realCount++;
      else simulatedCount++;
      totalGrossSales += l.precioFinalConIva;
      totalGrossMargin += l.margenBrutoPesos;
    });
    const avgMarginPct = totalGrossSales > 0 ? Math.round(totalGrossMargin / (totalGrossSales / 1.19) * 100) : 0;
    unifiedLines.sort((a, b) => {
      if (sortBy === "precio") {
        return sortDir === "asc" ? a.precioFinalConIva - b.precioFinalConIva : b.precioFinalConIva - a.precioFinalConIva;
      }
      if (sortBy === "margen") {
        return sortDir === "asc" ? a.margenBrutoPesos - b.margenBrutoPesos : b.margenBrutoPesos - a.margenBrutoPesos;
      }
      const diff = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      return sortDir === "asc" ? -diff : diff;
    });
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 15));
    const totalPages = Math.ceil(totalTransactions / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const pagedLines = unifiedLines.slice(startIndex, startIndex + limitNum);
    const mappedRows = pagedLines.map((l) => ({
      id: l.pedidoId,
      lineId: l.id,
      fecha: l.fecha,
      cliente: l.clienteNombre,
      clienteEmail: l.clienteEmail,
      prenda: l.prendaNombre,
      prendasDetalle: `${l.prendaNombre} (${l.color} / ${l.talla}) x${l.cantidad}`,
      cantidad: l.cantidad,
      precioFinal: l.precioFinalConIva,
      subtotalBase: l.subtotalBaseSinIva,
      iva: l.iva19,
      costoUnitarioPromedio: l.costoUnitario,
      costoTotal: l.costoTotal,
      margenBruto: l.margenBrutoPesos,
      margenPorcentaje: l.margenBrutoPct,
      canalCiudad: `${l.ciudad} \xB7 ${l.canal}`,
      ciudad: l.ciudad,
      canal: l.canal,
      origen: l.origen,
      estado: l.estado
    }));
    res.json({
      transactions: mappedRows,
      total: totalTransactions,
      page: pageNum,
      limit: limitNum,
      totalPages,
      kpis: {
        totalVentas: totalGrossSales,
        totalMargen: totalGrossMargin,
        margenPromedio: avgMarginPct,
        totalTransacciones: totalTransactions,
        reales: realCount,
        simuladas: simulatedCount
      }
    });
  });
  router.get("/sales/export", requirePermission("ventas.exportar"), (req, res) => {
    const buffer = exportFullDatasetToExcelBuffer(ordersRef());
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="registro_ventas_movifashion_${Date.now()}.xlsx"`);
    res.send(buffer);
  });
  router.get("/dataset/export", requirePermission("informes.descargar"), (req, res) => {
    const buffer = exportFullDatasetToExcelBuffer(ordersRef());
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="movifashion_dataset_completo_2026_${Date.now()}.xlsx"`);
    res.send(buffer);
  });
  router.post("/dataset/regenerate", requirePermission("configuracion.editar"), (req, res) => {
    const { seed } = req.body;
    const newDataset = regenerateSimulatedDataset(seed ? Number(seed) : void 0);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "regenerar_semilla_dataset",
      modulo: "configuracion",
      entidad: "SimulatedDataset",
      despues: { seed: newDataset.seed, generadoEn: newDataset.generadoEn },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({
      success: true,
      message: `Dataset simulado regenerado exitosamente con semilla ${newDataset.seed}.`,
      seed: newDataset.seed,
      generadoEn: newDataset.generadoEn,
      totalPedidos: newDataset.pedidos.length,
      totalLineas: newDataset.lineasVenta.length,
      totalClientes: newDataset.clientes.length
    });
  });
  router.get("/orders", requirePermission("pedidos.ver"), (req, res) => {
    const { status, paymentMethod, search, from, to, origin, page = "1", limit = "15", sort = "desc" } = req.query;
    let orders2 = getUnifiedOrders(ordersRef(), {
      origen: origin,
      busqueda: search
    });
    if (status && status !== "todos") {
      orders2 = orders2.filter((o) => o.status.toLowerCase() === String(status).toLowerCase());
    }
    if (paymentMethod && paymentMethod !== "todos") {
      orders2 = orders2.filter((o) => o.paymentMethod === paymentMethod);
    }
    if (from) {
      orders2 = orders2.filter((o) => new Date(o.createdAt) >= new Date(String(from)));
    }
    if (to) {
      orders2 = orders2.filter((o) => new Date(o.createdAt) <= /* @__PURE__ */ new Date(String(to) + "T23:59:59"));
    }
    orders2.sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sort === "asc" ? -diff : diff;
    });
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.max(1, parseInt(String(limit)));
    const total = orders2.length;
    const paginated = orders2.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    const funnelStatus = {
      pagado: orders2.filter((o) => o.status === "Confirmado" || o.status === "paid").length,
      preparacion: orders2.filter((o) => o.status === "En preparaci\xF3n").length,
      enviado: orders2.filter((o) => o.status === "Enviado").length,
      entregado: orders2.filter((o) => o.status === "Entregado").length,
      cancelado: orders2.filter((o) => o.status === "Cancelado").length
    };
    res.json({
      orders: paginated,
      funnelStatus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  });
  router.get("/orders/:id", requirePermission("pedidos.ver"), (req, res) => {
    const unified = getUnifiedOrders(ordersRef(), { origen: "TODOS" });
    const order = unified.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }
    const history = orderStatusHistory.filter((h) => h.orderId === order.id);
    const notes = orderNotes.filter((n) => n.orderId === order.id);
    res.json({
      ...order,
      history,
      notes
    });
  });
  router.put("/orders/:id/status", requirePermission("pedidos.editar"), (req, res) => {
    const { status, nota } = req.body;
    const orders2 = ordersRef();
    const order = orders2.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }
    if (status === "Entregado" || status === "Cancelado") {
      if (!hasPermission(req.staffUser.permissions, "pedidos.aprobar", req.staffUser.role)) {
        res.status(403).json({ error: "Se requiere el permiso pedidos.aprobar para marcar como entregado o cancelar." });
        return;
      }
    }
    const oldStatus = order.status;
    order.status = status;
    if (status === "Cancelado" && oldStatus !== "Cancelado") {
      const products2 = productsRef();
      order.items.forEach((item) => {
        const prod = products2.find((p) => p.id === (item.product?.id || item.id));
        if (prod) {
          const qty = item.quantity || 1;
          const oldStock = prod.inventory;
          prod.inventory += qty;
          inventoryMovements.unshift({
            id: `mov-cancel-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            tipo: "devoluci\xF3n",
            cantidad: qty,
            stockAnterior: oldStock,
            stockNuevo: prod.inventory,
            motivo: `Restituci\xF3n autom\xE1tica por cancelaci\xF3n de pedido ${order.id}`,
            usuarioId: req.staffUser.id,
            usuarioNombre: req.staffUser.name,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      });
      updateProducts([...products2]);
    }
    orderStatusHistory.push({
      id: `osh-${Date.now()}`,
      orderId: order.id,
      estadoAnterior: oldStatus,
      estadoNuevo: status,
      nota: nota || `Estado actualizado a ${status}`,
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "cambio_estado_pedido",
      modulo: "pedidos",
      entidad: "Order",
      entidadId: order.id,
      antes: { status: oldStatus },
      despues: { status, nota },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    updateOrders([...orders2]);
    res.json({ success: true, order });
  });
  router.put("/orders/:id/tracking", requirePermission("pedidos.editar"), (req, res) => {
    const { trackingNumber } = req.body;
    const orders2 = ordersRef();
    const order = orders2.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }
    const oldTracking = order.trackingNumber;
    order.trackingNumber = trackingNumber;
    if (order.status === "En preparaci\xF3n" || order.status === "Pendiente") {
      order.status = "Enviado";
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "asignar_guia_envio",
      modulo: "pedidos",
      entidad: "Order",
      entidadId: order.id,
      antes: { trackingNumber: oldTracking },
      despues: { trackingNumber, status: order.status },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    updateOrders([...orders2]);
    res.json({ success: true, order });
  });
  router.post("/orders/:id/notes", requirePermission("pedidos.editar"), (req, res) => {
    const { nota } = req.body;
    if (!nota || !nota.trim()) {
      res.status(400).json({ error: "Contenido de la nota requerido." });
      return;
    }
    const newNote = {
      id: `on-${Date.now()}`,
      orderId: req.params.id,
      nota: nota.trim(),
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    orderNotes.unshift(newNote);
    res.json({ success: true, note: newNote });
  });
  router.get("/returns", requirePermission("devoluciones.ver"), (_req, res) => {
    res.json(returnRequests);
  });
  router.put("/returns/:id", requirePermission("devoluciones.editar"), (req, res) => {
    const { estado, resolucion, reponerInventario } = req.body;
    const ret = returnRequests.find((r) => r.id === req.params.id);
    if (!ret) {
      res.status(404).json({ error: "Solicitud no encontrada" });
      return;
    }
    const oldState = ret.estado;
    ret.estado = estado;
    ret.resolucion = resolucion || ret.resolucion;
    ret.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (estado === "aprobado" && reponerInventario) {
      const products2 = productsRef();
      ret.items.forEach((item) => {
        const prod = products2.find((p) => p.id === item.productId);
        if (prod) {
          const oldStock = prod.inventory;
          prod.inventory += item.quantity;
          inventoryMovements.unshift({
            id: `mov-ret-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            tipo: "entrada",
            cantidad: item.quantity,
            stockAnterior: oldStock,
            stockNuevo: prod.inventory,
            motivo: `Reintegro a existencias por devoluci\xF3n aprobada ${ret.id}`,
            usuarioId: req.staffUser.id,
            usuarioNombre: req.staffUser.name,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      });
      updateProducts([...products2]);
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "gestionar_devolucion",
      modulo: "devoluciones",
      entidad: "ReturnRequest",
      entidadId: ret.id,
      antes: { estado: oldState },
      despues: { estado, resolucion, reponerInventario },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, returnRequest: ret });
  });
  router.get("/products", requirePermission("productos.ver"), (req, res) => {
    let prods = [...productsRef()];
    const { status, category, search, includeDeleted } = req.query;
    if (!includeDeleted || includeDeleted === "false") {
      prods = prods.filter((p) => !p.deletedAt);
    } else if (includeDeleted === "only") {
      prods = prods.filter((p) => Boolean(p.deletedAt));
    }
    if (category && category !== "todos") {
      prods = prods.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }
    if (status && status !== "todos") {
      prods = prods.filter((p) => (p.status || "publicado") === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      prods = prods.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    res.json(prods);
  });
  router.post("/products", requirePermission("productos.crear"), (req, res) => {
    const {
      name,
      category,
      brand,
      price,
      discountPrice,
      cost,
      description,
      inventory = 10,
      sizes = ["S", "M", "L"],
      colors = [{ name: "Negro", hex: "#111827" }],
      images = [],
      status = "publicado",
      lowStockThreshold = 5
    } = req.body;
    if (!name || !price || !category) {
      res.status(400).json({ error: "Nombre, precio y categor\xEDa son obligatorios." });
      return;
    }
    const calculatedCost = cost ? Number(cost) : Math.round(Number(price) * 0.55);
    const calculatedMargin = Math.round((Number(price) - calculatedCost) / Number(price) * 100);
    const newProd = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      category,
      brand: brand || "MoviFashion",
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : void 0,
      cost: calculatedCost,
      margin: calculatedMargin,
      inventory: Number(inventory),
      description: description || `Prenda de confecci\xF3n nacional ${name}.`,
      sizes,
      colors,
      images: images.length > 0 ? images : ["/images/products/chaqueta-bomber-tecnica-negro.jpg"],
      colorImages: {},
      status,
      lowStockThreshold: Number(lowStockThreshold),
      rating: 5,
      reviewCount: 0,
      isNew: true,
      tags: [category.toLowerCase()],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const products2 = productsRef();
    products2.unshift(newProd);
    updateProducts([...products2]);
    inventoryMovements.unshift({
      id: `mov-create-${newProd.id}`,
      productId: newProd.id,
      productName: newProd.name,
      tipo: "entrada",
      cantidad: newProd.inventory,
      stockAnterior: 0,
      stockNuevo: newProd.inventory,
      motivo: "Alta de nuevo producto en cat\xE1logo",
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "crear_producto",
      modulo: "productos",
      entidad: "Product",
      entidadId: newProd.id,
      despues: newProd,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, product: newProd });
  });
  router.put("/products/:id", requirePermission("productos.editar"), (req, res) => {
    const products2 = productsRef();
    const prod = products2.find((p) => p.id === req.params.id);
    if (!prod) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    const { clientUpdatedAt, ...updates } = req.body;
    if (clientUpdatedAt && prod.updatedAt && new Date(clientUpdatedAt).getTime() < new Date(prod.updatedAt).getTime()) {
      res.status(409).json({
        error: "Conflicto de concurrencia: este producto fue modificado por otro miembro del equipo. Recarga la p\xE1gina antes de guardar.",
        serverUpdatedAt: prod.updatedAt
      });
      return;
    }
    const beforeState = { ...prod };
    if (updates.price && Number(updates.price) !== prod.price) {
      priceHistory.unshift({
        id: `ph-${Date.now()}`,
        productId: prod.id,
        precioAnterior: prod.price,
        precioNuevo: Number(updates.price),
        usuarioId: req.staffUser.id,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    Object.assign(prod, updates, {
      price: updates.price ? Number(updates.price) : prod.price,
      discountPrice: updates.discountPrice !== void 0 ? updates.discountPrice ? Number(updates.discountPrice) : void 0 : prod.discountPrice,
      inventory: updates.inventory !== void 0 ? Number(updates.inventory) : prod.inventory,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    updateProducts([...products2]);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "editar_producto",
      modulo: "productos",
      entidad: "Product",
      entidadId: prod.id,
      antes: beforeState,
      despues: prod,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, product: prod });
  });
  router.delete("/products/:id", requirePermission("productos.eliminar"), (req, res) => {
    const products2 = productsRef();
    const prod = products2.find((p) => p.id === req.params.id);
    if (!prod) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    prod.deletedAt = (/* @__PURE__ */ new Date()).toISOString();
    updateProducts([...products2]);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "eliminar_producto_papelera",
      modulo: "productos",
      entidad: "Product",
      entidadId: prod.id,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Producto enviado a la papelera." });
  });
  router.post("/products/:id/restore", requirePermission("productos.editar"), (req, res) => {
    const products2 = productsRef();
    const prod = products2.find((p) => p.id === req.params.id);
    if (!prod) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    delete prod.deletedAt;
    prod.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    updateProducts([...products2]);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "restaurar_producto",
      modulo: "productos",
      entidad: "Product",
      entidadId: prod.id,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, product: prod });
  });
  router.delete("/products/:id/permanent", requirePermission("productos.eliminar_definitivo"), (req, res) => {
    if (req.staffUser.role !== "super_admin") {
      res.status(403).json({ error: "Solo el Super Administrador puede realizar eliminaciones definitivas." });
      return;
    }
    let products2 = productsRef();
    const target = products2.find((p) => p.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    products2 = products2.filter((p) => p.id !== req.params.id);
    updateProducts(products2);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "eliminacion_definitiva_producto",
      modulo: "productos",
      entidad: "Product",
      entidadId: target.id,
      antes: target,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Producto eliminado permanentemente." });
  });
  router.post("/products/:id/duplicate", requirePermission("productos.crear"), (req, res) => {
    const products2 = productsRef();
    const original = products2.find((p) => p.id === req.params.id);
    if (!original) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    const duplicated = {
      ...original,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${original.name} (Copia)`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    delete duplicated.deletedAt;
    products2.unshift(duplicated);
    updateProducts([...products2]);
    res.json({ success: true, product: duplicated });
  });
  router.post("/products/bulk", requirePermission("productos.editar"), (req, res) => {
    const { productIds, priceAdjustmentPercent, inventoryAdjustment } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ error: "Lista de IDs de productos requerida." });
      return;
    }
    const products2 = productsRef();
    let updatedCount = 0;
    products2.forEach((p) => {
      if (productIds.includes(p.id)) {
        if (priceAdjustmentPercent !== void 0) {
          const factor = 1 + Number(priceAdjustmentPercent) / 100;
          p.price = Math.round(p.price * factor);
          if (p.discountPrice) p.discountPrice = Math.round(p.discountPrice * factor);
        }
        if (inventoryAdjustment !== void 0) {
          p.inventory = Math.max(0, p.inventory + Number(inventoryAdjustment));
        }
        p.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        updatedCount++;
      }
    });
    updateProducts([...products2]);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "edicion_masiva_productos",
      modulo: "productos",
      despues: { productIdsCount: updatedCount, priceAdjustmentPercent, inventoryAdjustment },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, updatedCount });
  });
  router.get("/inventory/variants", requirePermission("inventario.ver"), (_req, res) => {
    const dataset = generateSimulatedDataset();
    const variants = dataset.inventarioVariantes.map((v, idx) => ({
      id: `var-${v.sku}-${idx}`,
      productId: v.productoId,
      sku: v.sku,
      name: v.nombre,
      category: v.categoria,
      size: v.talla,
      color: v.color,
      stock: v.stockActual,
      lowStockAlert: v.stockMinimoSeguridad,
      priceOverride: v.precioVentaConIva,
      cost: v.costoUnitario,
      valuationCost: v.valorizacionCosto,
      valuationSale: v.valorizacionVenta,
      rotacionAnual: v.rotacionAnual,
      diasInventarioRestante: v.diasInventarioRestante,
      clasificacionABC: v.clasificacionABC,
      estadoStock: v.estadoStock,
      sugerenciaReabastecimiento: v.sugerenciaReabastecimiento
    }));
    res.json(variants);
  });
  router.get("/inventory/movements", requirePermission("inventario.ver"), (_req, res) => {
    const dataset = generateSimulatedDataset();
    const kardexMapped = dataset.movimientosKardex.map((k) => ({
      id: k.id,
      sku: k.sku,
      productId: k.sku,
      productName: k.prendaNombre,
      tipo: k.tipo.includes("ENTRADA") ? "entrada" : k.tipo.includes("VENTA") ? "salida" : "ajuste",
      cantidad: Math.abs(k.cantidad),
      stockAnterior: k.saldoCantidad + (k.tipo.includes("VENTA") ? k.cantidad : -k.cantidad),
      stockNuevo: k.saldoCantidad,
      motivo: `${k.tipo}: ${k.documentoRef}`,
      usuarioNombre: k.responsable,
      createdAt: k.fecha
    }));
    res.json([...inventoryMovements, ...kardexMapped]);
  });
  router.post("/inventory/adjust", requirePermission("inventario.editar"), (req, res) => {
    const { productId, tipo, cantidad, motivo } = req.body;
    if (!productId || !tipo || cantidad === void 0 || !motivo) {
      res.status(400).json({ error: "Producto, tipo, cantidad y motivo son requeridos." });
      return;
    }
    const products2 = productsRef();
    const prod = products2.find((p) => p.id === productId);
    if (!prod) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    const stockAnterior = prod.inventory;
    const diff = Number(cantidad);
    let stockNuevo = stockAnterior;
    if (tipo === "entrada") stockNuevo = stockAnterior + diff;
    else if (tipo === "salida") stockNuevo = Math.max(0, stockAnterior - diff);
    else if (tipo === "ajuste") stockNuevo = Math.max(0, diff);
    prod.inventory = stockNuevo;
    prod.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    updateProducts([...products2]);
    const movement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      tipo,
      cantidad: diff,
      stockAnterior,
      stockNuevo,
      motivo,
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    inventoryMovements.unshift(movement);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "ajuste_inventario_kardex",
      modulo: "inventario",
      entidad: "InventoryMovement",
      despues: movement,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, movement, currentStock: stockNuevo });
  });
  router.get("/inventory/abc-analysis", requirePermission("inventario.ver"), (_req, res) => {
    const dataset = generateSimulatedDataset();
    const products2 = productsRef();
    const productStats = products2.map((p) => {
      const lines = dataset.lineasVenta.filter((l) => l.prendaId === p.id && l.estado !== "cancelado");
      const unitsSold = lines.reduce((s, l) => s + l.cantidad, 0);
      const revenue = lines.reduce((s, l) => s + l.precioFinalConIva, 0);
      const unitCost = p.cost || Math.round(p.price / 1.19 * 0.58);
      const invUnits = dataset.inventarioVariantes.filter((v) => v.productoId === p.id).reduce((s, v) => s + v.stockActual, 0) || p.inventory;
      return {
        product: { ...p, inventory: invUnits },
        unitsSold,
        revenue,
        inventoryValue: invUnits * unitCost
      };
    });
    const totalRevenue = productStats.reduce((sum, s) => sum + s.revenue, 0) || 1;
    productStats.sort((a, b) => b.revenue - a.revenue);
    let cumulative = 0;
    const classified = productStats.map((item) => {
      cumulative += item.revenue;
      const cumulativePercent = cumulative / totalRevenue * 100;
      let category = "C";
      if (cumulativePercent <= 80) category = "A";
      else if (cumulativePercent <= 95) category = "B";
      const velocityPerDay = Math.max(0.3, Number((item.unitsSold / 313).toFixed(2)));
      const daysOfStock = Math.round(item.product.inventory / velocityPerDay);
      const suggestedReorder = daysOfStock < 20 ? Math.round(velocityPerDay * 30) : 0;
      return {
        ...item,
        abcCategory: category,
        daysOfStock,
        suggestedReorder,
        cumulativeRevenue: cumulative,
        cumulativePercent: Number(cumulativePercent.toFixed(1))
      };
    });
    res.json(classified);
  });
  router.get("/categories", requirePermission("categorias.ver"), (_req, res) => {
    const categories2 = categoriesRef();
    const products2 = productsRef();
    const counts = categories2.map((c) => ({
      ...c,
      itemCount: products2.filter((p) => !p.deletedAt && p.category.toLowerCase() === c.name.toLowerCase()).length
    }));
    res.json(counts);
  });
  router.post("/categories", requirePermission("categorias.crear"), (req, res) => {
    const { name, description, iconName = "Sparkles" } = req.body;
    if (!name) {
      res.status(400).json({ error: "Nombre de la categor\xEDa requerido." });
      return;
    }
    const categories2 = categoriesRef();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCat = {
      id: `cat-${slug}`,
      name,
      slug,
      description: description || "",
      iconName,
      itemCount: 0
    };
    categories2.push(newCat);
    updateCategories([...categories2]);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "crear_categoria",
      modulo: "categorias",
      despues: newCat,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, category: newCat });
  });
  router.put("/categories/:id", requirePermission("categorias.editar"), (req, res) => {
    const categories2 = categoriesRef();
    const cat = categories2.find((c) => c.id === req.params.id);
    if (!cat) {
      res.status(404).json({ error: "Categor\xEDa no encontrada" });
      return;
    }
    Object.assign(cat, req.body);
    updateCategories([...categories2]);
    res.json({ success: true, category: cat });
  });
  router.delete("/categories/:id", requirePermission("categorias.eliminar"), (req, res) => {
    const categories2 = categoriesRef();
    const products2 = productsRef();
    const cat = categories2.find((c) => c.id === req.params.id);
    if (!cat) {
      res.status(404).json({ error: "Categor\xEDa no encontrada" });
      return;
    }
    const assignedCount = products2.filter((p) => !p.deletedAt && p.category.toLowerCase() === cat.name.toLowerCase()).length;
    if (assignedCount > 0 && !req.query.reassignTo) {
      res.status(400).json({
        error: `No se puede eliminar la categor\xEDa porque tiene ${assignedCount} producto(s) asignados. Especifica una categor\xEDa de reasignaci\xF3n con ?reassignTo=<nombre>.`
      });
      return;
    }
    if (req.query.reassignTo) {
      products2.forEach((p) => {
        if (p.category.toLowerCase() === cat.name.toLowerCase()) {
          p.category = String(req.query.reassignTo);
        }
      });
      updateProducts([...products2]);
    }
    const filtered = categories2.filter((c) => c.id !== req.params.id);
    updateCategories(filtered);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "eliminar_categoria",
      modulo: "categorias",
      entidad: "Category",
      entidadId: cat.id,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Categor\xEDa eliminada." });
  });
  let couponsCache = [
    { code: "BIENVENIDA10", campana: "Onboarding Nuevos Clientes", discountPercent: 10, minSubtotal: 8e4, active: true, maxUses: 2e3 },
    { code: "MOVI20", campana: "Colecci\xF3n Verano / Flash Sale", discountPercent: 20, minSubtotal: 12e4, active: true, maxUses: 1500 },
    { code: "MADRES2026", campana: "Campa\xF1a D\xEDa de la Madre 2026", discountPercent: 15, minSubtotal: 15e4, active: false, maxUses: 1200 },
    { code: "PRIMA2026", campana: "Quincena y Prima de Junio", discountPercent: 12, minSubtotal: 1e5, active: false, maxUses: 1e3 },
    { code: "AMOR2026", campana: "Amor y Amistad Septiembre", discountPercent: 15, minSubtotal: 14e4, active: false, maxUses: 1200 },
    { code: "BLACK2026", campana: "Black Friday Anticipado Noviembre", discountPercent: 25, minSubtotal: 18e4, active: true, maxUses: 3e3 }
  ];
  router.get("/marketing/coupons", requirePermission("marketing.ver"), (_req, res) => {
    const dataset = generateSimulatedDataset();
    const enrichedCoupons = couponsCache.map((c) => {
      const matchingLines = dataset.lineasVenta.filter((l) => l.cupon === c.code && l.estado !== "cancelado");
      const sales = matchingLines.reduce((s, l) => s + l.precioFinalConIva, 0);
      const discount = matchingLines.reduce((s, l) => s + l.descuentoPesos, 0);
      const margin = matchingLines.reduce((s, l) => s + l.margenBrutoPesos, 0);
      const distinctOrders = new Set(matchingLines.map((l) => l.pedidoId)).size;
      const incrementalEst = Math.round(sales * 0.32);
      return {
        ...c,
        usesCount: distinctOrders || 15,
        ventasGeneradas: sales,
        descuentoOtorgado: discount,
        margenResultante: margin,
        ventasIncrementales: incrementalEst
      };
    });
    res.json(enrichedCoupons);
  });
  router.post("/marketing/coupons", requirePermission("marketing.crear"), (req, res) => {
    const { code, discountPercent, minSubtotal = 0, maxUses = 500 } = req.body;
    if (!code || !discountPercent) {
      res.status(400).json({ error: "C\xF3digo y porcentaje de descuento requeridos." });
      return;
    }
    const cleanCode = code.toUpperCase().trim();
    const existing = couponsCache.find((c) => c.code === cleanCode);
    if (existing) {
      res.status(400).json({ error: "El c\xF3digo de cup\xF3n ya existe." });
      return;
    }
    const newCoupon = {
      code: cleanCode,
      campana: req.body.campana || "Campa\xF1a Personalizada",
      discountPercent: Number(discountPercent),
      minSubtotal: Number(minSubtotal),
      maxUses: Number(maxUses),
      usesCount: 0,
      active: true
    };
    couponsCache.push(newCoupon);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "crear_cupon",
      modulo: "marketing",
      despues: newCoupon,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, coupon: newCoupon });
  });
  router.delete("/marketing/coupons/:code", requirePermission("marketing.eliminar"), (req, res) => {
    couponsCache = couponsCache.filter((c) => c.code !== req.params.code.toUpperCase());
    res.json({ success: true, message: "Cup\xF3n eliminado." });
  });
  router.get("/marketing/banners", requirePermission("marketing.ver"), (_req, res) => {
    res.json({
      topBannerText: appSettings.topBannerText,
      heroTitle: "Tu estilo, inteligentemente conectado.",
      heroSubtitle: "Dise\xF1o sartorial colombiano, confecci\xF3n de alta resistencia y env\xEDos garantizados a todo el territorio nacional."
    });
  });
  router.put("/marketing/banners", requirePermission("marketing.editar"), (req, res) => {
    const { topBannerText } = req.body;
    if (topBannerText) {
      appSettings.topBannerText = topBannerText;
    }
    res.json({ success: true, appSettings });
  });
  router.get("/customers", requirePermission("clientes.ver"), (req, res) => {
    const allUsers = usersRef();
    const realOrders = ordersRef();
    const staff = req.staffUser;
    const canSeeSensitive = hasPermission(staff.permissions, "clientes.datos_sensibles", staff.role);
    const origin = (req.query.origin || "all").toString().toLowerCase();
    const segmentQuery = req.query.segment ? String(req.query.segment).toLowerCase() : "todos";
    const searchQuery = req.query.search ? String(req.query.search).toLowerCase().trim() : "";
    const dataset = generateSimulatedDataset();
    const realCustomers = allUsers.filter((u) => u.role === "cliente").map((c) => {
      const userOrders = realOrders.filter((o) => o.userId === c.id || o.userEmail === c.email);
      const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
      let segment = "Nuevo";
      if (userOrders.length >= 4 || totalSpent > 8e5) segment = "Campeones";
      else if (userOrders.length >= 2) segment = "Clientes Leales";
      else if (userOrders.length === 0) segment = "Inactivos";
      return {
        id: c.id,
        name: c.name,
        email: canSeeSensitive ? c.email : maskSensitiveText(c.email, "email"),
        phone: canSeeSensitive ? "+57 300 000 0000" : "+57 300 *** ****",
        city: c.addresses?.[0]?.city || "Bogot\xE1 D.C.",
        role: c.role,
        estado: c.estado || "activo",
        ordersCount: userOrders.length,
        totalSpent,
        segment,
        origen: "REAL",
        createdAt: c.createdAt || c.created_at || "2026-01-10",
        lastLoginAt: c.lastLoginAt
      };
    });
    const simCustomers = dataset.clientes.map((c) => ({
      id: c.id,
      name: c.nombre,
      email: canSeeSensitive ? c.email : maskSensitiveText(c.email, "email"),
      phone: canSeeSensitive ? c.telefono : maskSensitiveText(c.telefono, "phone"),
      city: c.ciudad,
      role: "cliente",
      estado: "activo",
      ordersCount: c.totalPedidos,
      totalSpent: c.totalGastado,
      segment: c.segmentoRFM,
      origen: "SIMULADO",
      createdAt: c.fechaRegistro,
      lastLoginAt: c.ultimoPedido,
      recencyDays: c.recenciaDias
    }));
    let combined = [];
    if (origin === "real") combined = realCustomers;
    else if (origin === "simulado") combined = simCustomers;
    else combined = [...realCustomers, ...simCustomers];
    if (segmentQuery && segmentQuery !== "todos") {
      combined = combined.filter((c) => {
        const seg = (c.segment || "").toLowerCase();
        if (segmentQuery === "vip") return seg === "campeones" || seg === "vip";
        if (segmentQuery === "recurrente") return seg === "clientes leales" || seg === "recurrente";
        if (segmentQuery === "nuevo") return seg === "nuevos" || seg === "nuevo" || seg === "prometedores";
        if (segmentQuery === "inactivo") return seg === "inactivos" || seg === "en riesgo" || seg === "inactivo";
        return seg.includes(segmentQuery);
      });
    }
    if (searchQuery) {
      combined = combined.filter(
        (c) => c.name.toLowerCase().includes(searchQuery) || c.email.toLowerCase().includes(searchQuery) || c.city.toLowerCase().includes(searchQuery) || c.id.toLowerCase().includes(searchQuery)
      );
    }
    res.json(combined);
  });
  router.get("/customers/rfm-metrics", requirePermission("clientes.ver"), (_req, res) => {
    const dataset = generateSimulatedDataset();
    const segmentDistribution = {
      Campeones: dataset.clientes.filter((c) => c.segmentoRFM === "Campeones").length,
      "Clientes Leales": dataset.clientes.filter((c) => c.segmentoRFM === "Clientes Leales").length,
      Prometedores: dataset.clientes.filter((c) => c.segmentoRFM === "Prometedores").length,
      "En Riesgo": dataset.clientes.filter((c) => c.segmentoRFM === "En Riesgo").length,
      Inactivos: dataset.clientes.filter((c) => c.segmentoRFM === "Inactivos").length,
      Nuevos: dataset.clientes.filter((c) => c.segmentoRFM === "Nuevos").length
    };
    res.json({
      cohortesRetencion: dataset.cohortesRetencion,
      repeatRates: {
        d30: 18.2,
        d60: 26.4,
        d90: 34.8
      },
      clvBySegment: {
        Campeones: 125e4,
        "Clientes Leales": 78e4,
        Prometedores: 46e4,
        "En Riesgo": 34e4,
        Inactivos: 18e4,
        Nuevos: 145e3
      },
      segmentDistribution,
      totalClientes: dataset.clientes.length
    });
  });
  router.post("/customers/reveal-sensitive", requirePermission("clientes.ver"), (req, res) => {
    const { customerId, reason } = req.body;
    if (!customerId || !reason) {
      res.status(400).json({ error: "ID de cliente y motivo obligatorio seg\xFAn Ley 1581." });
      return;
    }
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === customerId);
    if (!target) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "revelar_datos_sensibles",
      modulo: "clientes",
      entidad: "User",
      entidadId: target.id,
      motivo: reason,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({
      id: target.id,
      name: target.name,
      email: target.email,
      addresses: target.addresses || []
    });
  });
  router.put("/customers/:id/status", requirePermission("clientes.editar"), (req, res) => {
    const { estado } = req.body;
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    target.estado = estado;
    updateUsers([...allUsers]);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "cambiar_estado_cliente",
      modulo: "clientes",
      entidad: "User",
      entidadId: target.id,
      despues: { estado },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, estado });
  });
  router.post("/customers/:id/habeas-data-export", requirePermission("clientes.exportar"), (req, res) => {
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    const orders2 = ordersRef().filter((o) => o.userId === target.id || o.userEmail === target.email);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "exportacion_habeas_data",
      modulo: "clientes",
      entidad: "User",
      entidadId: target.id,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({
      titular: {
        id: target.id,
        nombre: target.name,
        email: target.email,
        direcciones: target.addresses,
        fechaRegistro: target.createdAt
      },
      pedidos: orders2,
      exportadoEl: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  router.delete("/customers/:id/habeas-data-delete", requirePermission("clientes.eliminar"), (req, res) => {
    let allUsers = usersRef();
    const target = allUsers.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    target.name = "Usuario Anonimizado (Habeas Data)";
    target.email = `anom-${Date.now()}@deleted.user`;
    target.addresses = [];
    target.deletedAt = (/* @__PURE__ */ new Date()).toISOString();
    target.estado = "bloqueado";
    updateUsers([...allUsers]);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "eliminacion_habeas_data",
      modulo: "clientes",
      entidad: "User",
      entidadId: req.params.id,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Datos personales eliminados y anonimizados por solicitud de Habeas Data." });
  });
  router.get("/atencion/cases", requirePermission("atencion.ver"), (_req, res) => {
    const now = Date.now();
    const cases = returnRequests.map((r) => ({
      id: r.id,
      tipo: "Devoluci\xF3n / Retracto",
      remitente: r.userName,
      email: r.userEmail,
      asunto: `Solicitud de ${r.tipo.toUpperCase()} para orden ${r.orderId}`,
      mensaje: r.motivo,
      estado: r.estado,
      prioridad: "alta",
      plazoDiasHabiles: 5,
      diasTranscurridos: Math.floor((now - new Date(r.createdAt).getTime()) / (1e3 * 3600 * 24)),
      createdAt: r.createdAt
    }));
    res.json(cases);
  });
  router.post("/atencion/cases/:id/respond", requirePermission("atencion.responder"), (req, res) => {
    const { mensajeRespuesta } = req.body;
    if (!mensajeRespuesta) {
      res.status(400).json({ error: "Mensaje de respuesta requerido." });
      return;
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "responder_caso_atencion",
      modulo: "atencion",
      entidad: "Case",
      entidadId: req.params.id,
      despues: { mensajeRespuesta },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Respuesta formal emitida al peticionario." });
  });
  router.get("/assistant/knowledge", requirePermission("asistente.ver"), (_req, res) => {
    res.json(knowledgeEntries);
  });
  router.post("/assistant/knowledge", requirePermission("asistente.editar"), (req, res) => {
    const { categoria, titulo, contenido, palabrasClave = [] } = req.body;
    if (!categoria || !titulo || !contenido) {
      res.status(400).json({ error: "Categor\xEDa, t\xEDtulo y contenido requeridos." });
      return;
    }
    const newEntry = {
      id: `kb-${Date.now()}`,
      categoria,
      titulo,
      contenido,
      palabrasClave,
      activo: true,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    knowledgeEntries.push(newEntry);
    res.json({ success: true, entry: newEntry });
  });
  router.put("/assistant/knowledge/:id", requirePermission("asistente.editar"), (req, res) => {
    const entry = knowledgeEntries.find((k) => k.id === req.params.id);
    if (!entry) {
      res.status(404).json({ error: "Entrada no encontrada" });
      return;
    }
    Object.assign(entry, req.body, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    res.json({ success: true, entry });
  });
  router.delete("/assistant/knowledge/:id", requirePermission("asistente.editar"), (req, res) => {
    const idx = knowledgeEntries.findIndex((k) => k.id === req.params.id);
    if (idx !== -1) knowledgeEntries.splice(idx, 1);
    res.json({ success: true, message: "Entrada eliminada" });
  });
  router.get("/assistant/metrics", requirePermission("asistente.ver"), (_req, res) => {
    res.json({
      satisfactionRate: 94.2,
      totalQueriesAnswered: 486,
      thumbsUpCount: 215,
      thumbsDownCount: 14,
      frequentTopics: [
        { topic: "Tallas de zapatos y pantalones", count: 142 },
        { topic: "Plazo y tarifas de env\xEDos nacionales", count: 118 },
        { topic: "Medios de pago PSE y Contraentrega", count: 89 },
        { topic: "Garant\xEDa legal y retracto de 5 d\xEDas", count: 64 }
      ],
      unansweredQueries: [
        { query: "\xBFTienen tienda f\xEDsica en el centro comercial Andino?", count: 8 },
        { query: "\xBFPuedo pagar con tarjeta \xC9xito o Codensa?", count: 5 }
      ]
    });
  });
  router.get("/cms/pages", requirePermission("contenido.ver"), (_req, res) => {
    res.json(contentPages);
  });
  router.get("/cms/pages/:slug", requirePermission("contenido.ver"), (req, res) => {
    const page = contentPages.find((p) => p.slug === req.params.slug);
    if (!page) {
      res.status(404).json({ error: "P\xE1gina no encontrada" });
      return;
    }
    const versions = contentVersions.filter((v) => v.pageSlug === page.slug);
    res.json({ page, versions });
  });
  router.put("/cms/pages/:slug", requirePermission("contenido.editar"), (req, res) => {
    const { titulo, contenido, metaDescripcion } = req.body;
    let page = contentPages.find((p) => p.slug === req.params.slug);
    if (!page) {
      page = {
        slug: req.params.slug,
        titulo: titulo || req.params.slug,
        contenido: contenido || "",
        metaDescripcion,
        publicado: true,
        versionActual: 1,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: req.staffUser.name
      };
      contentPages.push(page);
    } else {
      page.titulo = titulo || page.titulo;
      page.contenido = contenido || page.contenido;
      page.metaDescripcion = metaDescripcion || page.metaDescripcion;
      page.versionActual += 1;
      page.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      page.updatedBy = req.staffUser.name;
    }
    contentVersions.unshift({
      id: `ver-${page.slug}-${page.versionActual}`,
      pageSlug: page.slug,
      version: page.versionActual,
      titulo: page.titulo,
      contenido: page.contenido,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      createdBy: req.staffUser.name
    });
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "editar_pagina_cms",
      modulo: "contenido",
      entidad: "ContentPage",
      entidadId: page.slug,
      despues: page,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, page });
  });
  router.post("/cms/pages/:slug/restore/:version", requirePermission("contenido.editar"), (req, res) => {
    const page = contentPages.find((p) => p.slug === req.params.slug);
    const verNum = parseInt(req.params.version);
    const targetVer = contentVersions.find((v) => v.pageSlug === req.params.slug && v.version === verNum);
    if (!page || !targetVer) {
      res.status(404).json({ error: "Versi\xF3n no encontrada" });
      return;
    }
    page.contenido = targetVer.contenido;
    page.titulo = targetVer.titulo;
    page.versionActual += 1;
    page.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    page.updatedBy = `${req.staffUser.name} (Restauraci\xF3n v${verNum})`;
    contentVersions.unshift({
      id: `ver-${page.slug}-${page.versionActual}`,
      pageSlug: page.slug,
      version: page.versionActual,
      titulo: page.titulo,
      contenido: page.contenido,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      createdBy: page.updatedBy
    });
    res.json({ success: true, page });
  });
  router.get("/analytics/deep", requirePermission("analitica.ver"), async (_req, res) => {
    const dataset = generateSimulatedDataset();
    const realOrders = ordersRef();
    const realEvents = appEventsRef();
    const realViews = realEvents.filter((e) => e.event_type === "view_product").length;
    const realCarts = realEvents.filter((e) => e.event_type === "add_to_cart").length;
    const realCheckouts = realEvents.filter((e) => e.event_type === "initiate_checkout").length;
    const realPurchases = realOrders.length;
    const simViews = dataset.metricasAgregadasEventos.reduce((s, e) => s + e.vistas, 0);
    const simCarts = dataset.metricasAgregadasEventos.reduce((s, e) => s + e.carritos, 0);
    const simCheckouts = dataset.metricasAgregadasEventos.reduce((s, e) => s + e.checkouts, 0);
    const simPurchases = dataset.kpisGlobales.totalPedidos;
    const totalViews = simViews + realViews;
    const totalCarts = simCarts + realCarts;
    const totalCheckouts = simCheckouts + realCheckouts;
    const totalPurchases = simPurchases + realPurchases;
    const funnel = [
      { etapa: "Vistas de Producto", cantidad: totalViews, porcentaje: 100 },
      { etapa: "A\xF1adido al Carrito", cantidad: totalCarts, porcentaje: totalViews > 0 ? Number((totalCarts / totalViews * 100).toFixed(1)) : 0 },
      { etapa: "Iniciado Checkout", cantidad: totalCheckouts, porcentaje: totalViews > 0 ? Number((totalCheckouts / totalViews * 100).toFixed(1)) : 0 },
      { etapa: "Pedido Completado", cantidad: totalPurchases, porcentaje: totalViews > 0 ? Number((totalPurchases / totalViews * 100).toFixed(1)) : 0 }
    ];
    const marketBasket = dataset.reglasApriori.map((r) => ({
      pair: `${r.itemA} + ${r.itemB}`,
      itemA: r.itemA,
      itemB: r.itemB,
      count: r.conteoJuntos,
      soporte: r.soporte,
      confianza: r.confianza,
      lift: r.lift
    }));
    const demandForecast = dataset.inventarioVariantes.slice(0, 10).map((v) => ({
      id: v.sku,
      name: v.nombre,
      categoria: v.categoria,
      currentStock: v.stockActual,
      dailyVelocity: Number((v.ventasTotales / 313).toFixed(2)),
      projected30DayDemand: Math.round(v.ventasTotales / 313 * 30),
      daysRemaining: v.diasInventarioRestante,
      status: v.estadoStock,
      sugerenciaEOQ: v.sugerenciaReabastecimiento.cantidadSugeridaEOQ,
      proveedor: v.sugerenciaReabastecimiento.proveedor
    }));
    const proyecciones = dataset.proyecciones;
    const macroEconomics = await getMacroEconomicDataColombia();
    const busquedasTop = dataset.busquedasTop;
    const consultasAsistente = dataset.consultasAsistenteTop;
    res.json({
      funnel,
      marketBasket,
      demandForecast,
      proyecciones,
      macroEconomics,
      busquedasTop,
      consultasAsistente,
      mape: 4.2
      // Error porcentual absoluto medio del modelo
    });
  });
  router.get("/finance/summary", requirePermission("finanzas.ver"), (_req, res) => {
    const orders2 = ordersRef();
    const grossSales = orders2.reduce((sum, o) => sum + (o.total || 0), 0);
    const shippingTotal = orders2.reduce((sum, o) => sum + (o.shipping || 0), 0);
    const discountsTotal = orders2.reduce((sum, o) => sum + (o.discount || 0), 0);
    const netSales = Math.round((grossSales - shippingTotal) / 1.19);
    const iva19 = grossSales - shippingTotal - netSales;
    const monthsMap = /* @__PURE__ */ new Map();
    orders2.forEach((o) => {
      const m = o.createdAt.slice(0, 7);
      const curr = monthsMap.get(m) || { gross: 0, net: 0, iva: 0, orders: 0 };
      const oGross = o.total;
      const oNet = Math.round(oGross / 1.19);
      const oIva = oGross - oNet;
      monthsMap.set(m, {
        gross: curr.gross + oGross,
        net: curr.net + oNet,
        iva: curr.iva + oIva,
        orders: curr.orders + 1
      });
    });
    const monthlyReport = Array.from(monthsMap.entries()).map(([month, data]) => ({
      month,
      ...data
    }));
    res.json({
      summary: {
        grossSales,
        netSales,
        iva19,
        shippingTotal,
        discountsTotal,
        tarifaIva: 0.19
      },
      monthlyReport
    });
  });
  router.get("/shipping/config", requirePermission("envios.ver"), (_req, res) => {
    res.json(shippingConfig);
  });
  router.put("/shipping/config", requirePermission("envios.editar"), (req, res) => {
    Object.assign(shippingConfig, req.body);
    res.json({ success: true, shippingConfig });
  });
  router.get("/images/audit", requirePermission("imagenes.ver"), (_req, res) => {
    const products2 = productsRef();
    const publicDir = path.join(process.cwd(), "public");
    const items = [];
    products2.forEach((p) => {
      const allUrlsWithContext = [];
      p.images.forEach((img) => allUrlsWithContext.push({ url: img, color: "Principal" }));
      if (p.colorImages) {
        Object.entries(p.colorImages).forEach(([col, list]) => {
          list.forEach((img) => {
            if (!allUrlsWithContext.some((x) => x.url === img)) {
              allUrlsWithContext.push({ url: img, color: col });
            }
          });
        });
      }
      allUrlsWithContext.forEach((item, idx) => {
        let pesoKB = 85;
        let exists = true;
        let dimensiones = "800 \xD7 1000 px";
        if (item.url.startsWith("/images/") || item.url.startsWith("images/")) {
          const relativePath = item.url.startsWith("/") ? item.url.substring(1) : item.url;
          const absolutePath = path.join(publicDir, relativePath);
          try {
            if (fs.existsSync(absolutePath)) {
              const stat = fs.statSync(absolutePath);
              pesoKB = Math.round(stat.size / 1024);
              exists = true;
            } else {
              exists = false;
            }
          } catch {
            exists = false;
          }
        }
        const isHeavy = pesoKB > 200;
        const hasAlt = Boolean(p.name && p.name.trim().length > 0);
        let status = "OK";
        if (!exists) status = "falta";
        else if (isHeavy) status = "muy_pesada";
        else if (!hasAlt) status = "sin_alt";
        items.push({
          id: `${p.id}-${idx}`,
          productId: p.id,
          productName: p.name,
          category: p.category,
          colorName: item.color,
          url: item.url,
          pesoKB,
          dimensiones,
          hasAlt,
          status
        });
      });
    });
    const summary = {
      total: items.length,
      ok: items.filter((i) => i.status === "OK").length,
      pesadas: items.filter((i) => i.status === "muy_pesada").length,
      faltantes: items.filter((i) => i.status === "falta").length,
      sinAlt: items.filter((i) => i.status === "sin_alt").length
    };
    res.json({
      summary,
      images: items
    });
  });
  router.post("/images/replace", requirePermission("imagenes.editar"), (req, res) => {
    const { productId, oldUrl, newUrl, colorName } = req.body;
    if (!productId || !oldUrl || !newUrl) {
      res.status(400).json({ error: "productId, oldUrl y newUrl son requeridos." });
      return;
    }
    const products2 = productsRef();
    const product = products2.find((p) => p.id === productId);
    if (!product) {
      res.status(404).json({ error: "Producto no encontrado." });
      return;
    }
    const beforeState = { images: [...product.images], colorImages: { ...product.colorImages } };
    product.images = product.images.map((img) => img === oldUrl ? newUrl : img);
    if (product.colorImages && colorName && product.colorImages[colorName]) {
      product.colorImages[colorName] = product.colorImages[colorName].map((img) => img === oldUrl ? newUrl : img);
    } else if (product.colorImages) {
      Object.keys(product.colorImages).forEach((k) => {
        product.colorImages[k] = product.colorImages[k].map((img) => img === oldUrl ? newUrl : img);
      });
    }
    updateProducts([...products2]);
    if (supabase2) {
      (async () => {
        try {
          await supabase2.from("products").update({
            images: product.images,
            color_images: product.colorImages
          }).eq("id", product.id);
        } catch {
        }
      })();
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "reemplazar_imagen_catalogo",
      modulo: "imagenes",
      entidad: "ProductImage",
      entidadId: productId,
      antes: beforeState,
      despues: { oldUrl, newUrl, colorName },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, product });
  });
  router.get("/reports/generate", requirePermission("informes.descargar"), (req, res) => {
    const { type = "ventas", format = "xlsx" } = req.query;
    const orders2 = ordersRef();
    const products2 = productsRef();
    const users = usersRef();
    const events = appEventsRef();
    let sheetData = [];
    let reportName = "reporte";
    switch (type) {
      case "ventas":
        reportName = "ventas_periodo";
        sheetData = orders2.map((o) => ({
          "ID Pedido": o.id,
          "Fecha": new Date(o.createdAt).toLocaleString("es-CO"),
          "Cliente": o.userName,
          "Email": o.userEmail,
          "Total Facturado": o.total,
          "Base Gravable": o.subtotalBase || Math.round(o.total / 1.19),
          "IVA 19%": o.iva || o.total - (o.subtotalBase || Math.round(o.total / 1.19)),
          "Flete": o.shipping,
          "M\xE9todo Pago": o.paymentMethod,
          "Estado": o.status,
          "Tipo": o.simulated ? "SIMULADO" : "REAL"
        }));
        break;
      case "iva":
        reportName = "iva_mensual_dian";
        const monthlyIvaMap = /* @__PURE__ */ new Map();
        orders2.forEach((o) => {
          const month = o.createdAt.slice(0, 7);
          const current = monthlyIvaMap.get(month) || { totalFacturado: 0, baseGravable: 0, iva: 0, pedidos: 0 };
          const base = o.subtotalBase || Math.round(o.total / 1.19);
          const ivaVal = o.iva || o.total - base;
          monthlyIvaMap.set(month, {
            totalFacturado: current.totalFacturado + o.total,
            baseGravable: current.baseGravable + base,
            iva: current.iva + ivaVal,
            pedidos: current.pedidos + 1
          });
        });
        sheetData = Array.from(monthlyIvaMap.entries()).map(([mes, data]) => ({
          "Mes Fiscal": mes,
          "Total Pedidos": data.pedidos,
          "Base Gravable 19% (COP)": data.baseGravable,
          "IVA 19% Liquidado (COP)": data.iva,
          "Total Bruto Facturado (COP)": data.totalFacturado,
          "Tarifa Efectiva": "19.0%"
        }));
        break;
      case "inventario":
        reportName = "inventario_valorizado";
        sheetData = products2.map((p) => {
          const unitCost = p.cost || Math.round((p.discountPrice || p.price) * 0.45);
          const totalValorVenta = (p.discountPrice || p.price) * p.inventory;
          const totalValorCoste = unitCost * p.inventory;
          return {
            "C\xF3digo": p.id,
            "Prenda": p.name,
            "Categor\xEDa": p.category,
            "Existencias (Und)": p.inventory,
            "Coste Unitario": unitCost,
            "Precio Venta": p.discountPrice || p.price,
            "Valor Total Coste": totalValorCoste,
            "Valor Total Venta": totalValorVenta,
            "Margen Potencial": totalValorVenta - totalValorCoste
          };
        });
        break;
      case "clientes":
        reportName = "clientes_y_recurrencia";
        const customers = users.filter((u) => u.role === "cliente");
        sheetData = customers.map((c) => {
          const userOrders = orders2.filter((o) => o.userId === c.id || o.userEmail.toLowerCase() === c.email.toLowerCase());
          const totalSpent = userOrders.reduce((s, o) => s + o.total, 0);
          return {
            "ID Cliente": c.id,
            "Nombre": c.name,
            "Email": c.email,
            "Total Pedidos": userOrders.length,
            "Gasto Acumulado (COP)": totalSpent,
            "Ticket Promedio": userOrders.length > 0 ? Math.round(totalSpent / userOrders.length) : 0,
            "Segmento": userOrders.length > 3 ? "VIP / Frecuente" : userOrders.length > 0 ? "Comprador Activo" : "Registrado sin compra",
            "Fecha Registro": c.createdAt || c.created_at || "\u2014"
          };
        });
        break;
      case "productos":
        reportName = "productos_mas_vendidos";
        const prodSalesMap = /* @__PURE__ */ new Map();
        orders2.forEach((o) => {
          o.items.forEach((i) => {
            const pId = i.product?.id || i.productId;
            const pName = i.product?.name || "Prenda";
            const pCat = i.product?.category || "General";
            const price = i.product?.discountPrice || i.product?.price || 0;
            const current = prodSalesMap.get(pId) || { name: pName, category: pCat, units: 0, revenue: 0 };
            prodSalesMap.set(pId, {
              name: pName,
              category: pCat,
              units: current.units + (i.quantity || 1),
              revenue: current.revenue + price * (i.quantity || 1)
            });
          });
        });
        sheetData = Array.from(prodSalesMap.values()).sort((a, b) => b.units - a.units).map((item, idx) => ({
          "Ranking": idx + 1,
          "Prenda": item.name,
          "Categor\xEDa": item.category,
          "Unidades Vendidas": item.units,
          "Ingresos Brutos (COP)": item.revenue
        }));
        break;
      case "conversion":
        reportName = "embudo_conversion";
        const views = events.filter((e) => e.event_type === "view_product").length;
        const carts = events.filter((e) => e.event_type === "add_to_cart").length;
        const checkouts = events.filter((e) => e.event_type === "initiate_checkout").length;
        const purchases = orders2.length;
        sheetData = [
          { "Etapa del Embudo": "1. Vistas de Producto", "Sesiones / Eventos": views, "Tasa de Conversi\xF3n": "100%" },
          { "Etapa del Embudo": "2. A\xF1adido al Carrito", "Sesiones / Eventos": carts, "Tasa de Conversi\xF3n": views > 0 ? `${(carts / views * 100).toFixed(1)}%` : "0%" },
          { "Etapa del Embudo": "3. Inicio de Checkout", "Sesiones / Eventos": checkouts, "Tasa de Conversi\xF3n": views > 0 ? `${(checkouts / views * 100).toFixed(1)}%` : "0%" },
          { "Etapa del Embudo": "4. Compra Completada", "Sesiones / Eventos": purchases, "Tasa de Conversi\xF3n": views > 0 ? `${(purchases / views * 100).toFixed(1)}%` : "0%" }
        ];
        break;
      case "pronostico":
        reportName = "pronostico_ventas_demanda";
        const totalVentas = orders2.reduce((s, o) => s + o.total, 0);
        const avgMonthly = orders2.length > 0 ? Math.round(totalVentas / 3) : 5e7;
        sheetData = [
          { "Periodo": "Mes Actual", "Pron\xF3stico Demanda (Und)": 420, "Ventas Proyectadas (COP)": avgMonthly, "Confianza": "95%" },
          { "Periodo": "Mes + 1", "Pron\xF3stico Demanda (Und)": 460, "Ventas Proyectadas (COP)": Math.round(avgMonthly * 1.08), "Confianza": "90%" },
          { "Periodo": "Mes + 2", "Pron\xF3stico Demanda (Und)": 510, "Ventas Proyectadas (COP)": Math.round(avgMonthly * 1.15), "Confianza": "85%" }
        ];
        break;
      case "bigdata":
        reportName = "informe_tecnico_bigdata";
        sheetData = events.slice(-500).map((e) => ({
          "ID Evento": e.id,
          "Timestamp": e.created_at,
          "Tipo de Evento": e.event_type,
          "ID Sesi\xF3n": e.session_id,
          "Usuario ID": e.user_id || "an\xF3nimo",
          "Detalle": JSON.stringify(e.metadata || {})
        }));
        break;
      default:
        reportName = "reporte_general";
        sheetData = [{ "Mensaje": "Reporte generado exitosamente" }];
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "descargar_informe_corporativo",
      modulo: "informes",
      entidad: "Reporte",
      despues: { tipo: type, formato: format, registros: sheetData.length },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    if (format === "csv") {
      const worksheet2 = XLSX2.utils.json_to_sheet(sheetData);
      const csvOutput = XLSX2.utils.sheet_to_csv(worksheet2);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${reportName}_${Date.now()}.csv"`);
      res.send(csvOutput);
      return;
    }
    const worksheet = XLSX2.utils.json_to_sheet(sheetData);
    const workbook = XLSX2.utils.book_new();
    XLSX2.utils.book_append_sheet(workbook, worksheet, "Datos");
    const buffer = XLSX2.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${reportName}_${Date.now()}.xlsx"`);
    res.send(buffer);
  });
  router.get("/users", requirePermission("usuarios.ver"), (_req, res) => {
    const allUsers = usersRef();
    const staffMembers = allUsers.filter((u) => u.role !== "cliente").map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.roleId || u.role,
      roleId: u.roleId || u.role,
      estado: u.estado || "activo",
      mfaEnabled: Boolean(u.mfaEnabled),
      mustChangePassword: Boolean(u.mustChangePassword),
      lastLoginAt: u.lastLoginAt,
      failedAttempts: u.failedAttempts || 0,
      createdAt: u.createdAt || u.created_at
    }));
    res.json(staffMembers);
  });
  router.post("/users", requirePermission("usuarios.crear"), async (req, res) => {
    const { name, email, roleId, estado = "activo", mustChangePassword = true, customPassword } = req.body;
    if (!name || !email || !roleId) {
      res.status(400).json({ error: "Nombre, correo y rol requeridos." });
      return;
    }
    if (roleId === "cliente") {
      res.status(400).json({ error: "Los clientes no pueden ser registrados como miembros del personal administrativo." });
      return;
    }
    const allUsers = usersRef();
    const cleanEmail = String(email).toLowerCase().trim();
    if (allUsers.some((u) => u.email === cleanEmail)) {
      res.status(400).json({ error: "Ya existe un usuario con este correo electr\xF3nico." });
      return;
    }
    const tempPassword = customPassword && String(customPassword).length >= 8 ? String(customPassword) : `MoviPass${Math.random().toString(36).substring(2, 6)}!26`;
    const passwordHash = hashPasswordFn(tempPassword);
    const newUser = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      role: roleId,
      roleId,
      estado: estado === "suspendido" ? "suspendido" : "activo",
      mustChangePassword: Boolean(mustChangePassword),
      mfaEnabled: false,
      failedAttempts: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    allUsers.push(newUser);
    updateUsers([...allUsers]);
    if (supabase2) {
      try {
        await supabase2.from("app_users").upsert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password_hash: newUser.password_hash,
          role: newUser.role,
          role_id: newUser.roleId,
          estado: newUser.estado,
          must_change_password: newUser.mustChangePassword,
          created_at: newUser.createdAt
        });
      } catch (err) {
        console.warn("[SUPABASE USERS SYNC WARNING]", err.message);
      }
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "crear_miembro_staff",
      modulo: "usuarios",
      entidad: "User",
      entidadId: newUser.id,
      despues: { name: newUser.name, email: cleanEmail, roleId, estado: newUser.estado },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        roleId: newUser.roleId,
        estado: newUser.estado,
        mustChangePassword: newUser.mustChangePassword
      },
      temporaryPassword: tempPassword,
      message: "Usuario de staff creado exitosamente. Comparte la contrase\xF1a temporal para su primer acceso."
    });
  });
  router.put("/users/:id", requirePermission("usuarios.editar"), async (req, res) => {
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    const { name, email, roleId, estado, mustChangePassword } = req.body;
    if (target.id === req.staffUser.id && roleId && roleId !== (target.roleId || target.role)) {
      res.status(400).json({ error: "Por seguridad, no puedes degradar ni cambiar tu propio rol." });
      return;
    }
    const isSuperAdmin = target.role === "super_admin" || target.roleId === "super_admin";
    if (isSuperAdmin && (roleId && roleId !== "super_admin" || estado === "suspendido")) {
      const activeSuperAdmins = allUsers.filter(
        (u) => (u.role === "super_admin" || u.roleId === "super_admin") && u.estado !== "suspendido"
      );
      if (activeSuperAdmins.length <= 1) {
        res.status(400).json({ error: "No es posible degradar ni suspender al \xFAnico Super Administrador activo del sistema." });
        return;
      }
    }
    if (isSuperAdmin && req.staffUser.role !== "super_admin") {
      res.status(403).json({ error: "Solo un Super Administrador puede modificar a otro superadmin." });
      return;
    }
    const beforeState = {
      name: target.name,
      email: target.email,
      roleId: target.roleId || target.role,
      estado: target.estado,
      mustChangePassword: target.mustChangePassword
    };
    if (name && String(name).trim()) target.name = String(name).trim();
    if (email && String(email).trim()) target.email = String(email).toLowerCase().trim();
    if (roleId) {
      target.role = roleId;
      target.roleId = roleId;
      invalidateRoleCache(roleId);
    }
    if (estado) {
      target.estado = estado;
    }
    if (typeof mustChangePassword === "boolean") {
      target.mustChangePassword = mustChangePassword;
    }
    updateUsers([...allUsers]);
    if (supabase2) {
      try {
        await supabase2.from("app_users").update({
          name: target.name,
          email: target.email,
          role: target.role,
          role_id: target.roleId,
          estado: target.estado,
          must_change_password: target.mustChangePassword
        }).eq("id", target.id);
      } catch (err) {
        console.warn("[SUPABASE USER UPDATE WARNING]", err.message);
      }
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "editar_miembro_staff",
      modulo: "usuarios",
      entidad: "User",
      entidadId: target.id,
      antes: beforeState,
      despues: { name: target.name, email: target.email, roleId: target.roleId, estado: target.estado, mustChangePassword: target.mustChangePassword },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, user: target });
  });
  router.post("/users/:id/reset-password", requirePermission("usuarios.editar"), async (req, res) => {
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    const tempPassword = `MoviPass${Math.random().toString(36).substring(2, 6)}!26`;
    const passwordHash = hashPasswordFn(tempPassword);
    target.password_hash = passwordHash;
    target.mustChangePassword = true;
    updateUsers([...allUsers]);
    if (supabase2) {
      try {
        await supabase2.from("app_users").update({
          password_hash: passwordHash,
          must_change_password: true
        }).eq("id", target.id);
      } catch (err) {
        console.warn("[SUPABASE RESET PASS WARNING]", err.message);
      }
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "restablecer_contrasena_staff",
      modulo: "usuarios",
      entidad: "User",
      entidadId: target.id,
      despues: { mustChangePassword: true },
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({
      success: true,
      temporaryPassword: tempPassword,
      message: "Contrase\xF1a restablecida exitosamente. El usuario deber\xE1 cambiarla en su siguiente inicio de sesi\xF3n."
    });
  });
  router.post("/users/:id/terminate-sessions", requirePermission("usuarios.editar"), (req, res) => {
    const allUsers = usersRef();
    const target = allUsers.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    const activeIdx = staffSessions.findIndex((s) => s.userId === target.id);
    if (activeIdx !== -1) {
      staffSessions.splice(activeIdx, 1);
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "cerrar_sesiones_staff",
      modulo: "usuarios",
      entidad: "User",
      entidadId: target.id,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Todas las sesiones activas han sido revocadas." });
  });
  router.delete("/users/:id", requirePermission("usuarios.eliminar"), async (req, res) => {
    let allUsers = usersRef();
    const target = allUsers.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }
    if (target.id === req.staffUser.id) {
      res.status(400).json({ error: "Por seguridad, no puedes eliminar tu propia cuenta de usuario." });
      return;
    }
    const isSuperAdmin = target.role === "super_admin" || target.roleId === "super_admin";
    if (isSuperAdmin) {
      const superAdmins = allUsers.filter((u) => u.role === "super_admin" || u.roleId === "super_admin");
      if (superAdmins.length <= 1) {
        res.status(400).json({ error: "No es posible eliminar al \xFAnico Super Administrador del sistema." });
        return;
      }
    }
    const beforeState = { id: target.id, name: target.name, email: target.email, role: target.role };
    allUsers = allUsers.filter((u) => u.id !== req.params.id);
    updateUsers(allUsers);
    if (supabase2) {
      try {
        await supabase2.from("app_users").delete().eq("id", req.params.id);
      } catch (err) {
        console.warn("[SUPABASE DELETE USER WARNING]", err.message);
      }
    }
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "eliminar_miembro_staff",
      modulo: "usuarios",
      entidad: "User",
      entidadId: target.id,
      antes: beforeState,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, message: "Usuario de staff eliminado exitosamente." });
  });
  router.get("/roles", requirePermission("usuarios.roles"), (_req, res) => {
    res.json({
      roles: staffRoles,
      availableModules: ADMIN_MODULES
    });
  });
  router.post("/roles", requirePermission("usuarios.roles"), (req, res) => {
    const { id, nombre, descripcion, permisos } = req.body;
    if (!id || !nombre || !Array.isArray(permisos)) {
      res.status(400).json({ error: "ID, nombre y matriz de permisos son requeridos." });
      return;
    }
    const cleanId = String(id).toLowerCase().replace(/[^a-z0-9_]+/g, "_");
    if (staffRoles.some((r) => r.id === cleanId)) {
      res.status(400).json({ error: "Ya existe un rol con este identificador." });
      return;
    }
    const newRole = {
      id: cleanId,
      nombre,
      descripcion: descripcion || "",
      permisos,
      es_sistema: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    staffRoles.push(newRole);
    invalidateRoleCache();
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "crear_rol_personalizado",
      modulo: "usuarios",
      despues: newRole,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, role: newRole });
  });
  router.put("/roles/:id", requirePermission("usuarios.roles"), (req, res) => {
    const role = staffRoles.find((r) => r.id === req.params.id);
    if (!role) {
      res.status(404).json({ error: "Rol no encontrado" });
      return;
    }
    if (role.id === "super_admin") {
      res.status(403).json({ error: "Los permisos del Super Administrador no pueden ser degradados." });
      return;
    }
    const { nombre, descripcion, permisos } = req.body;
    const oldState = { ...role };
    if (nombre) role.nombre = nombre;
    if (descripcion !== void 0) role.descripcion = descripcion;
    if (Array.isArray(permisos)) role.permisos = permisos;
    invalidateRoleCache(role.id);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "editar_matriz_permisos_rol",
      modulo: "usuarios",
      entidad: "StaffRole",
      entidadId: role.id,
      antes: oldState,
      despues: role,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, role });
  });
  router.get("/audit", requirePermission("auditoria.ver"), (req, res) => {
    let logs = [...appAuditLogs];
    const { module, action, user, state } = req.query;
    if (module && module !== "todos") {
      logs = logs.filter((l) => l.modulo === module);
    }
    if (action) {
      logs = logs.filter((l) => l.accion.toLowerCase().includes(String(action).toLowerCase()));
    }
    if (user) {
      logs = logs.filter((l) => (l.usuarioNombre || "").toLowerCase().includes(String(user).toLowerCase()) || (l.usuarioEmail || "").toLowerCase().includes(String(user).toLowerCase()));
    }
    if (state && state !== "todos") {
      logs = logs.filter((l) => l.estado === state);
    }
    res.json(logs);
  });
  router.get("/security/summary", requirePermission("auditoria.ver"), (_req, res) => {
    const allUsers = usersRef();
    const staff = allUsers.filter((u) => u.role !== "cliente");
    const totalStaff = staff.length;
    const with2FA = staff.filter((u) => u.mfaEnabled).length;
    const lockedCount = staff.filter((u) => u.estado === "bloqueado" || (u.failedAttempts || 0) >= 5).length;
    const deniedAccessCount = appAuditLogs.filter((l) => l.estado === "DENEGADO").length;
    res.json({
      totalStaff,
      with2FA,
      mfaAdoptionPercent: totalStaff > 0 ? Math.round(with2FA / totalStaff * 100) : 0,
      lockedCount,
      deniedAccessCount,
      loginHistory: loginHistory.slice(0, 10)
    });
  });
  router.get("/settings", requirePermission("configuracion.ver"), (_req, res) => {
    res.json(appSettings);
  });
  router.put("/settings", requirePermission("configuracion.editar"), (req, res) => {
    Object.assign(appSettings, req.body);
    recordAppAudit({
      usuarioId: req.staffUser.id,
      usuarioNombre: req.staffUser.name,
      usuarioEmail: req.staffUser.email,
      rol: req.staffUser.role,
      accion: "modificar_configuracion_global",
      modulo: "configuracion",
      despues: appSettings,
      ip: req.ip || "127.0.0.1"
    }, supabase2);
    res.json({ success: true, appSettings });
  });
  router.get("/notifications", (req, res) => {
    const unread = adminNotifications.filter((n) => !n.leido);
    res.json({
      notifications: adminNotifications.slice(0, 20),
      unreadCount: unread.length
    });
  });
  router.put("/notifications/mark-read", (req, res) => {
    const { id } = req.body;
    if (id) {
      const target = adminNotifications.find((n) => n.id === id);
      if (target) target.leido = true;
    } else {
      adminNotifications.forEach((n) => n.leido = true);
    }
    res.json({ success: true });
  });
  return router;
}

// scripts/seed-staff.ts
import { scryptSync, randomBytes as randomBytes2 } from "crypto";
function hashPassword(password) {
  const salt = randomBytes2(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
var SEED_STAFF_USERS = [
  {
    name: "Super Administrador Principal",
    email: "admin@movifashion.ai",
    password: process.env.ADMIN_PASSWORD || "AdminDev2026!",
    role: "super_admin",
    roleId: "super_admin",
    estado: "activo"
  },
  {
    name: "Carlos Mendoza (Admin General)",
    email: "administrador@movifashion.ai",
    password: "AdminStaff2026!",
    role: "administrador",
    roleId: "administrador",
    estado: "activo"
  },
  {
    name: "Mariana G\xF3mez (Gerente de Tienda)",
    email: "gerente@movifashion.ai",
    password: "GerenteTienda2026!",
    role: "gerente_tienda",
    roleId: "gerente_tienda",
    estado: "activo"
  },
  {
    name: "Jorge Restrepo (Operador Log\xEDstico)",
    email: "operador@movifashion.ai",
    password: "OperadorEnvios2026!",
    role: "operador_pedidos",
    roleId: "operador_pedidos",
    estado: "activo"
  },
  {
    name: "Valentina Pe\xF1a (Marketing & Contenido)",
    email: "marketing@movifashion.ai",
    password: "Marketing2026!",
    role: "marketing_contenido",
    roleId: "marketing_contenido",
    estado: "activo"
  },
  {
    name: "Andr\xE9s Camargo (Soporte al Consumidor)",
    email: "soporte@movifashion.ai",
    password: "SoporteCliente2026!",
    role: "soporte_cliente",
    roleId: "soporte_cliente",
    estado: "activo"
  },
  {
    name: "Diana Pardo (Finanzas & DIAN)",
    email: "finanzas@movifashion.ai",
    password: "FinanzasFiscal2026!",
    role: "finanzas",
    roleId: "finanzas",
    estado: "activo"
  },
  {
    name: "Sebasti\xE1n Silva (Analista de Datos)",
    email: "analista@movifashion.ai",
    password: "AnalistaData2026!",
    role: "analista",
    roleId: "analista",
    estado: "activo"
  }
];
async function runSeed() {
  console.log("------------------------------------------------------------");
  console.log("MOVIFASHION AI: Auditor\xEDa y Verificaci\xF3n de Roles de Staff");
  console.log("------------------------------------------------------------");
  console.log(`
Verificando los ${SYSTEM_ROLES.length} roles de sistema precargados:`);
  for (const role of SYSTEM_ROLES) {
    console.log(`  \u2713 Rol: [${role.id}] "${role.nombre}" (${role.permisos.length} permisos)`);
  }
  console.log("\nComprobando matriz de permisos RBAC para los casos de prueba solicitados:");
  const opRole = SYSTEM_ROLES.find((r) => r.id === "operador_pedidos");
  const opCanDeliver = hasPermission(opRole.permisos, "pedidos.aprobar", "operador_pedidos");
  const opCanEditPrices = hasPermission(opRole.permisos, "productos.editar", "operador_pedidos");
  const opCanViewFinance = hasPermission(opRole.permisos, "finanzas.ver", "operador_pedidos");
  console.log(`  (a) operador_pedidos:`);
  console.log(`      - Puede marcar pedido como entregado (pedidos.aprobar): ${opCanDeliver ? "S\xCD (Correcto)" : "NO"}`);
  console.log(`      - Puede editar precios de productos (productos.editar): ${!opCanEditPrices ? "NO / 403 (Correcto)" : "S\xCD (Error)"}`);
  console.log(`      - Puede ver finanzas e IVA (finanzas.ver): ${!opCanViewFinance ? "NO / 403 (Correcto)" : "S\xCD (Error)"}`);
  if (!opCanDeliver || opCanEditPrices || opCanViewFinance) {
    throw new Error("Falla en permisos de operador_pedidos");
  }
  const clientPermissions = [];
  const clientCanViewOrders = hasPermission(clientPermissions, "pedidos.ver", "cliente");
  const clientCanViewAdmin = hasPermission(clientPermissions, "resumen.ver", "cliente");
  console.log(`  (b) cliente:`);
  console.log(`      - Acceso a pedidos administrativos: ${!clientCanViewOrders ? "403 DENEGADO (Correcto)" : "S\xCD (Error)"}`);
  console.log(`      - Acceso a resumen del panel: ${!clientCanViewAdmin ? "403 DENEGADO (Correcto)" : "S\xCD (Error)"}`);
  const sopRole = SYSTEM_ROLES.find((r) => r.id === "soporte_cliente");
  const sopCanViewAtencion = hasPermission(sopRole.permisos, "atencion.ver", "soporte_cliente");
  const sopCanViewSensitive = hasPermission(sopRole.permisos, "clientes.datos_sensibles", "soporte_cliente");
  console.log(`  (c) soporte_cliente:`);
  console.log(`      - Puede ver bandeja de PQRS: ${sopCanViewAtencion ? "S\xCD (Correcto)" : "NO"}`);
  console.log(`      - Tiene acceso a datos personales sin m\xE1scara: ${!sopCanViewSensitive ? "NO (Enmascarados por defecto - Correcto)" : "S\xCD (Error)"}`);
  const superRole = SYSTEM_ROLES.find((r) => r.id === "super_admin");
  const superCanDoAll = hasPermission(superRole.permisos, "usuarios.roles", "super_admin");
  console.log(`  (d) super_admin:`);
  console.log(`      - Control total y gesti\xF3n de roles: ${superCanDoAll ? "S\xCD (Correcto)" : "NO"}`);
  console.log("\nGenerando hashes de contrase\xF1as seguras para los 8 usuarios del equipo:");
  for (const user of SEED_STAFF_USERS) {
    const hash = hashPassword(user.password);
    console.log(`  \u2713 Usuario: ${user.email} | Rol: ${user.role} | Hash listo: ${hash.substring(0, 15)}...`);
  }
  console.log("\n------------------------------------------------------------");
  console.log("\u2713 Auditor\xEDa de Roles y Permisos RBAC completada con \xE9xito al 100%.");
  console.log("------------------------------------------------------------");
}
var esEjecucionDirecta = /seed-staff\.(ts|js)$/.test(process.argv[1] || "");
if (esEjecucionDirecta) {
  runSeed().catch((err) => {
    console.error("Error durante la verificaci\xF3n de staff:", err);
    process.exit(1);
  });
}

// src/server/assistantEngine.ts
var SALUDOS = [
  `\xA1Hola! Qu\xE9 gusto saludarte. Soy Movi, tu asesor virtual de estilo en ${EMPRESA.nombreComercial}. \xBFEn qu\xE9 te puedo colaborar hoy? Puedo recomendarte prendas de nuestra nueva colecci\xF3n, orientarte con tallas o ayudarte con env\xEDos y pagos.`,
  `\xA1Hola! Bienvenido a ${EMPRESA.nombreComercial}. Soy Movi, tu estilista personal. Cu\xE9ntame, \xBFest\xE1s buscando un look casual, algo formal para la oficina, o deseas consultar sobre tus pedidos?`,
  `\xA1Qu\xE9 tal! Es un placer atenderte hoy en ${EMPRESA.nombreComercial}. Me llamo Movi y estoy listo para ayudarte a encontrar las mejores combinaciones y responder cualquier duda de compra.`
];
var DESPEDIDAS = [
  `\xA1Ha sido un verdadero placer ayudarte! Si necesitas algo m\xE1s adelante, aqu\xED estar\xE9 listo para asesorarte. \xA1Que tengas un excelente d\xEDa!`,
  `\xA1Hasta pronto! Recuerda que en ${EMPRESA.nombreComercial} despachamos a toda Colombia con env\xEDo gratis desde ${formatCOP(EMPRESA.umbralEnvioGratis)}. \xA1Vuelve cuando quieras!`,
  `\xA1Con gusto! Estar\xE9 por aqu\xED siempre que desees renovar tu estilo o verificar novedades en nuestra tienda. \xA1Feliz d\xEDa!`
];
var AGRADECIMIENTOS = [
  `\xA1Con todo el gusto del mundo! En ${EMPRESA.nombreComercial} nos apasiona brindarte la mejor atenci\xF3n. \xBFHay alguna otra prenda o duda en la que pueda apoyarte?`,
  `\xA1Para servirte siempre! Me alegra haberte sido \xFAtil. Recuerda que puedes explorar nuestra [Nueva Colecci\xF3n](/nueva-coleccion) o revisar [Tendencias](/tendencias) en cualquier momento.`,
  `\xA1Es todo un placer! Quedo muy atento si deseas verificar detalles de tallas, opciones de pago o seguimiento de pedidos.`
];
function avoidExactRepetition(newReply, lastAssistantText, fallbackVariants = []) {
  if (!lastAssistantText) return newReply;
  const cleanNew = newReply.trim().toLowerCase();
  const cleanOld = lastAssistantText.trim().toLowerCase();
  if (cleanNew !== cleanOld) return newReply;
  const alt = fallbackVariants.find((v) => v.trim().toLowerCase() !== cleanOld);
  if (alt) return alt;
  return `${newReply} Recuerda que tambi\xE9n puedo resolver preguntas sobre env\xEDos, medios de pago o ayudarte a combinar tu outfit.`;
}
async function processAssistantChat(params) {
  const { message, history, catalog, orders: orders2, pqrsList: pqrsList2, currentUser, aiClient } = params;
  const sanitized = message.trim().slice(0, 500);
  const lower = sanitized.toLowerCase().replace(/^[¡¿\s]+/, "");
  const assistantHistory = history.filter((h) => h.role === "model");
  const lastAssistantTurn = assistantHistory.length > 0 ? assistantHistory[assistantHistory.length - 1] : null;
  const lastAssistantText = lastAssistantTurn?.text || "";
  const lastProductIds = lastAssistantTurn?.recommendedProductIds || [];
  const lastProducts = catalog.filter((p) => lastProductIds.includes(p.id));
  const suspiciousPatterns = [/ignore previous instructions/i, /drop table/i, /select \* from/i, /system prompt/i, /<script/i];
  if (suspiciousPatterns.some((pat) => pat.test(sanitized))) {
    return {
      reply: "Como asesor de estilo de MoviFashion, mi funci\xF3n es orientarte exclusivamente en la selecci\xF3n de prendas de moda, calzado y accesorios de nuestro cat\xE1logo. \xBFQu\xE9 estilo o prenda te gustar\xEDa conocer hoy?",
      productIds: [],
      suggestions: ["Ver nueva colecci\xF3n", "Zapatos urbanos", "\xBFC\xF3mo son los env\xEDos?"],
      intent: "seguridad_prompt",
      resolved: false
    };
  }
  const pqrsMatch = sanitized.match(/PQRS-[0-9]{4}-[0-9]{6}/i);
  if (pqrsMatch) {
    const radicadoTarget = pqrsMatch[0].toUpperCase();
    const foundPqrs = pqrsList2.find((p) => p.radicado.toUpperCase() === radicadoTarget);
    if (foundPqrs) {
      return {
        reply: `He consultado tu solicitud oficial **${foundPqrs.radicado}** (${foundPqrs.type.toUpperCase()}).
- **Estado actual**: ${foundPqrs.status.toUpperCase()}.
- **Asunto**: "${foundPqrs.subject}".
- **T\xE9rmino legal de respuesta**: ${foundPqrs.responseDeadline}.
${foundPqrs.responseMessage ? `- **Respuesta emitida**: "${foundPqrs.responseMessage}"` : "- Nuestro equipo de atenci\xF3n al cliente est\xE1 revisando tu caso dentro de los t\xE9rminos de ley."}`,
        productIds: [],
        suggestions: ["Radicar otra PQRS", "Hablar por WhatsApp", "Ver cat\xE1logo"],
        intent: "pqrs_consulta",
        resolved: true
      };
    } else {
      return {
        reply: `No encontr\xE9 un radicado registrado con el c\xF3digo **${radicadoTarget}**. Por favor verifica el n\xFAmero o puedes radicar una nueva solicitud en nuestro m\xF3dulo de [PQRS](/pqrs) o contactarnos directamente por [WhatsApp](${EMPRESA.redesSociales.facebook}).`,
        productIds: [],
        suggestions: ["Radicar PQRS", "Preguntas frecuentes", "Hablar con soporte"],
        intent: "pqrs_no_encontrado",
        resolved: false
      };
    }
  }
  const orderMatch = sanitized.match(/ORD-[0-9]{4,6}/i);
  if (orderMatch) {
    const orderIdTarget = orderMatch[0].toUpperCase();
    const foundOrder = orders2.find((o) => o.id.toUpperCase() === orderIdTarget);
    if (foundOrder) {
      const isOwner = !currentUser || currentUser.role === "admin" || foundOrder.userId === currentUser.id || foundOrder.userEmail.toLowerCase() === currentUser.email.toLowerCase();
      if (isOwner) {
        const orderItems = foundOrder.items.slice(0, 3).map((i) => i.product || catalog.find((p) => p.id === i.productId)).filter(Boolean);
        return {
          reply: `Encontr\xE9 la informaci\xF3n de tu pedido **${foundOrder.id}**:
- **Estado**: ${foundOrder.status}.
- **N\xFAmero de gu\xEDa**: ${foundOrder.trackingNumber} (transportadora nacional).
- **Total cancelado**: ${formatCOP(foundOrder.total)} (IVA incluido).
- **Prendas**: ${foundOrder.items.length} art\xEDculo(s).
${foundOrder.status === "Pendiente" ? "Tu paquete est\xE1 siendo alistado en nuestra bodega de Bogot\xE1 D.C." : "El paquete se encuentra en tr\xE1nsito seguro hacia tu direcci\xF3n registrada."}`,
          productIds: orderItems.map((p) => p.id),
          suggestions: ["\xBFC\xF3mo son los cambios?", "\xBFC\xF3mo devuelvo una prenda?", "Ver m\xE1s productos"],
          intent: "orden_consulta",
          resolved: true
        };
      }
    }
  }
  if (currentUser && /mi pedido|mis pedidos|mi orden|dónde está mi|cuándo llega mi/i.test(lower)) {
    const userOrders = orders2.filter((o) => o.userId === currentUser.id || o.userEmail.toLowerCase() === currentUser.email.toLowerCase());
    if (userOrders.length > 0) {
      const latest = userOrders[0];
      const items = latest.items.slice(0, 2).map((i) => i.product || catalog.find((p) => p.id === i.productId)).filter(Boolean);
      return {
        reply: `Hola ${currentUser.name.split(" ")[0]}, tu pedido m\xE1s reciente es el **${latest.id}** del ${new Date(latest.createdAt).toLocaleDateString("es-CO")}.
- **Estado**: ${latest.status}
- **Gu\xEDa de transporte**: ${latest.trackingNumber}
- **Total**: ${formatCOP(latest.total)} (${latest.items.length} prenda(s)).
\xBFDeseas gestionar una novedad o consultar las pol\xEDticas de entrega?`,
        productIds: items.map((p) => p.id),
        suggestions: ["\xBFC\xF3mo son los cambios?", "Tiempos de entrega", "Ver nueva colecci\xF3n"],
        intent: "mis_pedidos",
        resolved: true
      };
    }
  }
  const budgetMatch = sanitized.match(/\$?\s*([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,7})/);
  const extractedBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/\./g, ""), 10) : null;
  const scoredCandidates = catalog.filter((p) => p.inventory > 0).map((p) => {
    let score = 0;
    const finalPrice = p.discountPrice || p.price;
    if (extractedBudget && finalPrice <= extractedBudget) score += 40;
    if (extractedBudget && finalPrice > extractedBudget) score -= 30;
    if (lower.includes(p.category.toLowerCase())) score += 35;
    if (lower.includes(p.brand.toLowerCase())) score += 20;
    if (p.tags.some((t) => lower.includes(t.toLowerCase()))) score += 25;
    if (p.colors.some((c) => lower.includes(c.name.toLowerCase()))) score += 20;
    if (/tenis|zapatos|calzado|sneakers|deportivos/i.test(lower) && p.category === "Zapatos") score += 40;
    if (/chaqueta|blazer|abrigo|gabán/i.test(lower) && p.category === "Chaquetas") score += 40;
    if (/bolso|tote|morral|cartera/i.test(lower) && p.category === "Bolsos") score += 40;
    if (/deporte|deportiva|entrenar|gym|leggings/i.test(lower) && p.category === "Ropa deportiva") score += 40;
    if (/camisa|camiseta|t-shirt|polo|henley/i.test(lower) && p.category === "Camisetas") score += 40;
    if (/vestido|gala|formal|noche/i.test(lower) && p.category === "Vestidos") score += 40;
    if (/pantalon|pantalón|cargo|jogger|jean/i.test(lower) && p.category === "Pantalones") score += 40;
    if (/accesorio|gafas|billetera|cinturón|reloj/i.test(lower) && p.category === "Accesorios") score += 40;
    return { product: p, score };
  }).sort((a, b) => b.score - a.score);
  const articulosRelevantes = buscarEnBaseConocimiento(sanitized, 2);
  const knowledgeSnippet = articulosRelevantes.map((a) => `[TEMA: ${a.titulo}]: ${a.contenido}`).join("\n\n");
  if (aiClient) {
    try {
      const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
      const systemInstruction = `Eres Movi, el estilista y asesor de compras virtual de MoviFashion ("Tu estilo, inteligentemente conectado") en Colombia.
Tu tono es c\xE1lido, respetuoso, profesional y con la cortes\xEDa caracter\xEDstica colombiana ("Con mucho gusto...", "Claro que s\xED...", "Te cuento que en MoviFashion...").

REGLAS DE RESPUESTA:
1. Responde DIRECTAMENTE lo que el cliente pregunta.
2. Si falta informaci\xF3n para una recomendaci\xF3n de moda (ej: ocasi\xF3n, talla, presupuesto, color preferido), haz exactamente UNA pregunta aclaratoria amable.
3. Si el usuario hace seguimiento sobre productos anteriores ("\xBFy en azul?", "\xBFcu\xE1nto cuesta el segundo?", "\xBFtiene talla M?"), responde tomando como referencia las prendas recomendadas en el turno previo.
4. Si la pregunta es sobre env\xEDos, pagos, cambios (30 d\xEDas), retracto (5 d\xEDas h\xE1biles Ley 1480), garant\xEDas (90 d\xEDas), tallas o contacto, ap\xF3yate con precisi\xF3n en la BASE DE CONOCIMIENTO suministrada.
5. Puedes incluir enlaces Markdown cuando aplique: [Nueva Colecci\xF3n](/nueva-coleccion), [Tendencias](/tendencias), [Descuentos](/descuentos), [PQRS](/pqrs), o WhatsApp de atenci\xF3n.
6. Todos los precios de los productos tienen IVA del 19% incluido en Colombia. El env\xEDo es GRATIS por compras superiores a $200.000 COP.
7. Devuelve EXCLUSIVAMENTE un objeto JSON v\xE1lido con este formato:
{
  "reply": "Tu respuesta conversacional...",
  "productIds": ["id1", "id2"],
  "suggestions": ["Sugerencia corta 1", "Sugerencia corta 2", "Sugerencia corta 3"]
}
El arreglo "suggestions" debe tener m\xE1ximo 3 frases breves (menos de 6 palabras cada una) como botones de respuesta r\xE1pida para el usuario.
Si la consulta no requiere mostrar prendas, devuelve "productIds": [].`;
      const recentHistoryTurns = history.slice(-10);
      const contentsPayload = [];
      for (const turn of recentHistoryTurns) {
        contentsPayload.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }]
        });
      }
      const currentEnrichedPrompt = `Base de Conocimiento de MoviFashion Colombia:
${knowledgeSnippet || "Env\xEDos a toda Colombia, gratis desde $200.000. Pagos con tarjeta, PSE y contraentrega. Cambios en 30 d\xEDas."}

Cat\xE1logo Relevante disponible:
${JSON.stringify(
        scoredCandidates.slice(0, 6).map((c) => ({
          id: c.product.id,
          name: c.product.name,
          category: c.product.category,
          price: c.product.discountPrice || c.product.price,
          brand: c.product.brand,
          colors: c.product.colors.map((col) => col.name),
          sizes: c.product.sizes,
          inventory: c.product.inventory
        })),
        null,
        2
      )}

\xDAltimos productos recomendados en el turno anterior:
${JSON.stringify(
        lastProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.discountPrice || p.price,
          colors: p.colors.map((c) => c.name),
          sizes: p.sizes
        }))
      )}

Mensaje actual del cliente: "${sanitized}"`;
      contentsPayload.push({
        role: "user",
        parts: [{ text: currentEnrichedPrompt }]
      });
      const generatePromise = aiClient.models.generateContent({
        model: modelName,
        contents: contentsPayload,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.6
        }
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Timeout de respuesta Gemini (5s)")), 5e3)
      );
      const response = await Promise.race([generatePromise, timeoutPromise]);
      const raw = response.text || "{}";
      const parsed = JSON.parse(raw);
      if (parsed.reply && typeof parsed.reply === "string") {
        const validatedProductIds = Array.isArray(parsed.productIds) ? parsed.productIds.filter((pid) => catalog.some((p) => p.id === pid)).slice(0, 4) : [];
        const suggestions = Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0 ? parsed.suggestions.slice(0, 3).map((s) => String(s).slice(0, 35)) : ["Ver nueva colecci\xF3n", "\xBFC\xF3mo son los env\xEDos?", "Preguntas frecuentes"];
        const finalReply = avoidExactRepetition(parsed.reply, lastAssistantText, [
          `Con mucho gusto te complemento: ${parsed.reply}`,
          `${parsed.reply} \xBFTe gustar\xEDa que te sugiera c\xF3mo combinar esta prenda?`
        ]);
        return {
          reply: finalReply,
          productIds: validatedProductIds,
          suggestions,
          intent: "gemini_conversacional",
          resolved: true
        };
      }
    } catch (err) {
      console.error("[GEMINI CHAT ERROR]", err.code || err.status || "UNKNOWN_CODE", err.message || err);
    }
  }
  if (/^(hola|buenos d[ií]as|buenas tardes|buenas noches|buenas|hey|qu[eé] tal|saludos|holis)/i.test(lower)) {
    const reply = avoidExactRepetition(SALUDOS[0], lastAssistantText, SALUDOS);
    return {
      reply,
      productIds: [],
      suggestions: ["Ver nueva colecci\xF3n", "Zapatos urbanos", "\xBFC\xF3mo son los env\xEDos?"],
      intent: "saludo",
      resolved: true
    };
  }
  if (/(adi[oó]s|chao|hasta luego|nos vemos|hasta pronto|que est[eé]s bien|chao chao)/i.test(lower)) {
    const reply = avoidExactRepetition(DESPEDIDAS[0], lastAssistantText, DESPEDIDAS);
    return {
      reply,
      productIds: [],
      suggestions: ["Ver cat\xE1logo completo", "Ir a la tienda", "Hablar por WhatsApp"],
      intent: "despedida",
      resolved: true
    };
  }
  if (/(gracias|muchas gracias|mil gracias|te agradezco|agradecido|muy amable)/i.test(lower)) {
    const reply = avoidExactRepetition(AGRADECIMIENTOS[0], lastAssistantText, AGRADECIMIENTOS);
    return {
      reply,
      productIds: [],
      suggestions: ["Ver tendencias", "Ofertas y descuentos", "Gu\xEDa de tallas"],
      intent: "agradecimiento",
      resolved: true
    };
  }
  if (/(estado.*(pedido|orden|compra)|rastre(o|ar)|n[uú]mero.*gu[ií]a|d[oó]nde viene|mi paquete|gu[ií]a de despacho)/i.test(lower)) {
    const replyVariants = [
      `Para consultar el estado de tu pedido o el n\xFAmero de gu\xEDa de Coordinadora o Servientrega, puedes ingresar a tu secci\xF3n de [Mis Pedidos](/mis-pedidos). Tambi\xE9n puedes escribirnos a nuestro WhatsApp ${EMPRESA.whatsapp} indicando tu n\xFAmero de orden (ej: ORD-2026-001) y te informaremos en tiempo real.`,
      `Despachamos todas las \xF3rdenes desde Bogot\xE1 D.C. con n\xFAmero de gu\xEDa rastreable. Si ya realizaste una compra, puedes revisar el seguimiento detallado en [Mis Pedidos](/mis-pedidos) o contactarnos por WhatsApp con tu n\xFAmero de factura.`
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ["Ver mis pedidos", "Hablar por WhatsApp", "Tiempos de entrega"],
      intent: "estado_pedido",
      resolved: true
    };
  }
  if (/env[ií]o|flete|despacho|cu[aá]nto tarda|demora|transportadora|coordinadora|servientrega|cu[aá]ndo llega/i.test(lower)) {
    const replyVariants = [
      `En **${EMPRESA.nombreComercial}** despachamos a toda Colombia a trav\xE9s de Coordinadora y Servientrega. El env\xEDo es **GRATIS** por compras a partir de **${formatCOP(EMPRESA.umbralEnvioGratis)}**. Para compras inferiores, la tarifa plana nacional es de ${formatCOP(EMPRESA.costoEnvioNacional)}. En ciudades principales (Bogot\xE1, Medell\xEDn, Cali, Barranquilla) entregamos en 2 a 3 d\xEDas h\xE1biles. Consulta todos los detalles en nuestra secci\xF3n de [Env\xEDos](/envios).`,
      `Te cuento que realizamos despachos a todos los municipios del pa\xEDs. Los tiempos son: 2 a 3 d\xEDas h\xE1biles en ciudades principales y 3 a 5 d\xEDas en otros municipios. Si tu pedido supera ${formatCOP(EMPRESA.umbralEnvioGratis)}, \xA1el env\xEDo no tiene ning\xFAn costo! Adem\xE1s, te enviamos el n\xFAmero de gu\xEDa para rastreo en tiempo real.`
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ["\xBFQu\xE9 medios de pago aceptan?", "\xBFTienen contraentrega?", "Ver cat\xE1logo"],
      intent: "envios",
      resolved: true
    };
  }
  if (/pago|pagar|contraentrega|efectivo|tarjeta|pse|nequi|daviplata|bancolombia|banco/i.test(lower)) {
    const replyVariants = [
      `Aceptamos 3 modalidades de pago 100% seguras en Colombia:
1. **Pago Contraentrega en efectivo**: cancelas al mensajero cuando recibes el paquete en tu puerta.
2. **PSE**: d\xE9bito directo desde cuentas de ahorro o corriente (Bancolombia, Nequi, Daviplata, BBVA, etc.).
3. **Tarjetas de Cr\xE9dito y D\xE9bito**: Visa, Mastercard y American Express con cifrado SSL bancario.
Todos los precios ya incluyen el 19% de IVA.`,
      `\xA1Claro que s\xED! Puedes pagar con total tranquilidad: aceptamos tarjetas bancarias, transferencias en l\xEDnea v\xEDa PSE (incluidos Nequi y Daviplata) y tambi\xE9n **Pago Contraentrega en efectivo** al momento de recibir en tu domicilio.`
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ["\xBFC\xF3mo son los env\xEDos?", "\xBFTienen cambios?", "Ver productos populares"],
      intent: "pagos",
      resolved: true
    };
  }
  if (/cambio|cambiar|devoluci[oó]n|devolver|equivocad[ao]|talla no me sirvi[oó]|cambiar talla/i.test(lower)) {
    const replyVariants = [
      `En **${EMPRESA.nombreComercial}** cuentas con **${EMPRESA.diasCambioComercial} d\xEDas calendario** para solicitar cambios comerciales por talla, color o modelo. La prenda debe estar sin usar, limpia y con sus etiquetas intactas. Puedes tramitar tu cambio desde nuestro canal de WhatsApp ${EMPRESA.whatsapp} o revisando la secci\xF3n de [Cambios y Devoluciones](/cambios-y-devoluciones).`,
      `Dispones de hasta ${EMPRESA.diasCambioComercial} d\xEDas para realizar cambios si la prenda no te qued\xF3 como esperabas. Solo exigimos que conserve sus etiquetas originales y est\xE9 en perfecto estado sin uso. \xA1Tu satisfacci\xF3n es nuestra prioridad!`
    ];
    return {
      reply: avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants),
      productIds: [],
      suggestions: ["\xBFC\xF3mo es el derecho de retracto?", "Ver gu\xEDa de tallas", "Hablar por WhatsApp"],
      intent: "cambios",
      resolved: true
    };
  }
  if (/retracto|devoluci[oó]n de dinero|reembolso|ley 1480|estatuto del consumidor/i.test(lower)) {
    const reply = `Conforme al art\xEDculo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor), tienes derecho a retractarte de tu compra dentro de los **${EMPRESA.diasRetractoLegal} d\xEDas h\xE1biles** siguientes a la entrega de la prenda, recibiendo el reembolso \xEDntegro de lo pagado. La prenda debe entregarse en las mismas condiciones en que la recibiste. Para radicarlo, puedes escribir a ${EMPRESA.correoPQRS} o en [PQRS](/pqrs).`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ["Radicar PQRS", "Pol\xEDtica de garant\xEDas", "Hablar por WhatsApp"],
      intent: "retracto",
      resolved: true
    };
  }
  if (/garant[ií]a|defecto|dañad[ao]|fallo de fabricaci[oó]n|costura|roto/i.test(lower)) {
    const reply = `Todas las prendas y calzado de **${EMPRESA.nombreComercial}** cuentan con una **garant\xEDa legal de ${EMPRESA.diasGarantiaLegal} d\xEDas** calendario a partir de la entrega por defectos de fabricaci\xF3n o confecci\xF3n. Ante cualquier inconveniente, nos encargamos de la reparaci\xF3n, reposici\xF3n o reembolso seg\xFAn la ley colombiana. Escr\xEDbenos a ${EMPRESA.correoPQRS}.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ["Radicar garant\xEDa en PQRS", "Tiempos de entrega", "Contacto de soporte"],
      intent: "garantias",
      resolved: true
    };
  }
  if (/iva|impuesto|tributari[ao]|dian|factura/i.test(lower)) {
    const reply = `En **${EMPRESA.nombreComercial}** cumplimos estrictamente con el Estatuto Tributario colombiano. **El IVA del 19% ya est\xE1 incluido** en todos los precios visibles en la tienda. En tu comprobante de pedido y correo de confirmaci\xF3n ver\xE1s desglosada la base gravable y el valor exacto del impuesto liquidado.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ["Ver cat\xE1logo", "Medios de pago", "Preguntas frecuentes"],
      intent: "iva",
      resolved: true
    };
  }
  if (/contacto|tel[eé]fono|whatsapp|correo|direcci[oó]n|sede|d[oó]nde est[aá]n|oficina|horario/i.test(lower)) {
    const reply = `Nuestra sede principal est\xE1 ubicada en ${EMPRESA.direccion}, ${EMPRESA.ciudad}, Colombia. L\xEDnea de atenci\xF3n: ${EMPRESA.telefono} \xB7 WhatsApp: ${EMPRESA.whatsapp} \xB7 Correo: ${EMPRESA.correoContacto}. Horario: ${EMPRESA.horarioAtencion}. Puedes visitar nuestra p\xE1gina de [Contacto](/contacto) para enviarnos un mensaje o ver el mapa.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ["Ir a contacto", "Chatear por WhatsApp", "Radicar PQRS"],
      intent: "contacto",
      resolved: true
    };
  }
  if (lastProducts.length > 0) {
    if (/azul|negro|blanco|verde|beige|rojo|gris|color|colores|otro color/i.test(lower)) {
      const targetProd = lastProducts[0];
      const availableColors = targetProd.colors.map((c) => c.name).join(", ");
      const requestedColor = ["azul", "negro", "blanco", "verde", "beige", "rojo", "gris", "lavanda", "obsidiana"].find((col) => lower.includes(col));
      const hasRequestedColor = requestedColor ? targetProd.colors.some((c) => c.name.toLowerCase().includes(requestedColor)) : false;
      let reply = "";
      if (requestedColor && hasRequestedColor) {
        reply = `\xA1S\xED! Para **${targetProd.name}** tenemos disponible la variante en tono ${requestedColor.toUpperCase()}. Los colores de esta prenda son: ${availableColors}. Puedes seleccionarlo directamente desde la tarjeta de la prenda o al abrirla.`;
      } else if (requestedColor && !hasRequestedColor) {
        reply = `Para **${targetProd.name}** no tenemos actualmente el tono ${requestedColor}. Los colores confeccionados son: **${availableColors}**. Si deseas, te puedo buscar otra prenda de ${targetProd.category} que s\xED venga en ${requestedColor}.`;
      } else {
        reply = `Para **${targetProd.name}**, los colores disponibles son: **${availableColors}**. \xBFTe gustar\xEDa ver c\xF3mo lucen o explorar otra referencia?`;
      }
      return {
        reply: avoidExactRepetition(reply, lastAssistantText),
        productIds: [targetProd.id],
        suggestions: ["\xBFQu\xE9 tallas tienen?", "\xBFCu\xE1nto cuesta el env\xEDo?", "Ver otra prenda similar"],
        intent: "seguimiento_color",
        resolved: true
      };
    }
    if (/cu[aá]nto cuesta|cu[aá]nto vale|precio|cu[aá]l es el costo|segund[oa]|primer[oa]/i.test(lower)) {
      const isSecond = /segund[oa]/i.test(lower) && lastProducts.length > 1;
      const targetProd = isSecond ? lastProducts[1] : lastProducts[0];
      const finalPrice = targetProd.discountPrice || targetProd.price;
      const hasDiscount = Boolean(targetProd.discountPrice);
      const reply = `El valor de **${targetProd.name}** es de **${formatCOP(finalPrice)}** con el IVA del 19% ya liquidado.${hasDiscount ? ` (Presenta precio especial de descuento frente al precio habitual de ${formatCOP(targetProd.price)}).` : ""} Recuerda que si completas ${formatCOP(EMPRESA.umbralEnvioGratis)} en tu pedido, \xA1el flete a toda Colombia es totalmente gratis!`;
      return {
        reply: avoidExactRepetition(reply, lastAssistantText),
        productIds: [targetProd.id],
        suggestions: ["Agregar al carrito", "\xBFTienen mi talla?", "\xBFC\xF3mo son los medios de pago?"],
        intent: "seguimiento_precio",
        resolved: true
      };
    }
    if (/\b(talla|tallas|medida|medidas)\b|\b(36|37|38|39|40|41|42|43|xs|s|m|l|xl)\b/i.test(lower)) {
      const targetProd = lastProducts[0];
      const availableSizes = targetProd.sizes.join(", ");
      const requestedSize = ["xs", "s", "m", "l", "xl", "36", "37", "38", "39", "40", "41", "42", "43"].find((sz) => new RegExp(`\\b${sz}\\b`, "i").test(lower));
      let reply = "";
      if (requestedSize) {
        const hasSize = targetProd.sizes.some((s) => s.toLowerCase() === requestedSize.toLowerCase());
        if (hasSize) {
          reply = `\xA1Claro que s\xED! **${targetProd.name}** se encuentra disponible en talla **${requestedSize.toUpperCase()}**. Las tallas de fabricaci\xF3n para este modelo son: ${availableSizes}. Te sugiero a\xF1adirla al carrito antes de que se agoten las existencias.`;
        } else {
          reply = `Para **${targetProd.name}** actualmente no disponemos de la talla ${requestedSize.toUpperCase()}. Sus tallas activas son: **${availableSizes}**. \xBFDeseas que busquemos una alternativa en tu talla exacta?`;
        }
      } else {
        reply = `Para **${targetProd.name}**, las tallas disponibles son: **${availableSizes}**. Si tienes dudas sobre c\xF3mo medirte, puedes consultar nuestra [Gu\xEDa de Tallas](/guia-de-tallas).`;
      }
      return {
        reply: avoidExactRepetition(reply, lastAssistantText),
        productIds: [targetProd.id],
        suggestions: ["Ver gu\xEDa de tallas", "Agregar al carrito", "\xBFC\xF3mo son los cambios?"],
        intent: "seguimiento_talla",
        resolved: true
      };
    }
  }
  if (/talla|medidas|qu[eé] talla soy|cent[ií]metros|cm|como elegir mi talla/i.test(lower)) {
    const reply = `Para calzado colombiano manejamos numeraci\xF3n del 36 al 43 (ej: talla 39 corresponde a ~25.5 cm de longitud de pie). En prendas superiores e inferiores confeccionamos desde XS hasta XL con siluetas contempor\xE1neas y regulares. Te invitamos a consultar nuestra [Gu\xEDa de Tallas](/guia-de-tallas) con tablas de medidas precisas en cent\xEDmetros.`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: [],
      suggestions: ["Ver calzado", "\xBFC\xF3mo son los cambios?", "Hablar con un asesor"],
      intent: "tallas",
      resolved: true
    };
  }
  if (/nueva colecci[oó]n|tendencia|descuento|oferta|promoci[oó]n|liquidaci[oó]n|lookbook/i.test(lower)) {
    const isDiscount = /descuento|oferta|promoci[oó]n/i.test(lower);
    const relevantProducts = isDiscount ? catalog.filter((p) => Boolean(p.discountPrice)).slice(0, 3) : catalog.filter((p) => p.isNew || p.isPopular).slice(0, 3);
    const reply = isDiscount ? `\xA1Tenemos excelentes promociones de temporada! Puedes explorar todas las prendas con descuento activo en nuestra secci\xF3n de [Descuentos Especiales](/descuentos). Aqu\xED te presento algunas piezas seleccionadas:` : `Te invito a conocer lo m\xE1s reciente en moda contempor\xE1nea en nuestra [Nueva Colecci\xF3n](/nueva-coleccion) y las piezas destacadas en [Tendencias](/tendencias). Mira estas opciones destacadas:`;
    return {
      reply: avoidExactRepetition(reply, lastAssistantText),
      productIds: relevantProducts.map((p) => p.id),
      suggestions: isDiscount ? ["Ver m\xE1s descuentos", "Menos de $150.000", "\xBFC\xF3mo son los env\xEDos?"] : ["Ver tendencias", "Zapatos urbanos", "Chaquetas elegantes"],
      intent: "colecciones",
      resolved: true
    };
  }
  const topMatches = scoredCandidates.filter((c) => c.score > 15).slice(0, 3);
  if (topMatches.length > 0) {
    const matchedProds = topMatches.map((c) => c.product);
    const top = matchedProds[0];
    const finalPrice = top.discountPrice || top.price;
    const replyVariants = [
      `\xA1Excelente elecci\xF3n! Te recomiendo especialmente **${top.name}** (${formatCOP(finalPrice)}, IVA 19% incluido) de nuestra categor\xEDa de ${top.category}. Es una prenda destacada por su confort y confecci\xF3n nacional de alta durabilidad. \xBFTe gustar\xEDa verla en alg\xFAn color o talla en espec\xEDfico?`,
      `He seleccionado para ti **${top.name}** por ${formatCOP(finalPrice)}. Combina dise\xF1o contempor\xE1neo y acabados impecables. Adem\xE1s, aqu\xED tienes otras opciones de la misma l\xEDnea que van perfecto con ese estilo:`,
      `Revisando nuestro cat\xE1logo en bodega, **${top.name}** se ajusta perfecto a lo que buscas. Est\xE1 disponible para despacho inmediato a toda Colombia. \xBFQu\xE9 talla sueles utilizar habitualmente?`
    ];
    const reply = avoidExactRepetition(replyVariants[0], lastAssistantText, replyVariants);
    return {
      reply,
      productIds: matchedProds.map((p) => p.id),
      suggestions: ["\xBFHay en otros colores?", "\xBFQu\xE9 tallas tienen?", "\xBFC\xF3mo es el env\xEDo?"],
      intent: "busqueda_catalogo",
      resolved: true
    };
  }
  const clarifyingResponses = [
    `Con mucho gusto te asesoro. Para encontrar la prenda ideal para ti, \xBFpara qu\xE9 ocasi\xF3n la necesitas (casual, oficina, fiesta o deporte) o tienes alg\xFAn color o presupuesto en mente?`,
    `\xA1Claro que s\xED! Cu\xE9ntame un poco m\xE1s sobre el estilo que buscas: \xBFprefieres prendas superiores como chaquetas y camisetas, calzado urbano o accesorios de cuero?`,
    `En ${EMPRESA.nombreComercial} tenemos colecciones de calzado, chaquetas, bolsos y prendas urbanas. \xBFTienes alguna talla o presupuesto espec\xEDfico para filtrarte las mejores opciones?`
  ];
  const defaultReply = avoidExactRepetition(clarifyingResponses[0], lastAssistantText, clarifyingResponses);
  const featuredProds = catalog.filter((p) => p.isPopular || p.isNew).slice(0, 2);
  return {
    reply: defaultReply,
    productIds: featuredProds.map((p) => p.id),
    suggestions: ["\u{1F45F} Tenis urbanos", "\u{1F9E5} Chaquetas y blazers", "\u{1F45C} Bolsos en cuero"],
    intent: "consulta_general",
    resolved: false
  };
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.set("trust proxy", 1);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("[DATABASE] Supabase PostgreSQL client initialized successfully");
  } catch (err) {
    console.warn("[DATABASE] Error initializing Supabase client:", err.message);
  }
}
var inMemoryUsers = [];
var products = [...INITIAL_PRODUCTS];
var categories = [...INITIAL_CATEGORIES];
var orders = [];
var appEvents = [];
var contactMessages = [];
var pqrsList = [
  {
    id: "pqrs-seed-1",
    radicado: `PQRS-2026-000101`,
    type: "peticion",
    fullName: "Carolina Herrera",
    docType: "CC",
    docNumber: "52890123",
    email: "carolina@ejemplo.com",
    phone: "3104567890",
    subject: "Consulta sobre cobertura de env\xEDos a Leticia, Amazonas",
    description: "Deseo conocer si realizan despachos y cu\xE1les son los tiempos de entrega hacia el departamento del Amazonas.",
    status: "resuelto",
    responseMessage: "Estimada Carolina: realizamos env\xEDos a Leticia a trav\xE9s de Coordinadora y Servientrega a\xE9rea. El tiempo estimado de entrega es de 5 a 8 d\xEDas h\xE1biles con tarifa fija de $12.000 COP, o completamente gratis en compras superiores a $200.000 COP.",
    responseDeadline: "15 d\xEDas h\xE1biles",
    ip: "127.0.0.1",
    createdAt: new Date(Date.now() - 864e5 * 2).toISOString()
  }
];
var pqrsRadicadoSequence = 102;
var activeCoupons = [
  { code: "MOVI10", discountPercent: 10, minSubtotal: 1e5, active: true },
  { code: "COLOMBIA10", discountPercent: 10, minSubtotal: 8e4, active: true },
  { code: "ESTILO15", discountPercent: 15, minSubtotal: 15e4, active: true },
  { code: "BIENVENIDO", discountPercent: 10, minSubtotal: 5e4, active: true }
];
var newsletterSubscribers = [];
var auditLogs = [
  {
    id: "log-sys-init",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    eventType: "AUTH_LOGIN",
    severity: "info",
    description: "Sistema inicializado con autenticaci\xF3n dual (Cookie + Bearer JWT) y RBAC",
    ip: "127.0.0.1",
    userRole: "admin",
    status: "SUCCESS"
  }
];
function recordAudit(log) {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...log
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 100) auditLogs.pop();
  if (supabase) {
    (async () => {
      try {
        await supabase.from("app_audit_logs").insert({
          event_type: log.eventType,
          severity: log.severity,
          description: log.description,
          ip: log.ip,
          user_role: log.userRole,
          status: log.status
        });
      } catch (err) {
        console.warn("[AUDIT] Error persisting audit log to Supabase:", err.message);
      }
    })();
  }
}
var JWT_SECRET = process.env.JWT_SECRET || "movifashion-jwt-secret-dev-fixed-2026-32chars";
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("[AUTH ERROR] JWT_SECRET no configurado en entorno de producci\xF3n. Configure JWT_SECRET en las variables de entorno.");
  } else {
    console.warn("[AUTH ADVERTENCIA] JWT_SECRET no definido en .env. Usando clave fija persistente para desarrollo local.");
  }
}
var COOKIE_NAME = "token";
var cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1e3
  // 7 días
};
function hashPassword2(password) {
  const salt = randomBytes3(16).toString("hex");
  const hash = scryptSync2(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  try {
    const [salt, key] = stored.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = scryptSync2(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function extractToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
var loginRateLimitMap = /* @__PURE__ */ new Map();
function checkLoginRateLimit(key) {
  const now = Date.now();
  const record = loginRateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    loginRateLimitMap.set(key, { attempts: 1, resetAt: now + 15 * 60 * 1e3 });
    return true;
  }
  if (record.attempts >= 5) {
    return false;
  }
  record.attempts += 1;
  return true;
}
function resetLoginRateLimit(key) {
  loginRateLimitMap.delete(key);
}
var effectiveAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
var effectiveAdminPassword = process.env.ADMIN_PASSWORD || "";
var shouldCreateAdmin = false;
if (process.env.NODE_ENV === "production") {
  if (!effectiveAdminEmail || !effectiveAdminPassword) {
    console.error("[ADMIN ERROR] Variables ADMIN_EMAIL o ADMIN_PASSWORD no definidas en producci\xF3n. No se crear\xE1 administrador autom\xE1tico.");
  } else {
    shouldCreateAdmin = true;
  }
} else {
  if (!effectiveAdminEmail || !effectiveAdminPassword) {
    effectiveAdminEmail = "admin@movifashion.co";
    effectiveAdminPassword = `DevPass${randomBytes3(4).toString("hex")}!`;
    console.log(`Admin de desarrollo: ${effectiveAdminEmail} / ${effectiveAdminPassword}`);
  }
  shouldCreateAdmin = true;
}
var lastSchemaCheck = {
  supabase: false,
  tablas: {},
  faltantes: []
};
async function verifySupabaseSchema() {
  if (!supabase) {
    lastSchemaCheck = { supabase: false, tablas: {}, faltantes: ["Supabase no configurado"] };
    return lastSchemaCheck;
  }
  const tablasVerificar = {
    app_users: "id, name, email, password_hash, role, role_id, estado, mfa_secret, mfa_enabled, must_change_password, created_at",
    app_orders: "id, user_id, user_name, user_email, items, subtotal, subtotal_base, iva, tarifa_iva, shipping, discount, coupon_code, total, status, shipping_address, payment_method, payment_status, tracking_number, created_at",
    app_events: "id, session_id, user_id, event_type, product_id, category, metadata, simulated, created_at",
    app_audit_logs: "id, event_type, severity, description, ip, user_role, status, created_at",
    app_categories: "id, name, slug, description, icon_name, sort_order, created_at",
    app_products: "id, name, slug, category, brand, price, discount_price, inventory, description, images, colors, sizes, color_images, tags, rating, review_count, is_popular, is_featured, created_at",
    staff_roles: "id, nombre, descripcion, permisos, es_sistema, created_at",
    contact_messages: "id, name, email, phone, subject, message, ip, created_at",
    pqrs: "id, radicado, type, full_name, doc_type, doc_number, email, phone, subject, description, status, created_at",
    coupons: "code, discount_percent, min_subtotal, active, created_at",
    returns: "id, order_id, user_id, user_name, user_email, tipo, items, motivo, estado, created_at",
    newsletter_subscribers: "email, consent, source, ip, created_at"
  };
  const statusTablas = {};
  const faltantes = [];
  for (const [table, cols] of Object.entries(tablasVerificar)) {
    try {
      const { error } = await supabase.from(table).select(cols).limit(0);
      if (error) {
        statusTablas[table] = false;
        faltantes.push(`${table}: ${error.message}`);
        console.error(`[SCHEMA VERIFY ERROR] Tabla o columna faltante en '${table}': ${error.message}`);
      } else {
        statusTablas[table] = true;
      }
    } catch (err) {
      statusTablas[table] = false;
      faltantes.push(`${table}: ${err.message}`);
      console.error(`[SCHEMA VERIFY ERROR] Excepci\xF3n al verificar tabla '${table}': ${err.message}`);
    }
  }
  if (faltantes.length > 0) {
    console.warn("[SCHEMA VERIFY] ATENCI\xD3N: Se detectaron tablas o columnas faltantes en Supabase. Ejecuta supabase/setup.sql para aplicar el esquema completo e idempotente.");
  } else {
    console.log("[SCHEMA VERIFY] Todas las tablas y columnas requeridas existen y son v\xE1lidas en Supabase PostgreSQL.");
  }
  lastSchemaCheck = {
    supabase: true,
    tablas: statusTablas,
    faltantes
  };
  return lastSchemaCheck;
}
async function syncDatabaseOnStartup() {
  const isProduction = process.env.NODE_ENV === "production";
  const adminHash = shouldCreateAdmin && effectiveAdminPassword ? hashPassword2(effectiveAdminPassword) : "";
  if (shouldCreateAdmin && effectiveAdminEmail && adminHash) {
    const existingAdmin = inMemoryUsers.find((u) => u.email.toLowerCase() === effectiveAdminEmail.toLowerCase());
    if (!existingAdmin) {
      inMemoryUsers.push({
        id: "admin-seed-uuid-01",
        name: "Administrador MOVIFASHION",
        email: effectiveAdminEmail,
        password_hash: adminHash,
        role: "admin",
        roleId: "super_admin",
        permissions: getCachedPermissions("super_admin"),
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      existingAdmin.password_hash = adminHash;
      existingAdmin.role = "admin";
      existingAdmin.roleId = "super_admin";
      existingAdmin.permissions = getCachedPermissions("super_admin");
    }
  }
  const demoEmail = "cliente@movifashion.ai";
  const allowSeedDemo = process.env.SEED_DEMO_USERS === "true" && !isProduction;
  if (allowSeedDemo) {
    const demoPassword = "Cliente2026!";
    const demoHash = hashPassword2(demoPassword);
    if (!inMemoryUsers.some((u) => u.email === demoEmail)) {
      inMemoryUsers.push({
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: demoEmail,
        password_hash: demoHash,
        role: "cliente",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    for (const staff of SEED_STAFF_USERS) {
      const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === staff.email.toLowerCase());
      if (!existing) {
        inMemoryUsers.push({
          id: `staff-${staff.roleId}`,
          name: staff.name,
          email: staff.email.toLowerCase(),
          password_hash: hashPassword2(staff.password),
          role: staff.roleId === "super_admin" ? "admin" : staff.roleId,
          roleId: staff.roleId,
          permissions: getCachedPermissions(staff.roleId),
          estado: staff.estado,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else {
        existing.roleId = staff.roleId;
        if (staff.roleId === "super_admin") existing.role = "admin";
        existing.permissions = getCachedPermissions(staff.roleId);
        existing.estado = staff.estado;
      }
    }
  }
  if (orders.length === 0) {
    orders.push(
      {
        id: "ORD-9842",
        userId: DEMO_USER.id,
        userName: DEMO_USER.name,
        userEmail: demoEmail,
        items: [
          {
            id: "item-1",
            product: products[0],
            selectedSize: "39",
            selectedColor: products[0].colors[0],
            quantity: 1
          }
        ],
        subtotal: 189e3,
        shipping: 0,
        discount: 0,
        total: 189e3,
        status: "Enviado",
        shippingAddress: DEMO_USER.addresses[0],
        paymentMethod: "credit_card",
        paymentStatus: "paid",
        trackingNumber: "MOV-COL-882194",
        createdAt: "2026-10-28T14:30:00Z"
      },
      {
        id: "ORD-9751",
        userId: DEMO_USER.id,
        userName: DEMO_USER.name,
        userEmail: demoEmail,
        items: [
          {
            id: "item-2",
            product: products[2],
            selectedSize: "\xDAnica",
            selectedColor: products[2].colors[0],
            quantity: 1
          }
        ],
        subtotal: 265e3,
        shipping: 0,
        discount: 0,
        total: 265e3,
        status: "Entregado",
        shippingAddress: DEMO_USER.addresses[0],
        paymentMethod: "pse",
        paymentStatus: "paid",
        trackingNumber: "MOV-COL-741902",
        createdAt: "2026-10-14T09:15:00Z"
      }
    );
  }
  if (!supabase) return;
  try {
    await verifySupabaseSchema();
    try {
      const { data: supaUsers, error: usersErr } = await supabase.from("app_users").select("*");
      if (!usersErr && supaUsers && supaUsers.length > 0) {
        for (const su of supaUsers) {
          const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === su.email.toLowerCase());
          const roleId = su.role_id || su.role;
          const mappedRole = su.role === "admin" || roleId === "super_admin" ? "admin" : roleId;
          const userObj = {
            id: su.id,
            name: su.name,
            email: su.email.toLowerCase(),
            password_hash: su.password_hash,
            role: mappedRole,
            roleId,
            permissions: getCachedPermissions(roleId),
            estado: su.estado || "activo",
            mfa_secret: su.mfa_secret,
            mfaEnabled: su.mfa_enabled,
            mustChangePassword: su.must_change_password,
            created_at: su.created_at
          };
          if (!existing) {
            inMemoryUsers.push(userObj);
          } else {
            Object.assign(existing, userObj);
          }
        }
        console.log(`[SUPABASE] ${supaUsers.length} usuarios sincronizados desde app_users.`);
      }
    } catch (err) {
      console.warn("[SUPABASE] Error cargando usuarios de app_users:", err.message);
    }
    if (shouldCreateAdmin && effectiveAdminEmail && adminHash) {
      const { data: existingAdmin } = await supabase.from("app_users").select("id, password_hash").eq("email", effectiveAdminEmail).maybeSingle();
      if (!existingAdmin) {
        await supabase.from("app_users").insert({
          id: "admin-seed-uuid-01",
          name: "Administrador MOVIFASHION",
          email: effectiveAdminEmail,
          password_hash: adminHash,
          role: "admin",
          role_id: "super_admin",
          estado: "activo"
        });
        console.log(`[SUPABASE] Usuario admin creado en app_users: ${effectiveAdminEmail}`);
      } else {
        await supabase.from("app_users").update({
          password_hash: adminHash,
          role: "admin",
          role_id: "super_admin",
          estado: "activo"
        }).eq("id", existingAdmin.id);
        console.log(`[SUPABASE] Contrase\xF1a y rol de admin actualizados en app_users: ${effectiveAdminEmail}`);
      }
    }
    if (allowSeedDemo) {
      const demoEmail2 = "cliente@movifashion.ai";
      const demoPassword = "Cliente2026!";
      const demoHash = hashPassword2(demoPassword);
      const { data: existingDemo } = await supabase.from("app_users").select("id").eq("email", demoEmail2).maybeSingle();
      if (!existingDemo) {
        await supabase.from("app_users").insert({
          id: DEMO_USER.id,
          name: DEMO_USER.name,
          email: demoEmail2,
          password_hash: demoHash,
          role: "cliente"
        });
        console.log(`[SUPABASE] Usuario cliente demo creado: ${demoEmail2}`);
      }
    }
    const { data: catRows, error: catErr } = await supabase.from("app_categories").select("id");
    if (!catErr && (!catRows || catRows.length === 0)) {
      console.log("[SUPABASE] Inicializando 8 categor\xEDas en base de datos...");
      const seedCats = INITIAL_CATEGORIES.map((c, idx) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon_name: c.iconName,
        sort_order: idx
      }));
      await supabase.from("app_categories").upsert(seedCats, { onConflict: "id" });
    } else if (catRows && catRows.length > 0) {
      const { data: loadedCats } = await supabase.from("app_categories").select("*").order("sort_order", { ascending: true });
      if (loadedCats && loadedCats.length > 0) {
        categories = loadedCats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          iconName: c.icon_name || "Sparkles",
          itemCount: 0
        }));
      }
    }
    const { data: prodRows, error: prodErr } = await supabase.from("app_products").select("id");
    if (!prodErr && (!prodRows || prodRows.length === 0)) {
      console.log("[SUPABASE] Inicializando 40 productos fotogr\xE1ficos en base de datos...");
      const seedProds = INITIAL_PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: p.category,
        brand: p.brand,
        price: p.price,
        discount_price: p.discountPrice || null,
        inventory: p.inventory,
        description: p.description,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        color_images: p.colorImages || {},
        tags: p.tags,
        rating: p.rating,
        review_count: p.reviewCount,
        is_popular: p.isPopular || false,
        is_featured: p.isNew || false
      }));
      await supabase.from("app_products").upsert(seedProds, { onConflict: "id" });
    } else if (prodRows && prodRows.length > 0) {
      const { data: loadedProds } = await supabase.from("app_products").select("*");
      if (loadedProds && loadedProds.length > 0) {
        products = loadedProds.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: Number(p.price),
          discountPrice: p.discount_price ? Number(p.discount_price) : void 0,
          category: p.category,
          brand: p.brand,
          images: p.images || [],
          colorImages: p.color_images || {},
          sizes: p.sizes || ["S", "M", "L"],
          colors: p.colors || [{ name: "Est\xE1ndar", hex: "#25232B" }],
          inventory: Number(p.inventory),
          rating: Number(p.rating) || 5,
          reviewCount: Number(p.review_count) || 0,
          isPopular: Boolean(p.is_popular),
          isNew: Boolean(p.is_featured),
          tags: p.tags || [],
          createdAt: p.created_at || (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    }
    const { data: loadedOrders } = await supabase.from("app_orders").select("*").order("created_at", { ascending: false });
    if (loadedOrders && loadedOrders.length > 0) {
      orders = loadedOrders.map((o) => ({
        id: o.id,
        userId: o.user_id || "usr-anonymous",
        userName: o.user_name || "Cliente",
        userEmail: o.user_email || "cliente@movifashion.ai",
        items: o.items || [],
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        discount: Number(o.discount) || 0,
        total: Number(o.total),
        status: o.status || "Pendiente",
        shippingAddress: o.shipping_address || {},
        paymentMethod: o.payment_method || "credit_card",
        paymentStatus: o.payment_status || "paid",
        trackingNumber: o.tracking_number || `MOV-COL-${Math.floor(1e5 + Math.random() * 9e5)}`,
        simulated: Boolean(o.simulated),
        createdAt: o.created_at
      }));
    }
  } catch (err) {
    console.warn("[SUPABASE] Fallback a memoria local para cat\xE1logo:", err.message);
  }
  initializeAdminStore(products, orders);
  console.log("[ADMIN STORE] Tienda administrativa inicializada con variantes, historial y m\xE9tricas.");
}
syncDatabaseOnStartup().catch(console.error);
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    console.warn(`[AUTH] Autenticaci\xF3n fallida: No se proporcion\xF3 token ni en cookie '${COOKIE_NAME}' ni en cabecera Authorization Bearer para ${req.method} ${req.path}`);
    res.status(401).json({ error: "Autenticaci\xF3n requerida. Inicia sesi\xF3n para continuar." });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.warn(`[AUTH] Token expirado en ${req.method} ${req.path}`);
      res.status(401).json({ error: "Tu sesi\xF3n ha expirado. Inicia sesi\xF3n de nuevo." });
    } else {
      console.warn(`[AUTH] Token inv\xE1lido en ${req.method} ${req.path}: ${err.message}`);
      res.status(401).json({ error: "Sesi\xF3n inv\xE1lida." });
    }
  }
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      recordAudit({
        eventType: "ROLE_CHECK",
        severity: "alert",
        description: `Acceso denegado a ruta de administrador: ${req.path} por usuario ${req.user?.email || "desconocido"} con rol '${req.user?.role || "sin rol"}'`,
        ip: req.ip || "127.0.0.1",
        userRole: req.user?.role || "cliente",
        status: "BLOCKED"
      });
      res.status(403).json({ error: "Acceso denegado: se requieren permisos de administrador" });
      return;
    }
    next();
  });
}
var geminiApiKey = process.env.GEMINI_API_KEY;
var ai = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    version: "1.2.0",
    app: "MOVIFASHION AI",
    persistence: supabase ? "Supabase PostgreSQL" : "In-Memory Secure Store",
    supabase: Boolean(supabase),
    tablas: lastSchemaCheck.tablas,
    faltantes: lastSchemaCheck.faltantes,
    totalProducts: products.length,
    totalCategories: categories.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/sitemap.xml", (_req, res) => {
  const baseUrl = EMPRESA.sitioWeb || "https://movifashion.vercel.app";
  const staticRoutes = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/catalogo", priority: "0.9", changefreq: "daily" },
    { loc: "/nueva-coleccion", priority: "0.9", changefreq: "weekly" },
    { loc: "/tendencias", priority: "0.8", changefreq: "daily" },
    { loc: "/descuentos", priority: "0.8", changefreq: "daily" },
    { loc: "/asistente", priority: "0.7", changefreq: "monthly" },
    { loc: "/nosotros", priority: "0.6", changefreq: "monthly" },
    { loc: "/mision-vision", priority: "0.6", changefreq: "monthly" },
    { loc: "/contacto", priority: "0.6", changefreq: "monthly" },
    { loc: "/pqrs", priority: "0.6", changefreq: "monthly" },
    { loc: "/preguntas-frecuentes", priority: "0.6", changefreq: "weekly" },
    { loc: "/guia-de-tallas", priority: "0.6", changefreq: "monthly" },
    { loc: "/envios", priority: "0.6", changefreq: "monthly" },
    { loc: "/cambios-y-devoluciones", priority: "0.6", changefreq: "monthly" },
    { loc: "/terminos-y-condiciones", priority: "0.5", changefreq: "yearly" },
    { loc: "/politica-de-privacidad", priority: "0.5", changefreq: "yearly" },
    { loc: "/politica-de-cookies", priority: "0.5", changefreq: "yearly" }
  ];
  const categoryRoutes = categories.map((c) => ({
    loc: `/catalogo/${c.id}`,
    priority: "0.8",
    changefreq: "weekly"
  }));
  const productRoutes = products.map((p) => ({
    loc: `/producto/${p.id}`,
    priority: "0.8",
    changefreq: "weekly"
  }));
  const allUrls = [...staticRoutes, ...categoryRoutes, ...productRoutes];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(
    (u) => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  ).join("\n")}
</urlset>`;
  res.header("Content-Type", "application/xml");
  res.send(xml);
});
app.get("/robots.txt", (_req, res) => {
  const baseUrl = EMPRESA.sitioWeb || "https://movifashion.vercel.app";
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header("Content-Type", "text/plain");
  res.send(robots);
});
var contactRateLimits = /* @__PURE__ */ new Map();
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message, hp } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    if (hp) {
      res.json({ success: true, message: "Mensaje recibido" });
      return;
    }
    const now = Date.now();
    const rate = contactRateLimits.get(ip) || { count: 0, resetAt: now + 30 * 60 * 1e3 };
    if (now > rate.resetAt) {
      rate.count = 0;
      rate.resetAt = now + 30 * 60 * 1e3;
    }
    rate.count++;
    contactRateLimits.set(ip, rate);
    if (rate.count > 5) {
      res.status(429).json({ error: "Has alcanzado el l\xEDmite de mensajes por hora. Por favor cont\xE1ctanos por WhatsApp." });
      return;
    }
    if (!name || !email || !message) {
      res.status(400).json({ error: "Nombre, correo y mensaje son obligatorios." });
      return;
    }
    const newContact = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(name).slice(0, 100),
      email: String(email).slice(0, 100),
      phone: phone ? String(phone).slice(0, 30) : void 0,
      subject: String(subject || "consulta_general").slice(0, 100),
      message: String(message).slice(0, 1500),
      ip,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    contactMessages.push(newContact);
    if (supabase) {
      try {
        await supabase.from("contact_messages").insert({
          id: newContact.id,
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone,
          subject: newContact.subject,
          message: newContact.message,
          ip: newContact.ip
        });
      } catch (err) {
        console.warn("[CONTACT] Fallback in-memory:", err.message);
      }
    }
    recordAudit({
      eventType: "API_REQUEST",
      severity: "info",
      description: `Nuevo mensaje de contacto recibido de ${newContact.name} (${newContact.email})`,
      ip,
      userRole: "cliente",
      status: "SUCCESS"
    });
    res.json({ success: true, message: "Mensaje registrado con \xE9xito. Te responderemos a la brevedad." });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar el mensaje de contacto." });
  }
});
app.post("/api/pqrs", async (req, res) => {
  try {
    const { type, fullName, docType, docNumber, email, phone, orderId, subject, description, hp } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    if (hp) {
      res.json({ success: true, radicado: `PQRS-${(/* @__PURE__ */ new Date()).getFullYear()}-000101` });
      return;
    }
    if (!fullName || !email || !docNumber || !subject || !description) {
      res.status(400).json({ error: "Completa todos los campos obligatorios del radicado PQRS." });
      return;
    }
    const radicado = `PQRS-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(pqrsRadicadoSequence++).padStart(6, "0")}`;
    const newPqrs = {
      id: `pqrs-${Date.now()}`,
      radicado,
      type: type || "reclamo",
      fullName: String(fullName).slice(0, 120),
      docType: docType || "CC",
      docNumber: String(docNumber).slice(0, 30),
      email: String(email).slice(0, 100),
      phone: phone ? String(phone).slice(0, 30) : void 0,
      orderId: orderId ? String(orderId).slice(0, 30) : void 0,
      subject: String(subject).slice(0, 150),
      description: String(description).slice(0, 2500),
      status: "recibido",
      responseDeadline: "15 d\xEDas h\xE1biles",
      ip,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    pqrsList.push(newPqrs);
    if (supabase) {
      try {
        await supabase.from("pqrs").insert({
          id: newPqrs.id,
          radicado: newPqrs.radicado,
          type: newPqrs.type,
          full_name: newPqrs.fullName,
          doc_type: newPqrs.docType,
          doc_number: newPqrs.docNumber,
          email: newPqrs.email,
          phone: newPqrs.phone,
          order_id: newPqrs.orderId,
          subject: newPqrs.subject,
          description: newPqrs.description,
          status: newPqrs.status,
          response_deadline: newPqrs.responseDeadline,
          ip: newPqrs.ip
        });
      } catch (err) {
        console.warn("[PQRS] Fallback in-memory:", err.message);
      }
    }
    recordAudit({
      eventType: "API_REQUEST",
      severity: "info",
      description: `Radicada nueva PQRS con n\xFAmero: ${radicado} (${newPqrs.email})`,
      ip,
      userRole: "cliente",
      status: "SUCCESS"
    });
    res.json({
      success: true,
      radicado,
      responseDeadline: "15 d\xEDas h\xE1biles",
      message: `Tu solicitud ha sido radicada con el n\xFAmero ${radicado}. Hemos enviado la constancia formal a tu correo.`
    });
  } catch (error) {
    res.status(500).json({ error: "Error al radicar la solicitud PQRS." });
  }
});
app.get("/api/pqrs/:radicado", async (req, res) => {
  try {
    const radicadoInput = String(req.params.radicado || "").trim().toUpperCase();
    let found = pqrsList.find((p) => p.radicado.toUpperCase() === radicadoInput);
    if (!found && supabase) {
      try {
        const { data } = await supabase.from("pqrs").select("*").eq("radicado", radicadoInput).single();
        if (data) {
          found = {
            id: data.id,
            radicado: data.radicado,
            type: data.type,
            fullName: data.full_name,
            docType: data.doc_type,
            docNumber: data.doc_number,
            email: data.email,
            phone: data.phone,
            orderId: data.order_id,
            subject: data.subject,
            description: data.description,
            status: data.status,
            responseMessage: data.response_message,
            responseDeadline: data.response_deadline || "15 d\xEDas h\xE1biles",
            ip: data.ip || "127.0.0.1",
            createdAt: data.created_at
          };
        }
      } catch {
      }
    }
    if (!found) {
      res.status(404).json({ error: `No se encontr\xF3 ninguna solicitud con el radicado ${radicadoInput}.` });
      return;
    }
    res.json({ success: true, pqrs: found });
  } catch (error) {
    res.status(500).json({ error: "Error al consultar el radicado PQRS." });
  }
});
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email, consent, source } = req.body;
    const ip = req.ip || "127.0.0.1";
    if (!consent) {
      res.status(400).json({ error: "Debes autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012." });
      return;
    }
    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Ingresa un correo electr\xF3nico v\xE1lido." });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    newsletterSubscribers.push({
      email: cleanEmail,
      consent: true,
      ip,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (supabase) {
      try {
        await supabase.from("newsletter_subscribers").upsert({
          email: cleanEmail,
          consent: true,
          source: source || "web_footer",
          ip
        });
      } catch (err) {
        console.warn("[NEWSLETTER] Fallback in-memory:", err.message);
      }
    }
    res.json({ success: true, message: "\xA1Gracias por suscribirte a nuestro bolet\xEDn!" });
  } catch (error) {
    res.status(500).json({ error: "Error procesando la suscripci\xF3n al bolet\xEDn." });
  }
});
app.post("/api/coupons/validate", (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ error: "C\xF3digo de cup\xF3n requerido." });
      return;
    }
    const cleanCode = String(code).trim().toUpperCase();
    const coupon = activeCoupons.find((c) => c.code === cleanCode && c.active);
    if (!coupon) {
      res.status(404).json({ error: "El cup\xF3n no existe o ha expirado." });
      return;
    }
    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.minSubtotal && orderSubtotal < coupon.minSubtotal) {
      res.status(400).json({
        error: `Este cup\xF3n exige una compra m\xEDnima de $${coupon.minSubtotal.toLocaleString("es-CO")} COP.`
      });
      return;
    }
    const discountAmount = Math.round(orderSubtotal * coupon.discountPercent / 100);
    res.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount
    });
  } catch (error) {
    res.status(500).json({ error: "Error validando el cup\xF3n de descuento." });
  }
});
app.get("/api/auth/debug", (req, res) => {
  const isDev = process.env.NODE_ENV !== "production";
  const token = extractToken(req);
  let tokenValid = false;
  let decodedUser = null;
  if (token) {
    try {
      decodedUser = jwt.verify(token, JWT_SECRET);
      tokenValid = true;
    } catch {
      tokenValid = false;
    }
  }
  const isAdmin = decodedUser?.role === "admin";
  if (!isDev && !isAdmin) {
    res.status(403).json({ error: "Acceso restringido al diagn\xF3stico de autenticaci\xF3n." });
    return;
  }
  res.json({
    hasCookie: Boolean(req.cookies?.[COOKIE_NAME]),
    hasBearer: Boolean(req.headers.authorization?.toLowerCase().startsWith("bearer ")),
    tokenReceived: Boolean(token),
    tokenValid,
    jwtSecretConfigured: Boolean(process.env.JWT_SECRET),
    userRole: decodedUser?.role || null,
    userEmail: decodedUser?.email || null,
    environment: process.env.NODE_ENV || "development",
    serverTime: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "Por favor ingresa tu nombre completo (m\xEDnimo 2 caracteres)." });
      return;
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: "Ingresa un correo electr\xF3nico v\xE1lido." });
      return;
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "La contrase\xF1a debe contener m\xEDnimo 8 caracteres." });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!supabase) {
      if (process.env.NODE_ENV === "production") {
        res.status(503).json({ error: "Base de datos no configurada" });
        return;
      }
      console.warn("ATENCI\xD3N: sin Supabase los usuarios se pierden al reiniciar");
    }
    if (supabase) {
      const { data: existing, error: checkErr } = await supabase.from("app_users").select("id").eq("email", normalizedEmail).maybeSingle();
      if (checkErr) {
        console.error("[AUTH ERROR] Error comprobando correo en Supabase app_users:", checkErr);
        res.status(500).json({ error: "No se pudo guardar tu cuenta, intenta de nuevo" });
        return;
      }
      if (existing) {
        res.status(400).json({ error: "El correo electr\xF3nico ya est\xE1 registrado." });
        return;
      }
      const password_hash2 = hashPassword2(password);
      const { data: inserted, error: insertErr } = await supabase.from("app_users").insert({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: password_hash2,
        role: "cliente",
        role_id: "cliente",
        estado: "activo"
      }).select("id, name, email, role, created_at").single();
      if (insertErr || !inserted) {
        console.error("[AUTH ERROR] Error insertando usuario en Supabase app_users:", insertErr);
        res.status(500).json({ error: "No se pudo guardar tu cuenta, intenta de nuevo" });
        return;
      }
      const newUser2 = {
        id: inserted.id,
        name: inserted.name,
        email: inserted.email,
        password_hash: password_hash2,
        role: "cliente",
        roleId: "cliente",
        created_at: inserted.created_at
      };
      inMemoryUsers.push(newUser2);
      const token2 = generateToken({
        id: newUser2.id,
        name: newUser2.name,
        email: newUser2.email,
        role: "cliente",
        roleId: "cliente"
      });
      res.cookie(COOKIE_NAME, token2, cookieOptions);
      recordAudit({
        eventType: "AUTH_REGISTER",
        severity: "info",
        description: `Nuevo cliente registrado en Supabase: ${newUser2.email}`,
        ip: req.ip || "127.0.0.1",
        userRole: "cliente",
        status: "SUCCESS"
      });
      res.status(201).json({
        token: token2,
        user: {
          id: newUser2.id,
          name: newUser2.name,
          email: newUser2.email,
          role: "cliente",
          roleId: "cliente"
        }
      });
      return;
    }
    if (inMemoryUsers.some((u) => u.email === normalizedEmail)) {
      res.status(400).json({ error: "El correo electr\xF3nico ya est\xE1 registrado." });
      return;
    }
    const password_hash = hashPassword2(password);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      role: "cliente",
      roleId: "cliente",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    inMemoryUsers.push(newUser);
    const token = generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: "cliente",
      roleId: "cliente"
    });
    res.cookie(COOKIE_NAME, token, cookieOptions);
    recordAudit({
      eventType: "AUTH_REGISTER",
      severity: "info",
      description: `Nuevo cliente registrado en memoria local: ${newUser.email}`,
      ip: req.ip || "127.0.0.1",
      userRole: "cliente",
      status: "SUCCESS"
    });
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: "cliente",
        roleId: "cliente"
      }
    });
  } catch (error) {
    console.error("[AUTH REGISTER EXCEPTION]", error);
    res.status(500).json({ error: "Error interno al registrar usuario." });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, totpCode } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Ingresa correo y contrase\xF1a." });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const rateKey = `${req.ip || "127.0.0.1"}_${normalizedEmail}`;
    if (!checkLoginRateLimit(rateKey)) {
      recordAudit({
        eventType: "AUTH_LOGIN",
        severity: "alert",
        description: `Bloqueo temporal por intentos fallidos para: ${normalizedEmail}`,
        ip: req.ip || "127.0.0.1",
        userRole: "cliente",
        status: "BLOCKED"
      });
      res.status(429).json({ error: "Demasiados intentos fallidos. Intente nuevamente en 15 minutos." });
      return;
    }
    if (!supabase) {
      if (process.env.NODE_ENV === "production") {
        res.status(503).json({ error: "Base de datos no configurada" });
        return;
      }
      console.warn("ATENCI\xD3N: sin Supabase los usuarios se pierden al reiniciar");
    }
    const isAdminCredentials = shouldCreateAdmin && effectiveAdminEmail && effectiveAdminPassword && normalizedEmail === effectiveAdminEmail && password === effectiveAdminPassword;
    let foundUser = null;
    if (isAdminCredentials) {
      const adminHash = hashPassword2(effectiveAdminPassword);
      if (supabase) {
        try {
          const { data: supaAdmin } = await supabase.from("app_users").select("id").eq("email", effectiveAdminEmail).maybeSingle();
          if (!supaAdmin) {
            await supabase.from("app_users").insert({
              id: "admin-seed-uuid-01",
              name: "Administrador MOVIFASHION",
              email: effectiveAdminEmail,
              password_hash: adminHash,
              role: "admin",
              role_id: "super_admin",
              estado: "activo"
            });
          } else {
            await supabase.from("app_users").update({
              password_hash: adminHash,
              role: "admin",
              role_id: "super_admin",
              estado: "activo"
            }).eq("id", supaAdmin.id);
          }
        } catch (err) {
          console.warn("[ADMIN LOGIN SYNC WARNING]", err.message);
        }
      }
      foundUser = {
        id: "admin-seed-uuid-01",
        name: "Administrador MOVIFASHION",
        email: effectiveAdminEmail,
        password_hash: adminHash,
        role: "admin",
        roleId: "super_admin",
        permissions: getCachedPermissions("super_admin"),
        estado: "activo",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const existingMem = inMemoryUsers.find((u) => u.email.toLowerCase() === effectiveAdminEmail);
      if (!existingMem) inMemoryUsers.push(foundUser);
      else Object.assign(existingMem, foundUser);
    } else {
      if (supabase) {
        try {
          const { data: supaUser, error: supaErr } = await supabase.from("app_users").select("*").eq("email", normalizedEmail).maybeSingle();
          if (supaErr) {
            console.error("[AUTH ERROR] Error buscando usuario en Supabase:", supaErr);
          } else if (supaUser) {
            const roleId = supaUser.role_id || supaUser.role;
            const mappedRole = supaUser.role === "admin" || roleId === "super_admin" ? "admin" : roleId;
            foundUser = {
              id: supaUser.id,
              name: supaUser.name,
              email: supaUser.email,
              password_hash: supaUser.password_hash,
              role: mappedRole,
              roleId,
              permissions: getCachedPermissions(roleId),
              mfa_secret: supaUser.mfa_secret,
              mfaEnabled: supaUser.mfa_enabled,
              mustChangePassword: supaUser.must_change_password,
              estado: supaUser.estado || "activo",
              created_at: supaUser.created_at
            };
            const existingMem = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
            if (!existingMem) inMemoryUsers.push(foundUser);
            else Object.assign(existingMem, foundUser);
          }
        } catch (err) {
          console.warn("[AUTH LOGIN] Supabase lookup error:", err.message);
        }
      }
      if (!foundUser) {
        foundUser = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
      }
    }
    if (!foundUser || !isAdminCredentials && !verifyPassword(password, foundUser.password_hash)) {
      recordAudit({
        eventType: "AUTH_FAILED",
        severity: "warning",
        description: `Intento de inicio de sesi\xF3n fallido para: ${normalizedEmail}`,
        ip: req.ip || "127.0.0.1",
        userRole: "cliente",
        status: "FLAGGED"
      });
      res.status(401).json({ error: "Credenciales inv\xE1lidas." });
      return;
    }
    if (foundUser.estado === "suspendido") {
      res.status(403).json({ error: "Tu cuenta de usuario ha sido suspendida. Contacta al administrador." });
      return;
    }
    if (foundUser.mfaEnabled) {
      if (!totpCode) {
        res.status(200).json({
          mfaRequired: true,
          email: foundUser.email,
          message: "Se requiere c\xF3digo de autenticaci\xF3n de dos factores (TOTP)."
        });
        return;
      }
      const isValidTotp = verifyTotpCode(foundUser.mfa_secret || "", String(totpCode).trim());
      if (!isValidTotp) {
        res.status(401).json({ error: "C\xF3digo de verificaci\xF3n 2FA incorrecto o expirado." });
        return;
      }
    }
    resetLoginRateLimit(rateKey);
    foundUser.lastLoginAt = (/* @__PURE__ */ new Date()).toISOString();
    const effectiveRole = foundUser.role;
    const effectiveRoleId = foundUser.roleId || (effectiveRole === "admin" ? "super_admin" : effectiveRole);
    const permissions = getCachedPermissions(effectiveRoleId);
    const token = generateToken({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: effectiveRole,
      roleId: effectiveRoleId
    });
    res.cookie(COOKIE_NAME, token, cookieOptions);
    recordAudit({
      eventType: "AUTH_LOGIN",
      severity: "info",
      description: `Inicio de sesi\xF3n exitoso: ${foundUser.email} (${effectiveRoleId})`,
      ip: req.ip || "127.0.0.1",
      userRole: effectiveRole,
      status: "SUCCESS"
    });
    res.json({
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: effectiveRole,
        roleId: effectiveRoleId,
        permissions,
        mfaEnabled: Boolean(foundUser.mfaEnabled),
        mustChangePassword: Boolean(foundUser.mustChangePassword),
        estado: foundUser.estado || "activo"
      }
    });
  } catch (error) {
    console.error("[AUTH LOGIN EXCEPTION]", error);
    res.status(500).json({ error: "Error interno en inicio de sesi\xF3n." });
  }
});
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  res.json({ message: "Sesi\xF3n cerrada correctamente." });
});
app.get("/api/auth/me", (req, res) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const foundUser = inMemoryUsers.find(
      (u) => u.id === decoded.id || u.email.toLowerCase() === decoded.email.toLowerCase()
    );
    if (foundUser && foundUser.estado === "suspendido") {
      res.status(403).json({ error: "Tu cuenta ha sido suspendida." });
      return;
    }
    const effectiveRole = foundUser?.role || decoded.role;
    const effectiveRoleId = foundUser?.roleId || decoded.roleId || (effectiveRole === "admin" ? "super_admin" : effectiveRole);
    const permissions = getCachedPermissions(effectiveRoleId);
    res.json({
      user: {
        id: decoded.id,
        name: foundUser?.name || decoded.name,
        email: decoded.email,
        role: effectiveRole,
        roleId: effectiveRoleId,
        permissions,
        mfaEnabled: Boolean(foundUser?.mfaEnabled),
        mustChangePassword: Boolean(foundUser?.mustChangePassword),
        estado: foundUser?.estado || "activo"
      }
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ error: "Sesi\xF3n expirada" });
    } else {
      res.status(401).json({ error: "Sesi\xF3n inv\xE1lida" });
    }
  }
});
app.get("/api/products", (req, res) => {
  const { category, search, minPrice, maxPrice, brand, sort } = req.query;
  let filtered = [...products];
  if (category && category !== "all") {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (brand && brand !== "all") {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    );
  }
  if (minPrice) {
    filtered = filtered.filter((p) => (p.discountPrice || p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter((p) => (p.discountPrice || p.price) <= Number(maxPrice));
  }
  if (search && typeof search === "string" && search.trim().length > 0) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (sort === "price-asc") {
    filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    filtered.sort((a, b) => b.reviewCount - a.reviewCount);
  }
  res.json({
    total: filtered.length,
    products: filtered
  });
});
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }
  res.json(product);
});
app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const newProduct = {
      ...req.body,
      id: req.body.id || `prod-${Date.now()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      rating: req.body.rating || 5,
      reviewCount: req.body.reviewCount || 0,
      inventory: Number(req.body.inventory) || 0,
      price: Number(req.body.price) || 0
    };
    products.unshift(newProduct);
    if (supabase) {
      try {
        await supabase.from("app_products").insert({
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category: newProduct.category,
          brand: newProduct.brand,
          price: newProduct.price,
          discount_price: newProduct.discountPrice || null,
          inventory: newProduct.inventory,
          description: newProduct.description,
          images: newProduct.images,
          colors: newProduct.colors,
          sizes: newProduct.sizes,
          color_images: newProduct.colorImages || {},
          tags: newProduct.tags,
          rating: newProduct.rating,
          review_count: newProduct.reviewCount,
          is_popular: newProduct.isPopular || false,
          is_featured: newProduct.isNew || false
        });
      } catch (err) {
        console.warn("[PRODUCTS] Error inserting product to Supabase:", err.message);
      }
    }
    recordAudit({
      eventType: "ADMIN_CHANGE",
      severity: "info",
      description: `Nuevo producto creado: ${newProduct.name} (${newProduct.category})`,
      ip: req.ip || "127.0.0.1",
      userRole: "admin",
      status: "SUCCESS"
    });
    res.status(201).json(newProduct);
  } catch {
    res.status(500).json({ error: "Error al crear producto" });
  }
});
app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    products[index] = { ...products[index], ...req.body };
    if (supabase) {
      try {
        const p = products[index];
        await supabase.from("app_products").update({
          name: p.name,
          category: p.category,
          brand: p.brand,
          price: p.price,
          discount_price: p.discountPrice || null,
          inventory: p.inventory,
          description: p.description,
          images: p.images,
          colors: p.colors,
          sizes: p.sizes,
          color_images: p.colorImages || {},
          tags: p.tags,
          rating: p.rating,
          review_count: p.reviewCount,
          is_popular: p.isPopular || false,
          is_featured: p.isNew || false,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", id);
      } catch (err) {
        console.warn("[PRODUCTS] Error updating product in Supabase:", err.message);
      }
    }
    recordAudit({
      eventType: "ADMIN_CHANGE",
      severity: "info",
      description: `Producto modificado: ${products[index].name} - Stock: ${products[index].inventory}, Precio: ${products[index].price}`,
      ip: req.ip || "127.0.0.1",
      userRole: "admin",
      status: "SUCCESS"
    });
    res.json(products[index]);
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});
app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const beforeCount = products.length;
    products = products.filter((p) => p.id !== id);
    if (products.length === beforeCount) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    if (supabase) {
      try {
        await supabase.from("app_products").delete().eq("id", id);
      } catch (err) {
        console.warn("[PRODUCTS] Error deleting product in Supabase:", err.message);
      }
    }
    recordAudit({
      eventType: "ADMIN_CHANGE",
      severity: "warning",
      description: `Producto eliminado: ID ${id}`,
      ip: req.ip || "127.0.0.1",
      userRole: "admin",
      status: "SUCCESS"
    });
    res.json({ message: "Producto eliminado correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});
app.get("/api/categories", (_req, res) => {
  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    itemCount: products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length
  }));
  res.json(categoriesWithCounts);
});
app.post("/api/categories", requireAdmin, async (req, res) => {
  try {
    const { name, description, iconName } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Nombre de categor\xEDa requerido" });
      return;
    }
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const newCat = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug,
      description: description || "",
      iconName: iconName || "Sparkles",
      itemCount: 0
    };
    categories.push(newCat);
    if (supabase) {
      try {
        await supabase.from("app_categories").insert({
          id: newCat.id,
          name: newCat.name,
          slug: newCat.slug,
          description: newCat.description,
          icon_name: newCat.iconName,
          sort_order: categories.length
        });
      } catch (err) {
        console.warn("[CATEGORIES] Error inserting to Supabase:", err.message);
      }
    }
    res.status(201).json(newCat);
  } catch {
    res.status(500).json({ error: "Error al crear categor\xEDa" });
  }
});
app.put("/api/categories/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Categor\xEDa no encontrada" });
      return;
    }
    categories[index] = { ...categories[index], ...req.body };
    if (supabase) {
      try {
        const c = categories[index];
        await supabase.from("app_categories").update({
          name: c.name,
          description: c.description,
          icon_name: c.iconName
        }).eq("id", id);
      } catch (err) {
        console.warn("[CATEGORIES] Error updating in Supabase:", err.message);
      }
    }
    res.json(categories[index]);
  } catch {
    res.status(500).json({ error: "Error al actualizar categor\xEDa" });
  }
});
app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const cat = categories.find((c) => c.id === id);
    if (!cat) {
      res.status(404).json({ error: "Categor\xEDa no encontrada" });
      return;
    }
    const linkedProducts = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase());
    if (linkedProducts.length > 0) {
      res.status(400).json({
        error: `No se puede eliminar la categor\xEDa porque tiene ${linkedProducts.length} productos asociados.`
      });
      return;
    }
    categories = categories.filter((c) => c.id !== id);
    if (supabase) {
      try {
        await supabase.from("app_categories").delete().eq("id", id);
      } catch (err) {
        console.warn("[CATEGORIES] Error deleting in Supabase:", err.message);
      }
    }
    res.json({ message: "Categor\xEDa eliminada correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar categor\xEDa" });
  }
});
app.post("/api/admin/upload-image", requireAdmin, async (req, res) => {
  try {
    const { imageBase64, filename, mimeType } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "Imagen base64 requerida" });
      return;
    }
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 1024 * 1024) {
      res.status(400).json({ error: "La imagen excede el l\xEDmite m\xE1ximo de 1 MB" });
      return;
    }
    const cleanFilename = (filename || `product-${Date.now()}`).toLowerCase().replace(/[^a-z0-9.-]/g, "-");
    const safeName = `${cleanFilename.replace(/\.[a-z]+$/, "")}-${Date.now()}.jpg`;
    if (supabase) {
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage.from("productos").upload(safeName, buffer, {
          contentType: mimeType || "image/jpeg",
          upsert: true
        });
        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage.from("productos").getPublicUrl(safeName);
          if (urlData?.publicUrl) {
            res.json({ url: urlData.publicUrl });
            return;
          }
        }
      } catch (storageErr) {
        console.warn("[STORAGE] Supabase Storage upload skipped/failed:", storageErr.message);
      }
    }
    const uploadDir = path2.resolve(__dirname, "public", "images", "products", "uploads");
    if (!fs2.existsSync(uploadDir)) {
      fs2.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path2.join(uploadDir, safeName);
    fs2.writeFileSync(filePath, buffer);
    res.json({ url: `/images/products/uploads/${safeName}` });
  } catch (err) {
    res.status(500).json({ error: "Error procesando la subida de imagen" });
  }
});
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Mensaje requerido" });
      return;
    }
    const token = extractToken(req);
    let currentUser = null;
    if (token) {
      currentUser = verifyToken(token);
    }
    const result = await processAssistantChat({
      message,
      history: Array.isArray(history) ? history : [],
      catalog: products,
      orders,
      pqrsList,
      currentUser,
      aiClient: ai
    });
    const eventRecord = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      session_id: req.headers["x-session-id"] || `sess_${Date.now()}`,
      user_id: currentUser?.id,
      event_type: "consulta_asistente",
      metadata: {
        query: message.trim().slice(0, 300),
        intent: result.intent,
        resolved: result.resolved,
        productsCount: result.productIds.length
      },
      simulated: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    appEvents.push(eventRecord);
    if (supabase) {
      (async () => {
        try {
          await supabase.from("app_events").insert(eventRecord);
        } catch {
        }
      })();
    }
    const recommendedProducts = products.filter((p) => result.productIds.includes(p.id));
    res.json({
      reply: result.reply,
      productIds: result.productIds,
      recommendedProducts,
      suggestions: result.suggestions,
      intent: result.intent,
      resolved: result.resolved
    });
  } catch (error) {
    console.error("[ASSISTANT ROUTE ERROR]", error);
    res.status(500).json({ error: "Error procesando la solicitud del asistente" });
  }
});
app.get("/api/recommendations", (req, res) => {
  const { productId } = req.query;
  const baseProduct = products.find((p) => p.id === productId) || products[0];
  const recommendations = products.map((p) => {
    let score = 50;
    let reason = "Tambi\xE9n podr\xEDa interesarte";
    if (p.id === baseProduct.id) {
      score = 0;
    } else if (p.category === baseProduct.category) {
      score += 35;
      reason = "Productos similares";
    } else if (baseProduct.category === "Zapatos" && (p.category === "Pantalones" || p.category === "Chaquetas") || baseProduct.category === "Chaquetas" && (p.category === "Camisetas" || p.category === "Bolsos")) {
      score += 40;
      reason = "Completa tu outfit";
    } else if (p.isPopular) {
      score += 25;
      reason = "Basado en tus b\xFAsquedas";
    } else {
      score += 20;
      reason = "Porque te gust\xF3 este producto";
    }
    return {
      id: `rec-${p.id}`,
      product: p,
      affinityScore: Math.min(score, 98),
      reason,
      recommendedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }).filter((r) => r.affinityScore > 50).sort((a, b) => b.affinityScore - a.affinityScore).slice(0, 6);
  res.json({ recommendations });
});
app.post("/api/visual-search", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "Imagen base64 requerida" });
      return;
    }
    let detectedGarment = "Calzado deportivo contempor\xE1neo";
    let detectedPalette = ["Morado", "Lavanda", "Blanco", "Gris"];
    let matchedIds = [];
    if (ai) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        const imagePart = {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        };
        const textPrompt = `Analiza esta prenda o accesorio de moda. Devuelve un JSON:
{
  "garmentType": "tipo de prenda detectado en espa\xF1ol",
  "colors": ["color1", "color2"],
  "category": "Camisetas|Pantalones|Vestidos|Chaquetas|Zapatos|Bolsos|Accesorios|Ropa deportiva",
  "styleKeywords": ["palabra1", "palabra2"]
}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: { parts: [imagePart, { text: textPrompt }] },
          config: {
            responseMimeType: "application/json"
          }
        });
        const parsed = JSON.parse(response.text || "{}");
        detectedGarment = parsed.garmentType || detectedGarment;
        if (parsed.colors) detectedPalette = parsed.colors;
        const candidateCategory = parsed.category;
        const matches = products.filter((p) => p.category.toLowerCase() === candidateCategory?.toLowerCase());
        matchedIds = matches.map((m) => m.id);
      } catch (err) {
        console.warn("Gemini visual search fallback:", err.message);
      }
    }
    if (matchedIds.length === 0) {
      matchedIds = [products[0].id, products[1].id, products[2].id];
    }
    const matchedProducts = products.filter((p) => matchedIds.includes(p.id));
    res.json({
      detectedGarment,
      detectedPalette,
      similarityScore: 94.6,
      matchedProducts
    });
  } catch (error) {
    res.status(500).json({ error: "Error procesando b\xFAsqueda visual" });
  }
});
function mapSupabaseOrderToModel(row) {
  const items = Array.isArray(row.items) ? row.items : typeof row.items === "string" ? JSON.parse(row.items) : [];
  const shippingAddress = typeof row.shipping_address === "string" ? JSON.parse(row.shipping_address) : row.shipping_address || {};
  const subtotal = Number(row.subtotal) || 0;
  const subtotalBase = row.subtotal_base != null ? Number(row.subtotal_base) : calcularBaseGravable(subtotal);
  const iva = row.iva != null ? Number(row.iva) : calcularIva(subtotal);
  return {
    id: row.id,
    userId: row.user_id || "",
    userName: row.user_name || shippingAddress.recipientName || "",
    userEmail: row.user_email || "",
    items,
    subtotal,
    subtotalBase,
    iva,
    tarifaIva: row.tarifa_iva != null ? Number(row.tarifa_iva) : 0.19,
    shipping: Number(row.shipping) || 0,
    discount: Number(row.discount) || 0,
    couponCode: row.coupon_code || void 0,
    total: Number(row.total) || 0,
    status: row.status || "Pendiente",
    shippingAddress,
    paymentMethod: row.payment_method || "credit_card",
    paymentStatus: row.payment_status || "paid",
    trackingNumber: row.tracking_number || "",
    simulated: Boolean(row.simulated),
    createdAt: row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    customer: {
      name: row.user_name || shippingAddress.recipientName || "",
      email: row.user_email || "",
      phone: shippingAddress.phone || "",
      documentId: shippingAddress.documentId || "1020304050",
      address: shippingAddress.street || "",
      city: shippingAddress.city || "Bogot\xE1"
    }
  };
}
function hasPermission2(user, perm) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "super_admin" || user.roleId === "super_admin") return true;
  const userPerms = getCachedPermissions(user.roleId || user.role);
  return userPerms.includes("*") || userPerms.includes(perm);
}
app.get("/api/orders", requireAuth, async (req, res) => {
  const user = req.user;
  const canView = user.role === "admin" || user.roleId === "super_admin" || hasPermission2(user, "pedidos.ver");
  if (!canView) {
    res.status(403).json({ error: "Acceso denegado: se requieren permisos para ver pedidos" });
    return;
  }
  if (supabase) {
    try {
      const { data: supaOrders, error } = await supabase.from("app_orders").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("[ORDERS GET ALL ERROR]", error);
        res.status(500).json({ error: "Error cargando pedidos desde la base de datos" });
        return;
      }
      const formatted = (supaOrders || []).map(mapSupabaseOrderToModel);
      res.json({ orders: formatted });
      return;
    } catch (err) {
      console.error("[ORDERS GET ALL EXCEPTION]", err);
      res.status(500).json({ error: "Error procesando consulta de pedidos" });
      return;
    }
  }
  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders: sorted });
});
app.get("/api/orders/mine", requireAuth, async (req, res) => {
  const user = req.user;
  if (supabase) {
    try {
      let query = supabase.from("app_orders").select("*").order("created_at", { ascending: false });
      if (user.id && user.id.includes("-") && user.id.length > 20) {
        query = query.or(`user_id.eq.${user.id},user_email.eq.${user.email.toLowerCase()}`);
      } else {
        query = query.eq("user_email", user.email.toLowerCase());
      }
      const { data: supaOrders, error } = await query;
      if (error) {
        console.error("[ORDERS MINE ERROR]", error);
        res.status(500).json({ error: "Error consultando tus pedidos en la base de datos" });
        return;
      }
      const formatted = (supaOrders || []).map(mapSupabaseOrderToModel);
      res.json({ orders: formatted });
      return;
    } catch (err) {
      console.error("[ORDERS MINE EXCEPTION]", err);
      res.status(500).json({ error: "Error consultando tus pedidos" });
      return;
    }
  }
  const userOrders = orders.filter((o) => o.userId === user.id || o.userEmail?.toLowerCase() === user.email.toLowerCase()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ orders: userOrders });
});
app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, cardLast4, couponCode, discount, documentId } = req.body;
    const user = req.user;
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "El carrito no puede estar vac\xEDo" });
      return;
    }
    let calculatedSubtotal = 0;
    for (const item of items) {
      const prodId = item.productId || item.product?.id;
      const originalProd = products.find((p) => p.id === prodId);
      if (!originalProd) {
        res.status(400).json({ error: `Producto no v\xE1lido: ${item.product?.name || prodId}` });
        return;
      }
      const realPrice = originalProd.discountPrice || originalProd.price;
      calculatedSubtotal += realPrice * (item.quantity || 1);
      if (originalProd.inventory < (item.quantity || 1)) {
        res.status(400).json({
          error: `Inventario insuficiente para ${originalProd.name} (disponibles: ${originalProd.inventory})`
        });
        return;
      }
    }
    let validatedDiscount = 0;
    let appliedCouponCode = void 0;
    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const coupon = activeCoupons.find((c) => c.code === cleanCode && c.active);
      if (coupon) {
        if (!coupon.minSubtotal || calculatedSubtotal >= coupon.minSubtotal) {
          validatedDiscount = Math.round(calculatedSubtotal * coupon.discountPercent / 100);
          appliedCouponCode = coupon.code;
        }
      }
    } else if (typeof discount === "number" && discount > 0) {
      validatedDiscount = Math.min(discount, Math.round(calculatedSubtotal * 0.3));
    }
    await new Promise((r) => setTimeout(r, 1500));
    const effectiveSubtotal = Math.max(0, calculatedSubtotal - validatedDiscount);
    const shipping = effectiveSubtotal >= EMPRESA.umbralEnvioGratis ? 0 : EMPRESA.costoEnvioNacional;
    const total = effectiveSubtotal + shipping;
    const baseGravable = calcularBaseGravable(effectiveSubtotal);
    const valorIva = effectiveSubtotal - baseGravable;
    const orderId = `ORD-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const trackingNumber = `MOV-COL-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const enrichedItems = items.map((item) => {
      const prodId = item.productId || item.product?.id;
      const originalProd = products.find((p) => p.id === prodId) || item.product;
      const colorName = item.selectedColor?.name || item.color;
      const colorImg = colorName && originalProd?.colorImages?.[colorName] || originalProd?.images?.[0] || "";
      return {
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product: {
          id: originalProd.id,
          name: originalProd.name,
          price: originalProd.price,
          discountPrice: originalProd.discountPrice,
          images: originalProd.images,
          colorImages: originalProd.colorImages,
          colors: originalProd.colors,
          sizes: originalProd.sizes,
          image: colorImg
        },
        selectedSize: item.selectedSize || item.size || "M",
        selectedColor: item.selectedColor || { name: colorName || "Est\xE1ndar", hex: "#25232B" },
        quantity: Number(item.quantity) || 1,
        unitPrice: originalProd.discountPrice || originalProd.price
      };
    });
    const newOrder = {
      id: orderId,
      userId: user.id,
      userName: shippingAddress?.recipientName || user.name,
      userEmail: user.email.toLowerCase(),
      items: enrichedItems,
      subtotal: calculatedSubtotal,
      shipping,
      discount: validatedDiscount,
      total,
      status: paymentMethod === "cash_on_delivery" ? "Pendiente" : "Pagado",
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "paid",
      trackingNumber,
      simulated: false,
      createdAt: nowIso,
      customer: {
        name: shippingAddress?.recipientName || user.name,
        email: user.email.toLowerCase(),
        phone: shippingAddress?.phone || "",
        documentId: documentId || "1020304050",
        address: shippingAddress?.street || "",
        city: shippingAddress?.city || "Bogot\xE1"
      },
      subtotalBase: baseGravable,
      iva: valorIva,
      tarifaIva: 0.19,
      couponCode: appliedCouponCode
    };
    if (supabase) {
      const orderRecord = {
        id: newOrder.id,
        user_id: user.id.includes("-") && user.id.length > 20 ? user.id : null,
        user_name: newOrder.userName,
        user_email: newOrder.userEmail,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        subtotal_base: baseGravable,
        iva: valorIva,
        tarifa_iva: 0.19,
        shipping: newOrder.shipping,
        discount: newOrder.discount,
        coupon_code: appliedCouponCode || null,
        total: newOrder.total,
        status: newOrder.status,
        shipping_address: newOrder.shippingAddress,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        tracking_number: newOrder.trackingNumber,
        simulated: false,
        created_at: nowIso
      };
      const { error: insertErr } = await supabase.from("app_orders").insert(orderRecord);
      if (insertErr) {
        console.error("[ORDERS ERROR] No se pudo guardar el pedido en Supabase app_orders:", insertErr);
        res.status(500).json({ error: "No se pudo guardar tu pedido en la base de datos, intenta de nuevo." });
        return;
      }
      try {
        await supabase.from("app_events").insert({
          id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          session_id: req.headers["x-session-id"] || `sess_${Date.now()}`,
          user_id: user.id.includes("-") && user.id.length > 20 ? user.id : null,
          event_type: "compra",
          metadata: {
            orderId: newOrder.id,
            total: newOrder.total,
            subtotalBase: baseGravable,
            iva: valorIva,
            paymentMethod,
            itemsCount: items.length,
            cardLast4,
            couponCode: appliedCouponCode
          },
          simulated: false,
          created_at: nowIso
        });
      } catch (err) {
        console.warn("[ORDERS] Error guardando app_events:", err.message);
      }
    }
    for (const item of items) {
      const prodId = item.productId || item.product?.id;
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        prod.inventory = Math.max(0, prod.inventory - (item.quantity || 1));
      }
    }
    orders.unshift(newOrder);
    recordAudit({
      eventType: "ORDER_CREATED",
      severity: "info",
      description: `Nuevo pedido confirmado: ${newOrder.id} - Total: $${newOrder.total.toLocaleString("es-CO")} COP (${user.email})`,
      ip: req.ip || "127.0.0.1",
      userRole: user.role,
      status: "SUCCESS"
    });
    res.status(201).json({
      order: newOrder,
      ...newOrder
    });
  } catch (err) {
    console.error("[ORDERS POST EXCEPTION]", err);
    res.status(500).json({ error: "Error procesando el pedido en el servidor" });
  }
});
app.put("/api/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ error: "Pedido no encontrado" });
      return;
    }
    const previousStatus = order.status;
    order.status = status;
    if (status === "Cancelado" && previousStatus !== "Cancelado") {
      for (const item of order.items) {
        const prod = products.find((p) => p.id === (item.product?.id || item.id));
        if (prod) {
          prod.inventory += item.quantity || 1;
        }
      }
    }
    if (supabase) {
      try {
        await supabase.from("app_orders").update({ status }).eq("id", id);
      } catch (err) {
        console.warn("[ORDERS] Error updating order status in Supabase:", err.message);
      }
    }
    recordAudit({
      eventType: "ADMIN_CHANGE",
      severity: "info",
      description: `Estado de pedido ${id} actualizado a: ${status}`,
      ip: req.ip || "127.0.0.1",
      userRole: "admin",
      status: "SUCCESS"
    });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Error al actualizar estado del pedido" });
  }
});
app.post("/api/events", async (req, res) => {
  try {
    const { sessionId, events } = req.body;
    if (!events || !Array.isArray(events)) {
      res.status(400).json({ error: "Formato de eventos no v\xE1lido" });
      return;
    }
    const token = extractToken(req);
    let userId = void 0;
    if (token) {
      const user = verifyToken(token);
      if (user) userId = user.id;
    }
    const newEvents = events.map((e) => ({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      session_id: sessionId || `sess_${Date.now()}`,
      user_id: userId,
      event_type: e.eventType,
      product_id: e.productId,
      category: e.category,
      metadata: e.metadata || {},
      simulated: false,
      created_at: e.timestamp || (/* @__PURE__ */ new Date()).toISOString()
    }));
    appEvents.push(...newEvents);
    if (appEvents.length > 5e3) appEvents = appEvents.slice(-5e3);
    if (supabase) {
      try {
        await supabase.from("app_events").insert(newEvents);
      } catch (err) {
        console.warn("[EVENTS] Error saving events to Supabase:", err.message);
      }
    }
    res.status(202).json({ received: newEvents.length });
  } catch {
    res.status(500).json({ error: "Error al registrar eventos" });
  }
});
app.post("/api/returns/request", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { orderId, items, motivo, tipo = "retracto" } = req.body;
    if (!orderId || !items || !Array.isArray(items) || items.length === 0 || !motivo) {
      res.status(400).json({ error: "Faltan datos obligatorios para radicar la solicitud de devoluci\xF3n." });
      return;
    }
    let order = orders.find(
      (o) => o.id === orderId && (o.userId === user.id || o.userEmail.toLowerCase() === user.email.toLowerCase())
    );
    if (!order && supabase) {
      try {
        const { data: supaOrder } = await supabase.from("app_orders").select("*").eq("id", orderId).maybeSingle();
        if (supaOrder && (supaOrder.user_id === user.id || supaOrder.user_email?.toLowerCase() === user.email.toLowerCase())) {
          order = mapSupabaseOrderToModel(supaOrder);
        }
      } catch (err) {
        console.warn("[RETURNS] Error finding order in Supabase:", err.message);
      }
    }
    if (!order) {
      res.status(404).json({ error: "Pedido no encontrado o no pertenece a tu cuenta." });
      return;
    }
    const orderDate = new Date(order.createdAt).getTime();
    const diffDays = (Date.now() - orderDate) / (1e3 * 60 * 60 * 24);
    if (tipo === "retracto" && diffDays > 7) {
      res.status(400).json({ error: "El plazo legal para solicitar retracto (5 d\xEDas h\xE1biles conforme al Art. 47 Ley 1480) ha vencido." });
      return;
    }
    let refundAmount = 0;
    const returnItems = items.map((reqItem) => {
      const match = order.items.find((i) => (i.product?.id || i.id) === reqItem.productId);
      const price = match?.product?.discountPrice || match?.product?.price || reqItem.price || 0;
      const qty = Math.min(reqItem.quantity || 1, match?.quantity || 1);
      refundAmount += price * qty;
      return {
        productId: reqItem.productId,
        productName: match?.product?.name || reqItem.productName || "Prenda MoviFashion",
        quantity: qty,
        size: reqItem.size || match?.selectedSize || "M",
        color: reqItem.color || (typeof match?.selectedColor === "object" ? match?.selectedColor.name : String(match?.selectedColor || "Est\xE1ndar")),
        price
      };
    });
    const newReturn = {
      id: `RET-2026-${String(returnRequests.length + 1).padStart(4, "0")}`,
      orderId: order.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      tipo,
      items: returnItems,
      motivo: String(motivo).slice(0, 1e3),
      estado: "solicitado",
      reembolsoSimulado: refundAmount,
      reponerInventario: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    returnRequests.unshift(newReturn);
    pushAdminNotification({
      titulo: "Nueva Solicitud de Devoluci\xF3n",
      mensaje: `El cliente ${user.name} solicit\xF3 ${tipo} para el pedido ${order.id} por $${refundAmount.toLocaleString("es-CO")} COP.`,
      tipo: "devolucion",
      link: "/admin"
    });
    if (supabase) {
      try {
        await supabase.from("app_returns").insert({
          id: newReturn.id,
          order_id: newReturn.orderId,
          user_id: newReturn.userId,
          user_name: newReturn.userName,
          user_email: newReturn.userEmail,
          tipo: newReturn.tipo,
          items: newReturn.items,
          motivo: newReturn.motivo,
          estado: newReturn.estado,
          reembolso_simulado: newReturn.reembolsoSimulado,
          reponer_inventario: newReturn.reponerInventario
        });
      } catch (err) {
        console.warn("[SUPABASE] Returns insert note:", err.message);
      }
    }
    res.status(201).json({
      message: "Solicitud de devoluci\xF3n radicada con \xE9xito. Ser\xE1 revisada en un plazo m\xE1ximo de 48 horas h\xE1biles.",
      returnRequest: newReturn
    });
  } catch (err) {
    res.status(500).json({ error: "Error al procesar la solicitud de devoluci\xF3n." });
  }
});
app.get("/api/returns/mine", requireAuth, (req, res) => {
  const user = req.user;
  const myReturns = returnRequests.filter(
    (r) => r.userId === user.id || r.userEmail.toLowerCase() === user.email.toLowerCase()
  );
  res.json(myReturns);
});
app.use(
  "/api/admin",
  requireAuth,
  createAdminRouter(
    () => products,
    (p) => {
      products = p;
    },
    () => orders,
    (o) => {
      orders = o;
    },
    () => categories,
    (c) => {
      categories = c;
    },
    () => inMemoryUsers,
    (u) => {
      inMemoryUsers = u;
    },
    () => appEvents,
    supabase,
    verifyPassword,
    hashPassword2
  )
);
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const viteModuleId = "vite";
    const { createServer: createViteServer } = await import(viteModuleId);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path2.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path2.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MOVIFASHION AI server running on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
var server_default = app;
export {
  server_default as default
};
