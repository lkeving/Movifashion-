// AdminDashboard Entry Point (Lazy-loaded via dynamic import)
// Delegates all views to the modular Enterprise AdminLayout in src/admin/

import React from 'react';
import { Product, ProductCategory, Order, User } from '../types/index.ts';
import { AdminLayout } from '../admin/AdminLayout.tsx';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onAddProduct?: (product: Product) => void;
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: any) => void;
  currentUser?: User | null;
  categories?: ProductCategory[];
  onLogout?: () => void;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  currentUser,
  categories = [],
  onLogout = () => {},
  onRefreshData = () => {},
}) => {
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Autenticación Requerida</h2>
          <p className="text-xs text-slate-500">
            Debes iniciar sesión con una cuenta autorizada de personal para acceder al back-office.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-[#7656D6] text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Volver a la Tienda
          </a>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      currentUser={currentUser}
      products={products}
      orders={orders}
      categories={categories}
      onLogout={onLogout}
      onRefreshData={onRefreshData}
    />
  );
};
