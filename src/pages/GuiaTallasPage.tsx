import React, { useState } from 'react';
import { Seo } from '../components/Seo.tsx';
import { EMPRESA } from '../config/empresa.ts';
import { Ruler, Sparkles, Check, HelpCircle } from 'lucide-react';

export const GuiaTallasPage: React.FC = () => {
  const [tab, setTab] = useState<'superior' | 'inferior' | 'calzado'>('superior');

  return (
    <div className="min-h-screen bg-[#F5F5F8] py-10 px-4 sm:px-6 lg:px-8">
      <Seo
        title="Guía de Tallas y Medidas Corporales"
        description={`Guía completa de medidas y equivalencias de tallas para camisetas, pantalones, chaquetas y calzado en ${EMPRESA.nombreComercial}.`}
        breadcrumbs={[
          { name: 'Inicio', path: '/' },
          { name: 'Guía de Tallas', path: '/guia-de-tallas' },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7656D6] bg-purple-50 px-3 py-1 rounded-full">
            Encuentra tu Ajuste Ideal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#30234F] tracking-tight">
            Guía de Tallas y Medidas
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Medidas precisas en centímetros para que elijas con total seguridad. Nuestras siluetas contemporáneas combinan ergonomía y caída limpia.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setTab('superior')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === 'superior' ? 'bg-white text-[#30234F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prendas Superiores (Camisetas & Hoodies)
            </button>
            <button
              onClick={() => setTab('inferior')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === 'inferior' ? 'bg-white text-[#30234F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prendas Inferiores (Pantalones & Cargos)
            </button>
            <button
              onClick={() => setTab('calzado')}
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === 'calzado' ? 'bg-white text-[#30234F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calzado y Tenis
            </button>
          </div>
        </div>

        {/* Content Tables */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6">
          
          {tab === 'superior' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#30234F] flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#7656D6]" />
                Camisetas, Camisas, Blazers y Chaquetas (cm)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <th className="py-3 px-4 font-bold">Talla</th>
                      <th className="py-3 px-4 font-bold">Contorno de Pecho (cm)</th>
                      <th className="py-3 px-4 font-bold">Contorno de Cintura (cm)</th>
                      <th className="py-3 px-4 font-bold">Largo Total (cm)</th>
                      <th className="py-3 px-4 font-bold">Ajuste Recomendado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">S (Pequeña)</td>
                      <td className="py-3 px-4">90 – 96</td>
                      <td className="py-3 px-4">76 – 82</td>
                      <td className="py-3 px-4">69</td>
                      <td className="py-3 px-4 font-sans text-slate-700">Estatura 1.65 – 1.73 m</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">M (Mediana)</td>
                      <td className="py-3 px-4">97 – 103</td>
                      <td className="py-3 px-4">83 – 89</td>
                      <td className="py-3 px-4">72</td>
                      <td className="py-3 px-4 font-sans text-slate-700">Estatura 1.74 – 1.80 m</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">L (Grande)</td>
                      <td className="py-3 px-4">104 – 110</td>
                      <td className="py-3 px-4">90 – 96</td>
                      <td className="py-3 px-4">75</td>
                      <td className="py-3 px-4 font-sans text-slate-700">Estatura 1.80 – 1.86 m</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">XL (Extragrande)</td>
                      <td className="py-3 px-4">111 – 118</td>
                      <td className="py-3 px-4">97 – 104</td>
                      <td className="py-3 px-4">77</td>
                      <td className="py-3 px-4 font-sans text-slate-700">Estatura 1.85 m +</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Las prendas marcadas con fit "Oversize" tienen 4 cm adicionales de holgura en pecho para caída contemporánea.
              </p>
            </div>
          )}

          {tab === 'inferior' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#30234F] flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#7656D6]" />
                Pantalones, Cargos y Jeans (cm)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <th className="py-3 px-4 font-bold">Talla Col.</th>
                      <th className="py-3 px-4 font-bold">Equivalente</th>
                      <th className="py-3 px-4 font-bold">Cintura (cm)</th>
                      <th className="py-3 px-4 font-bold">Cadera (cm)</th>
                      <th className="py-3 px-4 font-bold">Largo Inseam (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">28 - 30</td>
                      <td className="py-3 px-4 font-sans">S</td>
                      <td className="py-3 px-4">75 – 80</td>
                      <td className="py-3 px-4">90 – 95</td>
                      <td className="py-3 px-4">102</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">32</td>
                      <td className="py-3 px-4 font-sans">M</td>
                      <td className="py-3 px-4">81 – 86</td>
                      <td className="py-3 px-4">96 – 101</td>
                      <td className="py-3 px-4">104</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">34</td>
                      <td className="py-3 px-4 font-sans">L</td>
                      <td className="py-3 px-4">87 – 92</td>
                      <td className="py-3 px-4">102 – 107</td>
                      <td className="py-3 px-4">106</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">36</td>
                      <td className="py-3 px-4 font-sans">XL</td>
                      <td className="py-3 px-4">93 – 98</td>
                      <td className="py-3 px-4">108 – 113</td>
                      <td className="py-3 px-4">108</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'calzado' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-[#30234F] flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#7656D6]" />
                Calzado, Tenis y Zapatos
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <th className="py-3 px-4 font-bold">Talla Colombia</th>
                      <th className="py-3 px-4 font-bold">Talla US (Hombre / Mujer)</th>
                      <th className="py-3 px-4 font-bold">Talla EUR</th>
                      <th className="py-3 px-4 font-bold">Longitud del Pie (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">38</td>
                      <td className="py-3 px-4">6.5 US</td>
                      <td className="py-3 px-4">39</td>
                      <td className="py-3 px-4">24.5 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">39</td>
                      <td className="py-3 px-4">7.5 US</td>
                      <td className="py-3 px-4">40</td>
                      <td className="py-3 px-4">25.5 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">40</td>
                      <td className="py-3 px-4">8.5 US</td>
                      <td className="py-3 px-4">41</td>
                      <td className="py-3 px-4">26.5 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">41</td>
                      <td className="py-3 px-4">9.5 US</td>
                      <td className="py-3 px-4">42</td>
                      <td className="py-3 px-4">27.5 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold font-sans text-slate-800">42</td>
                      <td className="py-3 px-4">10.5 US</td>
                      <td className="py-3 px-4">43</td>
                      <td className="py-3 px-4">28.5 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tips for measuring */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#30234F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7656D6]" />
              Consejos del Asistente para Medirse
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
              <li><strong>Pecho:</strong> Mide alrededor de la parte más prominente del torso, manteniendo la cinta nivelada horizontalmente.</li>
              <li><strong>Cintura:</strong> Mide a la altura de tu ombligo en posición natural y relajada, sin apretar la cinta.</li>
              <li><strong>¿Entre dos tallas?</strong> Si buscas un estilo relajado o estructurado, te recomendamos la talla superior; si prefieres fit entallado, la talla inferior.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
