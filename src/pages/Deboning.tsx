import React, { useEffect, useState } from 'react';
import { Product, Deboning } from '../types';
import { subscribeToProducts } from '../services/productService';
import { createDeboningProcess } from '../services/deboningService';
import { 
  Scissors, 
  ArrowRight, 
  Plus, 
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatNumber } from '../lib/utils';

export default function DeboningPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sourceProductId, setSourceProductId] = useState('');
  const [sourceQty, setSourceQty] = useState(0);
  const [results, setResults] = useState<{ productId: string, name: string, qty: number }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return subscribeToProducts(setProducts);
  }, []);

  const fullChickenProduct = products.find(p => p.name.toLowerCase().includes('pollo entero'));
  const parts = products.filter(p => 
    p.id !== sourceProductId && 
    (p.category === 'Pollo' || p.category === 'Pollo Partes') && 
    !p.name.toLowerCase().includes('pollo entero')
  );

  const addResult = (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    if (results.find(r => r.productId === productId)) return;
    setResults([...results, { productId: p.id!, name: p.name, qty: 0 }]);
  };

  const handleResultQty = (idx: number, qty: number) => {
    const newResults = [...results];
    newResults[idx].qty = qty;
    setResults(newResults);
  };

  const removeResult = (idx: number) => {
    setResults(results.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!sourceProductId || sourceQty <= 0 || results.length === 0) {
      alert('Completa toda la información del despresaje');
      return;
    }

    setSaving(true);
    try {
      await createDeboningProcess({
        date: null,
        sourceProductId,
        sourceQty,
        resultItems: results
      });
      alert('Proceso de despresaje registrado y stock actualizado');
      setSourceQty(0);
      setResults([]);
    } catch (e) {
      console.error(e);
      alert('Error en el proceso de despresaje');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Proceso de Despresaje</h1>
        <p className="text-slate-500 text-sm">Transforma pollo entero en presas individuales.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Side */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Scissors size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-sans">Producto de Origen</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seleccionar Pollo Entero</label>
              <select 
                value={sourceProductId}
                onChange={e => setSourceProductId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                <option value="">Seleccione...</option>
                {products.filter(p => p.name.toLowerCase().includes('pollo entero')).map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {formatNumber(p.stock)} {p.unit})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cantidad a Procesar (kg)</label>
              <input 
                type="number" 
                step="0.01"
                value={sourceQty}
                onChange={e => setSourceQty(parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold text-lg"
              />
            </div>

            {sourceProductId && (
               <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-700">
                 <AlertTriangle size={20} className="shrink-0" />
                 <p className="text-xs font-medium leading-relaxed">
                   Al confirmar, se restarán <b>{formatNumber(sourceQty)} kg</b> del stock de Pollo Entero.
                 </p>
               </div>
            )}
          </div>
        </motion.div>

        {/* Results Side */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-red-600">
               <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Plus size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-sans">Resultado del Proceso</h2>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-slate-800 transition-all">
                Agregar Presa <ArrowRight size={12} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 max-h-60 overflow-y-auto p-2">
                {parts.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => addResult(p.id!)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 min-h-[200px]">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                <Scissors size={40} className="mb-2 opacity-10" />
                <p className="text-sm font-medium">No se han agregado resultados</p>
              </div>
            ) : (
              results.map((r, idx) => (
                <div key={r.productId} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">{r.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="kg"
                      value={r.qty}
                      onChange={e => handleResultQty(idx, parseFloat(e.target.value))}
                      className="w-24 px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <button 
                      onClick={() => removeResult(idx)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={saving || results.length === 0}
            className="w-full mt-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? 'Procesando...' : (
              <>
                <CheckCircle2 size={18} />
                Finalizar Despresaje
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
