import React, { useEffect } from 'react';
import { EMPRESA } from '../config/empresa.ts';
import { Product } from '../types/index.ts';
import { calcularBaseGravable, calcularIva } from '../utils/impuestos.ts';

export interface SeoProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  product?: Product;
  breadcrumbs?: { name: string; path: string }[];
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description = EMPRESA.descripcionCorta,
  canonicalPath = window.location.pathname,
  image = `${EMPRESA.sitioWeb}/images/products/chaqueta-bomber-tecnica-negro.jpg`,
  type = 'website',
  product,
  breadcrumbs,
}) => {
  const fullTitle = title
    ? `${title} — ${EMPRESA.nombreComercial}`
    : `${EMPRESA.nombreComercial} — ${EMPRESA.lema}`;

  const canonicalUrl = `${EMPRESA.sitioWeb}${canonicalPath}`;

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMeta = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      let meta = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(nameAttr, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('name', 'description', description);

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. OpenGraph
    setMeta('property', 'og:site_name', EMPRESA.nombreComercial);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:locale', 'es_CO');

    // 5. Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    // 6. JSON-LD Structured Data
    const existingScript = document.getElementById('seo-json-ld');
    if (existingScript) existingScript.remove();

    const schemas: any[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: EMPRESA.nombreComercial,
        legalName: EMPRESA.razonSocial,
        url: EMPRESA.sitioWeb,
        logo: `${EMPRESA.sitioWeb}/pwa-192x192.svg`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: EMPRESA.telefono,
          contactType: 'customer service',
          areaServed: 'CO',
          availableLanguage: ['Spanish'],
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: EMPRESA.direccion,
          addressLocality: EMPRESA.ciudad,
          addressRegion: EMPRESA.departamento,
          addressCountry: 'CO',
        },
        sameAs: [
          EMPRESA.redesSociales.instagram,
          EMPRESA.redesSociales.facebook,
          EMPRESA.redesSociales.tiktok,
        ],
      },
    ];

    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: `${EMPRESA.sitioWeb}${crumb.path}`,
        })),
      });
    }

    if (product) {
      const base = calcularBaseGravable(product.price);
      const iva = calcularIva(product.price);
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images.map(img => (img.startsWith('http') ? img : `${EMPRESA.sitioWeb}${img}`)),
        sku: product.id,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'COP',
          price: product.price,
          valueAddedTaxIncluded: true,
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: product.price,
            priceCurrency: 'COP',
            valueAddedTaxIncluded: true,
          },
          availability: ((product.inventory ?? (product as any).stock ?? 0) > 0)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: EMPRESA.nombreComercial,
          },
        },
      });
    }

    const script = document.createElement('script');
    script.id = 'seo-json-ld';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemas);
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById('seo-json-ld');
      if (s) s.remove();
    };
  }, [fullTitle, description, canonicalUrl, image, type, product, breadcrumbs]);

  return null;
};
