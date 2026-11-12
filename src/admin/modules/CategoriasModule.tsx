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
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [reassignToInput, setReassignToInput] = useState('');
  const [actionError, setActionError] = useState('');

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

    setActionError('');
    try {
      const res = editingCategory
        ? await authFetch(`/api/admin/categories/${editingCategory.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: nameInput,
              description: descInput,
              iconName: iconInput,
            }),
          })
        : await authFetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: nameInput,
              description: descInput,
              iconName: iconInput,
            }),
          });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'Error al guardar la categoría.');
        return;
      }

      setIsCreating(false);
      setEditingCategory(null);
      await fetchCategories();
      onCategoriesChanged?.();
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (cat: any) => {
    setActionError('');
    const otherCats = categories.filter(c => c.id !== cat.id);
    setReassignToInput(otherCats[0]?.name || '');
    setCategoryToDelete(cat);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setActionError('');
    setIsSubmitting(true);
    try {
      const url = categoryToDelete.itemCount > 0 && reassignToInput
        ? `/api/admin/categories/${categoryToDelete.id}?reassignTo=${encodeURIComponent(reassignToInput)}`
        : `/api/admin/categories/${categoryToDelete.id}`;
      const res = await authFetch(url, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo eliminar la categoría.');
        return;
      }
      setCategoryToDelete(null);
      await fetchCategories();
      onCategoriesChanged?.();
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al eliminar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {actionError && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="font-bold">Cerrar</button>
        </div>
      )}
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
                onClick={() => openDeleteModal(cat)}
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
      {/* Delete & Reassign Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 max-w-md w-full p-6 relative text-xs">
            <button
              onClick={() => setCategoryToDelete(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              ¿Eliminar la categoría &quot;{categoryToDelete.name}&quot;?
            </h3>

            {categoryToDelete.itemCount > 0 ? (
              <div className="space-y-3 mt-2">
                <p className="text-slate-600">
                  Esta categoría tiene <strong>{categoryToDelete.itemCount} prenda(s)</strong> asignada(s). Elige la categoría de destino para reasignarlas antes de eliminar:
                </p>
                <select
                  value={reassignToInput}
                  onChange={e => setReassignToInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                >
                  {categories
                    .filter(c => c.id !== categoryToDelete.id)
                    .map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
              </div>
            ) : (
              <p className="text-slate-600 mt-1">
                Esta categoría no tiene productos asociados y se eliminará de inmediato.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting || (categoryToDelete.itemCount > 0 && !reassignToInput)}
                onClick={confirmDeleteCategory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Eliminar Categoría</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
