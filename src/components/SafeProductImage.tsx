import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

interface SafeProductImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  productName: string;
  className?: string;
}

export const SafeProductImage: React.FC<SafeProductImageProps> = ({
  src,
  fallbackSrc,
  alt,
  productName,
  className = '',
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setTriedFallback(false);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!triedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
      setTriedFallback(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div
        className={`w-full h-full bg-[#EDEDF0] text-gray-500 flex flex-col items-center justify-center p-3 text-center select-none ${className}`}
        role="img"
        aria-label={alt || productName}
      >
        <ShoppingBag className="w-6 h-6 text-gray-400 mb-1" />
        <span className="text-[11px] font-medium text-gray-600 line-clamp-2 px-1">
          {productName}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};
