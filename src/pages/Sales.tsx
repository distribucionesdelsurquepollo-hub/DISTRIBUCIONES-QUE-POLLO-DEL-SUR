import React, { useEffect, useState } from 'react';
import { Sale, Product, CartItem, Role } from '../types';
import { subscribeToSales, createSale } from '../services/saleService';
import { subscribeToProducts } from '../services/productService';
import { generateInvoicePDF } from '../services/pdfService';
import { useAuth } from '../hooks/useAuth';
import { 
  Tag, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  User, 
  AlertCircle,
  Search,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';

export default function Sales() {
  const { profile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddSale, setShowAddSale] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAdmin = profile?.role === Role.ADMIN;

  useEffect(() => {
    const unsubS = subscribeToSales(setSales);
    const unsubP = subscribeToProducts(setProducts);
    setLoading(false);
    return () => { unsubS(); unsubP(); };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Registro de Ventas</h1>
          <p className="text-slate-500 text-sm">Gestiona la salida de productos y facturación a clientes.</p>
        </div>
        <button 
          onClick={() => setShowAddSale(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-100"
        >
          <Tag size={18} />
          Nueva Venta
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {sales.map((sale) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={sale.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{sale.customerName || 'Consumidor Final'}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                   <span className="flex items-center gap-1">
                     <Calendar size={12} /> 
                     {sale.date?.toDate?.() ? sale.date.toDate().toLocaleString() : 'Procesando...'}
                   </span>
                   <span className="bg-slate-100 px-2 py-0.5 rounded uppercase">{sale.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(sale.total)}</p>
              </div>
              <button 
                onClick={() => generateInvoicePDF(sale, 'venta')}
                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              >
                <FileText size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddSale && (
          <SaleForm 
            products={products} 
            onClose={() => setShowAddSale(false)} 
            role={profile?.role}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SaleForm({ products, onClose, role }: { products: Product[]; onClose: () => void; role?: string }) {
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [advance, setAdvance] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [searchProduct, setSearchProduct] = useState('');

  const total = cart.reduce((sum, item) => sum + item.total, 0);

  const addToCart = () => {
    if (!selectedProductId || quantity <= 0) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Warning for sellers
    if (role === Role.SELLER) {
       // Silent warning, but we can add a visual one in UI
    }

    const newItem: CartItem = {
      productId: product.id!,
      name: product.name,
      qty: quantity,
      price: price || product.salePrice,
      total: quantity * (price || product.salePrice),
      unit: product.unit
    };

    setCart([...cart, newItem]);
    setSelectedProductId('');
    setQuantity(0);
    setPrice(0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }
    
    // Alerta obligatoria por requerimiento para Vendedores
    if (role === Role.SELLER) {
      const confirmed = window.confirm("Verifique cuidadosamente los datos antes de confirmar la venta.");
      if (!confirmed) return;
    }

    try {
      const saleId = await createSale({
        customerName,
        date: null,
        items: cart,
        total,
        paymentMethod,
        advance
      });
      
      // Auto-generate PDF
      generateInvoicePDF({ id: saleId, customerName, items: cart, total, paymentMethod, advance, date: { toDate: () => new Date() } } as any, 'venta');
      
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al registrar venta');
    }
  };

  const filteredItems = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag size={24} className="text-blue-600" />
            Nueva Venta
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Agregar Producto</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Buscar Producto</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Ej: Pernil..."
                        value={searchProduct}
                        onChange={e => setSearchProduct(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                      />
                    </div>
                    {searchProduct && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto p-1">
                        {filteredItems.map(p => (
                          <button 
                            key={p.id}
                            onClick={() => {
                              setSelectedProductId(p.id!);
                              setPrice(p.salePrice);
                              setSearchProduct('');
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-lg flex justify-between"
                          >
                            <span>{p.name}</span>
                            <span className="font-bold text-slate-400">{formatCurrency(p.salePrice)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Producto Seleccionado</label>
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold text-sm h-10 flex items-center">
                      {products.find(p => p.id === selectedProductId)?.name || 'Ninguno'}
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Cantidad</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={quantity} 
                      onChange={e => setQuantity(parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Precio Unit.</label>
                    <input 
                      type="number" 
                      value={price} 
                      onChange={e => setPrice(parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    />
                  </div>
               </div>
               <button 
                onClick={addToCart}
                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
               >
                 <Plus size={16} /> Agregar a Factura
               </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Detalle de Factura</h3>
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
                  Lista vacía
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{formatNumber(item.qty)} {item.unit} x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-6">
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
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Datos de Venta</h3>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><User size={10} /> Nombre del Cliente</label>
                <input 
                  type="text" 
                  placeholder="Ej: Jorge Lasprilla"
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Forma de Pago</label>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Crédito">Crédito</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase text-blue-600">Abono Inicial</label>
                <input 
                  type="number" 
                  value={advance} 
                  onChange={e => setAdvance(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                />
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6 shadow-2xl">
              <div className="space-y-3">
                <div className="flex justify-between items-center opacity-60">
                  <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-sm font-mono">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Abonado</span>
                  <span className="text-sm font-mono">-{formatCurrency(advance)}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest">Saldo Total</span>
                  <span className="text-3xl font-black font-mono">{formatCurrency(total - advance)}</span>
                </div>
              </div>

              {role === Role.SELLER && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-500 leading-tight">
                    Verifique cuidadosamente los datos antes de confirmar la venta.
                  </p>
                </div>
              )}

              <button 
                onClick={handleSubmit}
                disabled={cart.length === 0}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                Generar Factura & Vender
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
