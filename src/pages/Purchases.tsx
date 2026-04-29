import React, { useEffect, useState } from 'react';
import { Purchase, Provider, Product, CartItem, Unit } from '../types';
import { subscribeToPurchases, createPurchase, subscribeToProviders, addProvider } from '../services/purchaseService';
import { subscribeToProducts } from '../services/productService';
import { generateInvoicePDF } from '../services/pdfService';
import { 
  Plus, 
  ShoppingCart, 
  UserPlus, 
  FileText, 
  ChevronRight, 
  Trash2,
  Calendar,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubP = subscribeToPurchases(setPurchases);
    const unsubProv = subscribeToProviders(setProviders);
    const unsubProd = subscribeToProducts(setProducts);
    setLoading(false);
    return () => { unsubP(); unsubProv(); unsubProd(); };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registro de Compras</h1>
          <p className="text-slate-500 text-sm">Gestiona la entrada de mercancía de tus proveedores.</p>
        </div>
        <button 
          onClick={() => setShowAddPurchase(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100"
        >
          <ShoppingCart size={18} />
          Nueva Compra
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {purchases.map((purchase) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={purchase.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-red-200 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{purchase.providerName}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                   <span className="flex items-center gap-1"><Calendar size={12} /> {purchase.date?.toDate?.() ? purchase.date.toDate().toLocaleDateString() : 'Procesando...'}</span>
                   <span className="bg-slate-100 px-2 py-0.5 rounded uppercase">{purchase.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(purchase.total)}</p>
              </div>
              <button 
                onClick={() => generateInvoicePDF(purchase, 'compra')}
                className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <FileText size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddPurchase && (
          <PurchaseForm 
            providers={providers} 
            products={products} 
            onClose={() => setShowAddPurchase(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PurchaseForm({ providers, products, onClose }: { providers: Provider[]; products: Product[]; onClose: () => void }) {
  const [providerId, setProviderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [advance, setAdvance] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  const addToCart = () => {
    if (!selectedProductId || quantity <= 0) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const newItem: CartItem = {
      productId: product.id!,
      name: product.name,
      qty: quantity,
      price: price || product.purchasePrice,
      total: quantity * (price || product.purchasePrice),
      unit: product.unit
    };

    setCart([...cart, newItem]);
    setSelectedProductId('');
    setQuantity(0);
    setPrice(0);
  };

  const handleSubmit = async () => {
    if (!providerId || cart.length === 0) {
      alert('Completa los datos de la compra');
      return;
    }
    
    const provider = providers.find(p => p.id === providerId);
    
    try {
      const purchaseId = await createPurchase({
        providerId,
        providerName: provider?.name || 'Prov. Desconocido',
        date: null,
        items: cart,
        total,
        paymentMethod,
        advance
      });
      
      // Auto-generate PDF
      generateInvoicePDF({ id: purchaseId, providerName: provider?.name, items: cart, total, paymentMethod, advance, date: { toDate: () => new Date() } } as any, 'compra');
      
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al registrar compra');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart size={24} className="text-red-600" />
            Nueva Compra de Mercancía
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Agregar Producto</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Seleccionar Producto</label>
                    <select 
                      value={selectedProductId} 
                      onChange={e => {
                        setSelectedProductId(e.target.value);
                        const p = products.find(prod => prod.id === e.target.value);
                        if (p) setPrice(p.purchasePrice);
                      }}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all bg-white"
                    >
                      <option value="">Seleccione...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Cantidad</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={quantity} 
                        onChange={e => setQuantity(parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Unit.</label>
                      <input 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      />
                    </div>
                  </div>
               </div>
               <button 
                onClick={addToCart}
                className="w-full mt-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
               >
                 <Plus size={16} /> Agregar a la Lista
               </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumen de Productos</h3>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-2xl">
                  No hay productos agregados
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{formatNumber(item.qty)} {item.unit} x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-slate-900">{formatCurrency(item.total)}</p>
                        <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Información de Pago</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Proveedor</label>
                <select 
                  value={providerId} 
                  onChange={e => setProviderId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all bg-white"
                >
                  <option value="">Seleccione Proveedor...</option>
                  {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Forma de Pago</label>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all bg-white"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Crédito">Crédito</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Abono Inicial</label>
                <input 
                  type="number" 
                  value={advance} 
                  onChange={e => setAdvance(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all bg-white"
                />
              </div>
            </div>

            <div className="bg-red-600 p-6 rounded-2xl text-white shadow-xl shadow-red-100 space-y-4">
              <div className="flex justify-between items-center opacity-80">
                <span className="text-sm font-medium uppercase tracking-wider">Subtotal</span>
                <span className="text-sm font-mono">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center opacity-80">
                <span className="text-sm font-medium uppercase tracking-wider">Abono</span>
                <span className="text-sm font-mono">-{formatCurrency(advance)}</span>
              </div>
              <div className="h-px bg-white/20" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-wider">Saldo</span>
                <span className="text-2xl font-black font-mono">{formatCurrency(total - advance)}</span>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={cart.length === 0}
                className="w-full py-4 bg-white text-red-600 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
