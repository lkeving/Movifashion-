import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Shirt,
  Layers,
  Wind,
  Footprints,
  ShoppingBag,
  Watch,
  Heart,
  ChevronRight,
  Filter,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import { Product, ProductCategory, CartItem, Order, User, UserRole, RecommendationItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, HERO_BANNER_IMAGE } from './data/mockProducts';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AIAssistantView } from './components/AIAssistantView';
import { VisualSearchModal } from './components/VisualSearchModal';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { authFetch, clearStoredToken } from './utils/api';
import { trackEvent } from './utils/analytics';

const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

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

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'ai' | 'favorites' | 'profile' | 'admin'>('home');

  // Catalog & store state
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['prod-sneakers-1', 'prod-bag-1']);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  // Search & Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(500000);

  // Modals & detail state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(undefined);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const currentRole: UserRole = currentUser?.role || 'cliente';

  // Category Icon Map helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt': return <Shirt className="w-5 h-5 text-[#7656D6]" />;
      case 'Layers': return <Layers className="w-5 h-5 text-[#7656D6]" />;
      case 'Wind': return <Wind className="w-5 h-5 text-[#7656D6]" />;
      case 'Footprints': return <Footprints className="w-5 h-5 text-[#7656D6]" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-[#7656D6]" />;
      case 'Watch': return <Watch className="w-5 h-5 text-[#7656D6]" />;
      case 'Flame': return <Flame className="w-5 h-5 text-[#7656D6]" />;
      default: return <Sparkles className="w-5 h-5 text-[#7656D6]" />;
    }
  };

  // Restore authenticated session via Single Source of Truth (/api/auth/me) on mount
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

  // Fetch initial backend products and recommendations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await authFetch('/api/products');
        if (prodRes.ok) {
          const data = await prodRes.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }

        const recRes = await authFetch('/api/recommendations');
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData.recommendations || []);
        }
      } catch (err) {
        console.warn('Backend fetch data fallback:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch orders based on current user role (admin sees all, client sees mine)
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
          const ordData = await res.json();
          setOrders(ordData);
        }
      } catch (err) {
        console.warn('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    clearStoredToken();
    setCurrentUser(null);
    setOrders([]);
    if (currentView === 'admin' || currentView === 'profile') {
      setCurrentView('home');
    }
  };

  // Login success callback from AuthModal
  const handleLoginSuccess = (userObj: any) => {
    const formatted = formatUser(userObj);
    setCurrentUser(formatted);
    setIsAuthOpen(false);
    setAuthMessage(null);
    if (formatted.role === 'admin') {
      setCurrentView('admin');
    }
  };

  // Safe navigation guard: For clients, the admin panel does not exist
  const handleNavigate = (view: 'home' | 'catalog' | 'ai' | 'favorites' | 'profile' | 'admin') => {
    if (view === 'admin' && currentUser?.role !== 'admin') {
      setCurrentView('home');
      return;
    }
    if (view === 'profile' && !currentUser) {
      setAuthMessage('Inicia sesión para acceder a tu perfil y pedidos.');
      setIsAuthOpen(true);
      return;
    }
    setCurrentView(view);
  };

  // Product selection
  const handleSelectProduct = (product: Product, colorName?: string) => {
    setSelectedProduct(product);
    setSelectedColorName(colorName);
    trackEvent('view_product', { productId: product.id, category: product.category });
  };

  // Cart operations
  const handleAddToCart = (product: Product, size?: string, color?: any) => {
    const chosenSize = size || product.sizes[0] || 'Única';
    const chosenColor = color || product.colors[0] || { name: 'Estándar', hex: '#25232B' };
    const existingIndex = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === chosenSize &&
        item.selectedColor.name === chosenColor.name
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${chosenSize}-${chosenColor.name}-${Date.now()}`,
        product,
        selectedSize: chosenSize,
        selectedColor: chosenColor,
        quantity: 1,
      };
      setCart([...cart, newItem]);
    }
    trackEvent('add_to_cart', { productId: product.id, category: product.category });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((i) => i.id !== itemId));
    } else {
      setCart(cart.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)));
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter((i) => i.id !== itemId));
  };

  // Pre-validate session before opening checkout
  const handleProceedToCheckout = async () => {
    setIsCartOpen(false);
    if (!currentUser) {
      setAuthMessage('Inicia sesión para continuar con tu compra.');
      setIsAuthOpen(true);
      return;
    }

    try {
      const res = await authFetch('/api/auth/me');
      if (res.status === 401) {
        clearStoredToken();
        setCurrentUser(null);
        setAuthMessage('Tu sesión expiró, inicia sesión de nuevo');
        setIsAuthOpen(true);
        return;
      }
      trackEvent('initiate_checkout', { metadata: { cartCount: cart.length } });
      setIsCheckoutOpen(true);
    } catch {
      setIsCheckoutOpen(true);
    }
  };

  // Favorite toggle
  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  // Admin CRUD handlers with credentials
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
      await authFetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
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

  // Filtered products for catalog
  const filteredProducts = products.filter((p) => {
    const finalPrice = p.discountPrice || p.price;
    if (finalPrice > maxPriceFilter) return false;
    if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchCat && !matchBrand && !matchTags) return false;
    }
    return true;
  }).sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F8] text-[#25232B] pb-20 md:pb-6">
      
      {/* Top Header */}
      <Header
        user={currentUser}
        cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
        onOpenAIAssistant={() => setCurrentView('ai')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ----------------------------------------------------------- */}
        {/* VIEW 1: HOME */}
        {/* ----------------------------------------------------------- */}
        {currentView === 'home' && (
          <div className="space-y-10 animate-in fade-in">
            
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-[#30234F] text-white shadow-xl min-h-[420px] flex items-center">
              <img
                src={HERO_BANNER_IMAGE}
                alt="Editorial MOVIFASHION AI"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#30234F] via-[#30234F]/80 to-transparent" />

              <div className="relative z-10 p-6 sm:p-12 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#E9E2FA]">
                  <Sparkles className="w-3.5 h-3.5 text-[#E9E2FA]" />
                  <span>Moda Inteligente & Recomendaciones Personalizadas</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                  Tu estilo, conectado de forma <span className="text-[#E9E2FA]">inteligente</span>.
                </h1>

                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  Descubre una experiencia de compra personalizada donde la inteligencia artificial entiende tu silueta, presupuesto y ocasiones especiales para recomendarte exactamente lo que buscas.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCurrentView('catalog')}
                    className="px-6 py-3 rounded-full bg-[#7656D6] hover:bg-white hover:text-[#30234F] text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Explorar Colección</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentView('ai')}
                    className="px-5 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#E9E2FA]" />
                    <span>Hablar con Estilista IA</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AI Assistant Direct Prompt Kicker */}
            <div
              onClick={() => setCurrentView('ai')}
              className="p-5 rounded-2xl bg-gradient-to-r from-[#E9E2FA] via-white to-[#E9E2FA]/60 border border-[#7656D6]/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#7656D6] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#30234F] flex items-center gap-2">
                    <span>Prueba nuestro Asistente de Estilo con IA</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7656D6] text-white">
                      Nuevo
                    </span>
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Ejemplo: "Estoy buscando unos tenis deportivos para caminar, cómodos y que cuesten menos de $250.000"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#7656D6] group-hover:translate-x-1 transition-transform shrink-0">
                <span>Iniciar Consulta</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Featured Categories Carousel / Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#30234F]">Categorías Destacadas</h2>
                  <p className="text-xs text-gray-500">Explora prendas diseñadas para tu día a día</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentView('catalog');
                  }}
                  className="text-xs font-bold text-[#7656D6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver todas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentView('catalog');
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-gray-100 hover:border-[#7656D6] hover:shadow-sm text-center flex flex-col items-center justify-center transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F8] group-hover:bg-[#E9E2FA] flex items-center justify-center mb-2 transition-colors">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <span className="text-xs font-bold text-gray-800 group-hover:text-[#7656D6] transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{cat.itemCount} prendas</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personalized Recommendations Section: "Recomendado para ti" */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#30234F]">Recomendado para ti</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E9E2FA] text-[#7656D6]">
                      Motor Híbrido IA
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Adaptado a tu preferencia de estilo ({currentUser?.preferences?.style || 'Minimalista'}) y catálogo en tendencia
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="relative">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#7656D6] font-semibold">
                      <span>✨ {rec.reason}</span>
                      <span className="font-mono text-gray-500 tabular-nums">{rec.affinityScore}% afinidad</span>
                    </div>
                    <ProductCard
                      product={rec.product}
                      onSelect={(p, colName) => handleSelectProduct(p, colName)}
                      onAddToCart={(p, sz, clr) => handleAddToCart(p, sz, clr)}
                      isFavorite={favorites.includes(rec.product.id)}
                      onToggleFavorite={(p) => handleToggleFavorite(p)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Products & Special Offers Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#30234F]">Colección Contemporánea</h2>
                  <p className="text-xs text-gray-500">Piezas icónicas con disponibilidad inmediata</p>
                </div>
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="text-xs font-bold text-[#7656D6] hover:underline cursor-pointer"
                >
                  Explorar catálogo completo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.slice(0, 6).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelect={(p, colName) => handleSelectProduct(p, colName)}
                    onAddToCart={(p, sz, clr) => handleAddToCart(p, sz, clr)}
                    isFavorite={favorites.includes(prod.id)}
                    onToggleFavorite={(p) => handleToggleFavorite(p)}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 2: CATALOG / EXPLORAR */}
        {/* ----------------------------------------------------------- */}
        {currentView === 'catalog' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Header & Controls */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[#30234F]">Catálogo de Moda & Accesorios</h1>
                  <p className="text-xs text-gray-500">
                    Mostrando {filteredProducts.length} prendas y accesorios disponibles
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-[#F5F5F8] px-3 py-1.5 rounded-full border border-gray-200/60">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#7656D6]" />
                    <span className="font-medium">Ordenar:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent font-bold text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="popular">Más Populares</option>
                      <option value="rating">Mejor Calificación</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#30234F] text-white shadow-xs'
                      : 'bg-[#F5F5F8] text-gray-600 hover:bg-[#E9E2FA]/50'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedCategory.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-[#7656D6] text-white shadow-xs'
                        : 'bg-[#F5F5F8] text-gray-600 hover:bg-[#E9E2FA]/50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Price Filter slider */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-700">Presupuesto Máximo:</span>
                  <span className="font-bold text-[#7656D6] tabular-nums">
                    ${maxPriceFilter.toLocaleString('es-CO')} COP
                  </span>
                </div>
                <div className="flex-1 max-w-xs">
                  <input
                    type="range"
                    min="80000"
                    max="500000"
                    step="10000"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full accent-[#7656D6] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-3">
                <Filter className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-800">No se encontraron prendas con estos filtros</h3>
                <p className="text-xs text-gray-500">Prueba ajustando el presupuesto o eliminando los filtros.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setMaxPriceFilter(500000);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#7656D6] text-white text-xs font-semibold hover:bg-[#30234F] transition-colors cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelect={(p, colName) => handleSelectProduct(p, colName)}
                    onAddToCart={(p, sz, clr) => handleAddToCart(p, sz, clr)}
                    isFavorite={favorites.includes(prod.id)}
                    onToggleFavorite={(p) => handleToggleFavorite(p)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 3: ASISTENTE IA */}
        {/* ----------------------------------------------------------- */}
        {currentView === 'ai' && (
          <div className="animate-in fade-in">
            <AIAssistantView
              onSelectProduct={(p) => handleSelectProduct(p)}
              onAddToCart={(p) => handleAddToCart(p)}
            />
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 4: FAVORITOS */}
        {/* ----------------------------------------------------------- */}
        {currentView === 'favorites' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#30234F]">Tus Prendas Favoritas</h1>
                <p className="text-xs text-gray-500">
                  {favorites.length} prendas guardadas en tu lista de deseos
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-3">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-800">Aún no tienes favoritos</h3>
                <p className="text-xs text-gray-500">Toca el corazón en cualquier prenda para guardarla aquí.</p>
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="px-4 py-2 rounded-xl bg-[#7656D6] text-white text-xs font-semibold hover:bg-[#30234F] transition-colors cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products
                  .filter((p) => favorites.includes(p.id))
                  .map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelect={(p, colName) => handleSelectProduct(p, colName)}
                      onAddToCart={(p, sz, clr) => handleAddToCart(p, sz, clr)}
                      isFavorite={true}
                      onToggleFavorite={(p) => handleToggleFavorite(p)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 5: PERFIL */}
        {/* ----------------------------------------------------------- */}
        {currentView === 'profile' && (
          <div className="animate-in fade-in">
            {currentUser ? (
              <ProfileView
                user={currentUser}
                orders={orders}
                onUpdatePreferences={(newPrefs) => {
                  setCurrentUser({
                    ...currentUser,
                    preferences: { ...currentUser.preferences, ...newPrefs },
                  });
                }}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 max-w-lg mx-auto space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#E9E2FA] text-[#7656D6] flex items-center justify-center mx-auto">
                  <UserIcon className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold text-[#30234F]">Inicia sesión en tu cuenta</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Para acceder a tu historial de pedidos, direcciones guardadas y recomendaciones personalizadas, inicia sesión o crea tu cuenta de cliente.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-[#7656D6] hover:bg-[#30234F] text-white text-xs font-semibold transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 6: PANEL ADMINISTRATIVO (Solo para administradores) */}
        {/* ----------------------------------------------------------- */}
        {currentView === 'admin' && currentUser?.role === 'admin' && (
          <div className="animate-in fade-in">
            <React.Suspense
              fallback={
                <div className="p-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#7656D6] border-t-transparent rounded-full animate-spin" />
                  <span>Cargando panel administrativo seguro...</span>
                </div>
              }
            >
              <AdminDashboard
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddProduct={handleAddProduct}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            </React.Suspense>
          </div>
        )}

      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        initialColorName={selectedColorName}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedColorName(undefined);
        }}
        onAddToCart={(item) => {
          setCart([...cart, item]);
          setIsCartOpen(true);
        }}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={(p) => handleToggleFavorite(p)}
        onSelectProduct={(p) => handleSelectProduct(p)}
        catalog={products}
      />

      {/* Cart Slide-Over Drawer */}
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
        onSelectProduct={(p) => handleSelectProduct(p)}
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

      {/* Mobile Bottom Navigation (for Customer Mode) */}
      {currentRole === 'cliente' && (
        <BottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
          favoritesCount={favorites.length}
        />
      )}

      {/* Desktop Clean Footer */}
      <footer className="mt-12 border-t border-gray-200/80 bg-white py-8 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#30234F]">MOVIFASHION AI</span>
            <span>·</span>
            <span>Your style, intelligently connected</span>
          </div>
          <p>© 2026 MOVIFASHION AI. Arquitectura segura OWASP Top 10 · Supabase PostgreSQL</p>
        </div>
      </footer>

    </div>
  );
}
