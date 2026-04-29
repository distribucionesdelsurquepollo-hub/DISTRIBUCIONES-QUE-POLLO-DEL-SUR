import React, { useEffect, useState } from 'react';
import { Product, Unit, Role } from '../types';
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  initializeInventory 
} from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { 
  Plus, 
  Search, 
  FileDown, 
  Edit2, 
  Trash2, 
  Package, 
  ChevronDown, 
  AlertCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getBusinessConfig } from '../services/businessService';

export default function Inventory() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const isAdmin = profile?.role === Role.ADMIN;

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInitialize = async () => {
    if (window.confirm('¿Deseas cargar los productos iniciales?')) {
      await initializeInventory();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportPDF = async () => {
    const doc = new jsPDF();
    const config = await getBusinessConfig();
    
    doc.setFontSize(18);
    doc.text(config?.name || 'Inventario', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de reporte: ${new Date().toLocaleString()}`, 14, 30);
    
    autoTable(doc, {
      startY: 35,
      head: [['Producto', 'Unidad', 'Stock', 'Categoría', 'Precio Venta']],
      body: filteredProducts.map(p => [
        p.name,
        p.unit,
        p.stock.toString(),
        p.category,
        formatCurrency(p.salePrice)
      ]),
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      theme: 'grid'
    });
    
    doc.save('inventario-que-pollo.pdf');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Inventario</h1>
          <p className="text-slate-500 text-sm">Controla tus existencias de cárnicos y otros alimentos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {products.length === 0 && isAdmin && (
            <button 
              onClick={handleInitialize}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all font-medium text-sm"
            >
              <Database size={16} />
              Cargar Iniciales
            </button>
          )}
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm shadow-sm"
          >
            <FileDown size={16} />
            PDF
          </button>
          {isAdmin && (
            <button 
              onClick={() => { setEditingProduct(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold text-sm shadow-lg shadow-red-100"
            >
              <Plus size={16} />
              Nuevo Producto
            </button>
          )}
        </div>
      </header>

      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
        <Search size={20} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar producto..."
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 bg-transparent"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Unidad</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Precio Venta</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <motion.tr 
                  layout
                  key={p.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                      p.unit === Unit.KG ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    )}>
                      {p.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className={cn(
                      "font-bold",
                      p.stock <= p.minStock ? "text-red-600" : "text-slate-700"
                    )}>
                      {formatNumber(p.stock)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(p.salePrice)}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingProduct(p); setShowModal(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('¿Eliminar producto?')) await deleteProduct(p.id!);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <ProductModal 
            product={editingProduct} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: product?.name || '',
    unit: product?.unit || Unit.KG,
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    purchasePrice: product?.purchasePrice || 0,
    salePrice: product?.salePrice || 0,
    category: product?.category || 'Pollo',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (product?.id) {
        await updateProduct(product.id, formData);
      } else {
        await addProduct(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el producto');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Producto</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidad</label>
              <select 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value as Unit})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all appearance-none"
              >
                <option value={Unit.KG}>Kilogramos (kg)</option>
                <option value={Unit.UNIT}>Unidad</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
              <input 
                type="text" 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Actual</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Mínimo</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.minStock}
                onChange={e => setFormData({...formData, minStock: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precio Compra</label>
              <input 
                type="number" 
                value={formData.purchasePrice}
                onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precio Venta</label>
              <input 
                type="number" 
                value={formData.salePrice}
                onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value)})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              {product ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
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
