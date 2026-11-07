import React from 'react';
import { MessageCircle } from 'lucide-react';
import { EMPRESA } from '../config/empresa.ts';

export const WhatsAppButton: React.FC = () => {
  const cleanPhone = EMPRESA.whatsapp.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(EMPRESA.whatsappMensajePredeterminado);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a MoviFashion por WhatsApp"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span className="hidden sm:inline font-semibold text-xs tracking-wide">
        ¿Te ayudamos?
      </span>
    </a>
  );
};
