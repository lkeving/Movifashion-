import React, { useState } from 'react';
import { X, UploadCloud, Camera, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { SNEAKERS_IMAGE, JACKET_IMAGE, BAG_IMAGE } from '../data/mockProducts';
import { SafeProductImage } from './SafeProductImage';
import { authFetch } from '../utils/api';

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const VisualSearchModal: React.FC<VisualSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    detectedGarment: string;
    detectedPalette: string[];
    similarityScore: number;
    matchedProducts: Product[];
  } | null>(null);

  const sampleImages = [
    { name: 'Tenis Deportivos', url: SNEAKERS_IMAGE },
    { name: 'Blazer Sartorial', url: JACKET_IMAGE },
    { name: 'Bolso Cuero', url: BAG_IMAGE },
  ];

  const handleProcessImage = async (imgUrl: string) => {
    setSelectedImage(imgUrl);
    setIsProcessing(true);
    setResults(null);

    try {
      const res = await authFetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imgUrl }),
      });

      if (!res.ok) throw new Error('Error al procesar la imagen');

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleProcessImage(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E9E2FA] text-[#7656D6] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#30234F]">Búsqueda Visual Inteligente</h2>
              <p className="text-[11px] text-gray-500">Carga una foto de referencia para encontrar prendas similares</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-[#E9E2FA] rounded-2xl p-6 text-center hover:border-[#7656D6] transition-colors bg-[#F5F5F8]/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-10 h-10 text-[#7656D6] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#30234F]">Arrastra tu fotografía o haz clic para subir</p>
            <p className="text-[11px] text-gray-400 mt-1">Soporta PNG, JPG y WebP hasta 10MB</p>
          </div>

          {/* Quick Sample Photos */}
          <div>
            <span className="text-xs font-semibold text-gray-600 mb-2 block">O prueba con una prenda de muestra:</span>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleProcessImage(sample.url)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-[#7656D6] bg-white text-left transition-all"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[11px] font-semibold text-gray-700 truncate">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#7656D6] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#30234F]">Analizando patrones textiles, corte y paleta cromática...</p>
              <p className="text-[11px] text-gray-400">Consultando catálogo con visión artificial</p>
            </div>
          )}

          {/* Results Area */}
          {results && !isProcessing && (
            <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-[#E9E2FA]/30 border border-[#E9E2FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">Prenda detectada:</span>
                  <span className="font-bold text-[#30234F] text-sm">{results.detectedGarment}</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] text-gray-500">Colores:</span>
                    {results.detectedPalette.map((col, idx) => (
                      <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded-sm font-medium text-gray-700 border border-gray-100">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-[#7656D6]" />
                  <div>
                    <span className="text-[10px] text-gray-500 block">Afinidad visual:</span>
                    <span className="text-xs font-extrabold text-[#7656D6] tabular-nums">{results.similarityScore}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  Prendas Similares en el Catálogo ({results.matchedProducts.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.matchedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose();
                      }}
                      className="flex gap-3 p-3 rounded-2xl bg-[#F5F5F8] border border-gray-100 hover:border-[#7656D6] cursor-pointer transition-all"
                    >
                      <SafeProductImage
                        src={prod.images[0]}
                        fallbackSrc="/images/hero_fashion_editorial.jpg"
                        alt={prod.name}
                        productName={prod.name}
                        className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-[#7656D6]">{prod.brand}</span>
                        <h5 className="text-xs font-bold text-[#25232B] truncate">{prod.name}</h5>
                        <p className="text-xs font-extrabold text-[#30234F] mt-1 tabular-nums">
                          ${(prod.discountPrice || prod.price).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
