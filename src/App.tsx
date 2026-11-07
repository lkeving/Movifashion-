import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Product, ProductCategory, CartItem, Order, User, UserRole } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data/mockProducts';

// Persistent & Navigation Components
import { Header } from './components/Header';
import { TopBanner } from './components/TopBanner';
import { AdminPlaceholderAlert } from './components/AdminPlaceholderAlert';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CookieBanner } from './components/CookieBanner';

// Modals
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { VisualSearchModal } from './components/VisualSearchModal';
import { AuthModal } from './components/AuthModal';

// Utilities & APIs
import { authFetch, clearStoredToken } from './utils/api';
import { Loader2, AlertTriangle, Home, Lock } from 'lucide-react';

// Lazy Loaded Pages
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const CatalogPage = lazy(() => import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductoDetallePage = lazy(() => import('./pages/ProductoDetallePage').then(m => ({ default: m.ProductoDetallePage })));
const ColeccionPage = lazy(() => import('./pages/ColeccionPage').then(m => ({ default: m.ColeccionPage })));
const TendenciasPage = lazy(() => import('./pages/TendenciasPage').then(m => ({ default: m.TendenciasPage })));
const DescuentosPage = lazy(() => import('./pages/DescuentosPage').then(m => ({ default: m.DescuentosPage })));
const AIAssistantView = lazy(() => import('./components/AIAssistantView').then(m => ({ default: m.AIAssistantView })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const CuentaPage = lazy(() => import('./pages/CuentaPage').then(m => ({ default: m.CuentaPage })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Legal & Corporate Pages
const NosotrosPage = lazy(() => import('./pages/NosotrosPage').then(m => ({ default: m.NosotrosPage })));
const MisionVisionPage = lazy(() => import('./pages/MisionVisionPage').then(m => ({ default: m.MisionVisionPage })));
const ContactoPage = lazy(() => import('./pages/ContactoPage').then(m => ({ default: m.ContactoPage })));
const PQRSPage = lazy(() => import('./pages/PQRSPage').then(m => ({ default: m.PQRSPage })));
const TerminosPage = lazy(() => import('./pages/TerminosPage').then(m => ({ default: m.TerminosPage })));
const PrivacidadPage = lazy(() => import('./pages/PrivacidadPage').then(m => ({ default: m.PrivacidadPage })));
const CookiesPage = lazy(() => import('./pages/CookiesPage').then(m => ({ default: m.CookiesPage })));
const EnviosPage = lazy(() => import('./pages/EnviosPage').then(m => ({ default: m.EnviosPage })));
const DevolucionesPage = lazy(() => import('./pages/DevolucionesPage').then(m => ({ default: m.DevolucionesPage })));
const GuiaTallasPage = lazy(() => import('./pages/GuiaTallasPage').then(m => ({ default: m.GuiaTallasPage })));
const PreguntasFrecuentesPage = lazy(() => import('./pages/PreguntasFrecuentesPage').then(m => ({ default: m.PreguntasFrecuentesPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Error Boundary Class
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F5F8] text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-[#30234F]">Ocurrió un inconveniente temporal</h2>
            <p className="text-xs text-slate-600">
              Estamos optimizando tu experiencia de navegación. Por favor recarga la página o regresa al inicio.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2.5 bg-[#7656D6] text-white text-xs font-semibold rounded-xl hover:bg-[#6344be] transition-colors"
            >
              Volver a la Tienda
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function formatUser(rawUser: any): User {
  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    role: rawUser.role,
    avatarUrl: rawUser.avatarUrl,
    preferences: rawUser.preferences || {
      style: 'minimalista',
      favoriteCategories: ['Zapatos', 'Chaquetas'],
      typicalBudget: 350000,
      preferredSizes: ['M', '39'],
      favoriteColors: ['#7656D6', '#30234F'],
    },
    addresses: rawUser.addresses || [
      {
        id: 'addr-default',
        recipientName: rawUser.name,
        street: 'Carrera 43A # 18 Sur - 122',
        city: 'Medellín',
        department: 'Antioquia',
        postalCode: '050022',
        phone: '+57 312 890 4421',
        isDefault: true,
      },
    ],
    createdAt: rawUser.created_at || rawUser.createdAt || new Date().toISOString(),
  };
}

// ScrollToTop on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['prod-sneakers-1', 'prod-bag-1']);

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(undefined);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Restore authenticated session via Single Source of Truth (/api/auth/me)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await authFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(formatUser(data.user));
          } else {
            setCurrentUser(null);
            clearStoredToken();
          }
        } else {
          setCurrentUser(null);
          clearStoredToken();
        }
      } catch (err) {
        console.warn('Session restoration check:', err);
        setCurrentUser(null);
      }
    };
    restoreSession();
  }, []);

  // Fetch initial catalog from server
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await authFetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.warn('Backend fetch data fallback:', err);
      }
    };
    fetchCatalog();
  }, []);

  // Fetch orders for admin or authenticated user
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setOrders([]);
        return;
      }
      try {
        const endpoint = currentUser.role === 'admin' ? '/api/orders' : '/api/orders/mine';
        const res = await authFetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        }
      } catch (err) {
        console.warn('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.product.id === item.product.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor.name === item.selectedColor.name
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!currentUser) {
      setAuthMessage('Inicia sesión o regístrate para completar tu pedido');
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // Favorites
  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  // Auth Handlers
  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    clearStoredToken();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    setAuthMessage(null);
  };

  // Admin Handlers
  const handleAddProduct = async (newProd: Product) => {
    try {
      const res = await authFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts([saved, ...products]);
      } else {
        setProducts([newProd, ...products]);
      }
    } catch {
      setProducts([newProd, ...products]);
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    try {
      await authFetch(`/api/products/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(err);
    }
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await authFetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      await authFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.error(err);
    }
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const openProductModal = (product: Product, colorName?: string) => {
    setSelectedProduct(product);
    setSelectedColorName(colorName);
  };

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F8] text-[#25232B] pb-20 md:pb-0">
      <ScrollToTop />

      {/* Top Banner */}
      <TopBanner />

      {/* Admin Warning for Config Placeholders */}
      <AdminPlaceholderAlert userRole={currentUser?.role} />

      {/* Sticky Header with Real Router Navigation */}
      <Header
        user={currentUser}
        cartCount={cartCount}
        favoritesCount={favorites.length}
        categories={categories}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Area with Suspense and Dynamic Routes */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense
          fallback={
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#7656D6] animate-spin" />
              <span className="text-xs font-semibold text-slate-500">Cargando MoviFashion...</span>
            </div>
          }
        >
          <Routes>
            {/* 1. Storefront Home */}
            <Route
              path="/"
              element={
                <HomePage
                  products={products}
                  categories={categories}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onOpenProductDetail={openProductModal}
                />
              }
            />

            {/* 2. Catalog & Category Filtering */}
            <Route
              path="/catalogo"
              element={
                <CatalogPage
                  products={products}
                  categories={categories}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onOpenProductDetail={openProductModal}
                />
              }
            />
            <Route
              path="/catalogo/:categoria"
              element={
                <CatalogPage
                  products={products}
                  categories={categories}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onOpenProductDetail={openProductModal}
                />
              }
            />

            {/* 3. Dedicated Product Detail Page */}
            <Route
              path="/producto/:slug"
              element={
                <ProductoDetallePage
                  products={products}
                  onAddToCart={handleAddToCart}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            {/* 4. Seasonal Collections & Lookbook */}
            <Route
              path="/nueva-coleccion"
              element={
                <ColeccionPage
                  products={products}
                  onAddToCart={handleAddToCart}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            {/* 5. Trending & Best Sellers */}
            <Route
              path="/tendencias"
              element={
                <TendenciasPage
                  products={products}
                  categories={categories}
                  onAddToCart={handleAddToCart}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            {/* 6. Discounted Items */}
            <Route
              path="/descuentos"
              element={
                <DescuentosPage
                  products={products}
                  onAddToCart={handleAddToCart}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              }
            />

            {/* 7. Conversational AI Assistant "Movi" */}
            <Route
              path="/asistente"
              element={
                <AIAssistantView
                  onSelectProduct={(p) => openProductModal(p)}
                  onAddToCart={(p) =>
                    handleAddToCart({
                      id: `${p.id}-${Date.now()}`,
                      product: p,
                      selectedSize: p.sizes[0] || 'M',
                      selectedColor: p.colors[0] || { name: 'Estándar', hex: '#25232B' },
                      quantity: 1,
                    })
                  }
                />
              }
            />

            {/* 8. Favorites */}
            <Route
              path="/favoritos"
              element={
                <FavoritesPage
                  products={products}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onOpenProductDetail={openProductModal}
                />
              }
            />

            {/* 9. Customer Account & Orders */}
            <Route
              path="/cuenta"
              element={
                <CuentaPage
                  user={currentUser}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onLogout={handleLogout}
                />
              }
            />

            {/* 10. Admin Dashboard (Protected Route) */}
            <Route
              path="/admin"
              element={
                currentUser?.role === 'admin' ? (
                  <AdminDashboard
                    products={products}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onAddProduct={handleAddProduct}
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* 11. Corporate & Legal Pages */}
            <Route path="/nosotros" element={<NosotrosPage />} />
            <Route path="/mision-vision" element={<MisionVisionPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            <Route path="/pqrs" element={<PQRSPage />} />
            <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
            <Route path="/guia-de-tallas" element={<GuiaTallasPage />} />
            <Route path="/envios" element={<EnviosPage />} />
            <Route path="/cambios-y-devoluciones" element={<DevolucionesPage />} />
            <Route path="/terminos-y-condiciones" element={<TerminosPage />} />
            <Route path="/politica-de-privacidad" element={<PrivacidadPage />} />
            <Route path="/politica-de-cookies" element={<CookiesPage />} />

            {/* 12. 404 Friendly Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Corporate 5-Column Footer */}
      <Footer />

      {/* Floating Customer Care Tools */}
      <WhatsAppButton />
      <CookieBanner />

      {/* Mobile Bottom Navigation */}
      <BottomNav favoritesCount={favorites.length} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        initialColorName={selectedColorName}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedColorName(undefined);
        }}
        onAddToCart={(item) => {
          handleAddToCart(item);
        }}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={(p) => handleToggleFavorite(p)}
        onSelectProduct={(p) => openProductModal(p)}
        catalog={products}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      {currentUser && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          user={currentUser}
          onOrderSuccess={(newOrder) => {
            setOrders([newOrder, ...orders]);
            setCart([]);
          }}
          onSessionExpired={(msg) => {
            setIsCheckoutOpen(false);
            setCurrentUser(null);
            clearStoredToken();
            setAuthMessage(msg);
            setIsAuthOpen(true);
          }}
        />
      )}

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
        onSelectProduct={(p) => openProductModal(p)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthMessage(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        initialMessage={authMessage}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
