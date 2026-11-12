// Module 3: Catálogo de Productos y Variantes
// Full CRUD, variants, margin calculation, price history, trash/restore, bulk price adjustments

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Copy,
  Edit,
  RotateCcw,
  AlertTriangle,
  Check,
  Search,
  Filter,
  Eye,
  Sliders,
  DollarSign,
  Tag,
  Loader2,
  X,
  Lock,
} from 'lucide-react';
import { DataTable, Column } from '../components/DataTable.tsx';
import { Product, ProductCategory } from '../../types/index.ts';
import { authFetch } from '../../utils/api.ts';
import { ReauthModal } from '../components/ReauthModal.tsx';

interface ProductosModuleProps {
  products: Product[];
  categories: ProductCategory[];
  userRole?: string;
  onProductsChanged?: () => void;
}

export const ProductosModule: React.FC<ProductosModuleProps> = ({
  products: initialProducts,
  categories,
  userRole,
  onProductsChanged,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reauthAction, setReauthAction] = useState<(() => void) | null>(null);
  const [actionError, setActionError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Chaquetas');
  const [formBrand, setFormBrand] = useState('MoviFashion');
  const [formPrice, setFormPrice] = useState('180000');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formCost, setFormCost] = useState('95000');
  const [formInventory, setFormInventory] = useState('15');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'publicado' | 'borrador' | 'archivado'>('publicado');
  const [formLowStock, setFormLowStock] = useState('5');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/admin/products?includeDeleted=${showTrash ? 'only' : 'false'}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [showTrash]);

  const openCreateModal = () => {
    setSelectedProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Chaquetas');
    setFormBrand('MoviFashion');
    setFormPrice('180000');
    setFormDiscountPrice('');
    setFormCost('95000');
    setFormInventory('15');
    setFormDescription('Prenda con confección de alta precisión, textil suave y diseño contemporáneo.');
    setFormStatus('publicado');
    setFormLowStock('5');
    setIsCreating(true);
  };

  const openEditModal = (p: Product) => {
    setSelectedProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBrand(p.brand || 'MoviFashion');
    setFormPrice(String(p.price));
    setFormDiscountPrice(p.discountPrice ? String(p.discountPrice) : '');
    setFormCost(p.cost ? String(p.cost) : String(Math.round(p.price * 0.55)));
    setFormInventory(String(p.inventory));
    setFormDescription(p.description || '');
    setFormStatus(p.status || 'publicado');
    setFormLowStock(String(p.lowStockThreshold || 5));
    setIsEditing(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPrice) return;
    setIsSubmitting(true);

    try {
      const payload = {
        name: formName,
        category: formCategory,
        brand: formBrand,
        price: Number(formPrice),
        discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
        cost: Number(formCost),
        inventory: Number(formInventory),
        description: formDescription,
        status: formStatus,
        lowStockThreshold: Number(formLowStock),
        clientUpdatedAt: selectedProduct?.updatedAt,
      };

      let res;
      if (isEditing && selectedProduct) {
        res = await authFetch(`/api/admin/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.status === 409) {
        setActionError('Conflicto: este producto fue actualizado recientemente por otro miembro. Recarga los datos antes de guardar.');
        await fetchProducts();
        return;
      }

      if (res.ok) {
        setActionError('');
        setIsEditing(false);
        setIsCreating(false);
        await fetchProducts();
        onProductsChanged?.();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'No se pudo guardar la prenda.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al guardar la prenda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSoftDelete = async (id: string) => {
    setActionError('');
    try {
      const res = await authFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteConfirmId(null);
        await fetchProducts();
        onProductsChanged?.();
      } else {
        const err = await res.json().catch(() => ({}));
        setActionError(err.error || 'Error al mover a la papelera.');
      }
    } catch (err) {
      console.error(err);
      setActionError('Error de conexión al mover a la papelera.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/products/${id}/restore`, { method: 'POST' });
      if (res.ok) {
        await fetchProducts();
        onProductsChanged?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = (id: string) => {
    setReauthAction(() => async () => {
      try {
        const res = await authFetch(`/api/admin/products/${id}/permanent`, { method: 'DELETE' });
        if (res.ok) {
          await fetchProducts();
          onProductsChanged?.();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setReauthAction(null);
      }
    });
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/products/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        await fetchProducts();
        onProductsChanged?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Prenda',
      accessor: r => r.name,
      render: r => (
        <div className="flex items-center gap-3">
          <img
            src={r.images[0] || '/images/products/chaqueta-bomber-tecnica-negro.jpg'}
            alt=""
            className="w-10 h-10 object-cover rounded-xl bg-slate-100 shrink-0"
          />
          <div>
            <div className="font-bold text-slate-800">{r.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">ID: {r.id.slice(0, 12)}...</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      header: 'Categoría',
      accessor: r => r.category,
      render: r => <span className="font-semibold text-slate-600">{r.category}</span>,
      sortable: true,
    },
    {
      key: 'price',
      header: 'Precio Venta',
      accessor: r => r.discountPrice || r.price,
      render: r => {
        const hasDiscount = Boolean(r.discountPrice && r.discountPrice < r.price);
        return (
          <div>
            {hasDiscount ? (
              <>
                <span className="font-mono font-bold text-emerald-700">
                  ${r.discountPrice!.toLocaleString('es-CO')}
                </span>
                <span className="text-[10px] text-slate-400 block line-through font-mono">
                  ${r.price.toLocaleString('es-CO')}
                </span>
              </>
            ) : (
              <span className="font-mono font-bold text-slate-900">
                ${r.price.toLocaleString('es-CO')}
              </span>
            )}
          </div>
        );
      },
      align: 'right',
      sortable: true,
    },
    {
      key: 'cost',
      header: 'Costo / Margen',
      accessor: r => r.cost || r.price * 0.55,
      render: r => {
        const effectivePrice = r.discountPrice && r.discountPrice < r.price ? r.discountPrice : r.price;
        const cost = r.cost || Math.round(effectivePrice * 0.55);
        const margin = effectivePrice > 0 ? Math.round(((effectivePrice - cost) / effectivePrice) * 100) : 0;
        return (
          <div className="text-right">
            <span className="text-slate-500 font-mono text-[11px]">${cost.toLocaleString('es-CO')}</span>
            <span className="text-emerald-700 font-bold block text-[10px]">{margin}% margen</span>
          </div>
        );
      },
      align: 'right',
    },
    {
      key: 'inventory',
      header: 'Existencias',
      accessor: r => r.inventory,
      render: r => {
        const isLow = r.inventory <= (r.lowStockThreshold || 5);
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              r.inventory === 0
                ? 'bg-rose-100 text-rose-800'
                : isLow
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {r.inventory} unidades
          </span>
        );
      },
      align: 'center',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Estado',
      accessor: r => r.status || 'publicado',
      render: r => {
        const st = r.status || 'publicado';
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              st === 'publicado'
                ? 'bg-emerald-50 text-emerald-700'
                : st === 'borrador'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {st}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: r => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          {!showTrash ? (
            <>
              <button
                onClick={() => openEditModal(r)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDuplicate(r.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Duplicar"
              >
                <Copy className="w-4 h-4" />
              </button>
              {deleteConfirmId === r.id ? (
                <div className="flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded-lg border border-rose-200">
                  <button
                    onClick={() => handleSoftDelete(r.id)}
                    className="text-[10px] font-bold text-rose-700 hover:underline px-1"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 px-1"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(r.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Mover a papelera"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => handleRestore(r.id)}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                title="Restaurar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {userRole === 'super_admin' && (
                <button
                  onClick={() => handlePermanentDelete(r.id)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                  title="Eliminación definitiva (SuperAdmin)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      ),
      align: 'right',
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrash(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              !showTrash ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Catálogo Activo
          </button>
          <button
            onClick={() => setShowTrash(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              showTrash ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Papelera Temporal
          </button>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Prenda</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-600 font-bold hover:underline">Cerrar</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={products}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Buscar por prenda, categoría, marca..."
        onRowClick={openEditModal}
        exportFileName="catalogo-movifashion.csv"
      />

      {/* Create / Edit Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              {isEditing ? 'Editar Prenda' : 'Nueva Prenda en Catálogo'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Configura los atributos comerciales, precios en COP e inventario físico.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Prenda *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ej: Chaqueta Bomber Técnica Modular"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Venta (COP) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Oferta (COP)</label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={e => setFormDiscountPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Costo Unitario (COP)</label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Total</label>
                  <input
                    type="number"
                    value={formInventory}
                    onChange={e => setFormInventory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alerta Bajo Stock</label>
                  <input
                    type="number"
                    value={formLowStock}
                    onChange={e => setFormLowStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="publicado">Publicado</option>
                    <option value="borrador">Borrador</option>
                    <option value="archivado">Archivado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#7656D6] hover:bg-[#6042BE] text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Prenda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reauth Modal for Permanent Deletion */}
      {reauthAction && (
        <ReauthModal
          isOpen={true}
          onClose={() => setReauthAction(null)}
          onConfirm={reauthAction}
          title="Eliminación Definitiva de Producto"
          description="Esta acción eliminará de forma irreversible el registro de la base de datos. Se requiere tu contraseña de Super Administrador."
        />
      )}
    </div>
  );
};
