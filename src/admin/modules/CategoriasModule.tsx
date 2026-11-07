// Module: Categorías del Catálogo
// Category management, drag/reorder, icon, safe delete with product reassignment

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { ProductCategory } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';

export const CategoriasModule: React.FC<{ onCategoriesChanged?: () => void }> = ({ onCategoriesChanged }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [iconInput, setIconInput] = useState('Sparkles');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/admin/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setNameInput('');
    setDescInput('');
    setIconInput('Sparkles');
    setEditingCategory(null);
    setIsCreating(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setDescInput(cat.description || '');
    setIconInput(cat.iconName || 'Sparkles');
    setIsCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput) return;
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await authFetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput,
            description: descInput,
            iconName: iconInput,
          }),
        });
      } else {
        await authFetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput,
            description: descInput,
            iconName: iconInput,
          }),
        });
      }

      setIsCreating(false);
      setEditingCategory(null);
      await fetchCategories();
      onCategoriesChanged?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: any) => {
    if (cat.itemCount > 0) {
      const reassign = prompt(
        `Esta categoría tiene ${cat.itemCount} producto(s). Escribe el nombre exacto de la categoría a la que deseas reasignarlos:`
      );
      if (!reassign) return;
      await authFetch(`/api/admin/categories/${cat.id}?reassignTo=${encodeURIComponent(reassign)}`, {
        method: 'DELETE',
      });
    } else {
      if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
      await authFetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
    }
    await fetchCategories();
    onCategoriesChanged?.();
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Categorías Comerciales Activas ({categories.length})
        </h3>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-[#7656D6] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {cat.itemCount} prendas
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">{cat.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {cat.description || 'Categoría del catálogo nacional.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-50 mt-4">
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative text-xs">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingCategory(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <p className="text-slate-500 mb-4">
              Las categorías definen los filtros del catálogo y el menú de navegación.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Ej: Calzado Formal"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#7656D6] text-white font-bold rounded-xl hover:bg-[#6042BE] shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
