import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { Scissors, Plus, History, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Product } from '../types';

export default function Deboning() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    return () => unsub();
  }, []);

  const chickens = products.filter(p => p.name.toLowerCase().includes('pollo entero'));
  const parts = products.filter(p => !p.name.toLowerCase().includes('pollo entero') && p.category === 'Pollo');

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Despresaje</h1>
          <p className="text-slate-500 text-sm">Transformación de pollo entero en presas individuales.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
        >
          <Plus size={18} />
          Nueva Operación
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History size={20} className="text-slate-400" />
            Últimas Operaciones
          </h2>
          <DeboningHistory />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Scale size={18} className="text-red-500" />
              Stock Actual de Pollo Entero
            </h3>
            <div className="space-y-3">
              {chickens.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm font-medium text-slate-700">{c.name}</span>
                  <span className="font-black text-slate-900">{c.stock} {c.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <DeboningModal 
            onClose={() => setShowAdd(false)} 
            chickens={chickens}
            parts={parts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DeboningModal({ onClose, chickens, parts }: { onClose: () => void, chickens: Product[], parts: Product[] }) {
  const [sourceId, setSourceId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [outputs, setOutputs] = useState<{ productId: string, weight: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const addOutput = () => setOutputs([...outputs, { productId: '', weight: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !quantity || outputs.length === 0) return;
    setLoading(true);

    try {
      const sourceProduct = chickens.find(c => c.id === sourceId);
      if (!sourceProduct || sourceProduct.stock < parseFloat(quantity)) {
        alert('Stock insuficiente');
        return;
      }

      // 1. Discount source
      const sourceRef = doc(db, 'products', sourceId);
      await updateDoc(sourceRef, {
        stock: sourceProduct.stock - parseFloat(quantity)
      });

      // 2. Increase targets
      for (const out of outputs) {
        if (!out.productId || !out.weight) continue;
        const partRef = doc(db, 'products', out.productId);
        const part = parts.find(p => p.id === out.productId);
        if (part) {
          await updateDoc(partRef, {
            stock: part.stock + parseFloat(out.weight)
          });
        }
      }

      // 3. Register transaction
      await addDoc(collection(db, 'deboning_logs'), {
        sourceId,
        sourceName: sourceProduct.name,
        sourceQty: parseFloat(quantity),
        outputs: outputs.map(o => ({ 
          productId: o.productId, 
          name: parts.find(p => p.id === o.productId)?.name,
          weight: parseFloat(o.weight) 
        })),
        timestamp: Timestamp.now()
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <h2 className="font-black uppercase tracking-widest text-sm">Nueva Operación de Despresaje</h2>
          </div>
          
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insumo (Pollo Entero)</label>
                <select 
                  required
                  value={sourceId}
                  onChange={e => setSourceId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {chickens.map(c => <option key={c.id} value={c.id}>{c.name} ({c.stock} {c.unit})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cantidad (Ud/Kg)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presas Resultantes</label>
                <button type="button" onClick={addOutput} className="text-[10px] font-black text-red-600 uppercase border border-red-100 px-2 py-1 rounded hover:bg-red-50">
                  + Agregar Presa
                </button>
              </div>
              
              {outputs.map((out, idx) => (
                <div key={idx} className="flex gap-3 items-end group">
                  <div className="flex-1 space-y-1">
                    <select 
                      required
                      value={out.productId}
                      onChange={e => {
                        const newOuts = [...outputs];
                        newOuts[idx].productId = e.target.value;
                        setOutputs(newOuts);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="">Producto...</option>
                      {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="w-32 space-y-1">
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      placeholder="Peso Kg"
                      value={out.weight}
                      onChange={e => {
                        const newOuts = [...outputs];
                        newOuts[idx].weight = e.target.value;
                        setOutputs(newOuts);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setOutputs(outputs.filter((_, i) => i !== idx))}
                    className="mb-2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Cancelar</button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-700 shadow-lg shadow-red-100 disabled:opacity-50"
            >
              Procesar Despresaje
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function DeboningHistory() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'deboning_logs'), (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis()));
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Scissors size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{log.sourceName}</span>
                <ArrowRight size={14} className="text-slate-300" />
                <span className="text-xs font-medium text-slate-500">{log.outputs.map((o: any) => o.name).join(', ')}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {log.timestamp ? format(log.timestamp.toDate(), 'PPP p') : 'Procesando...'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-red-600">-{log.sourceQty} Ud</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Salida: {log.outputs.reduce((a: any, b: any) => a + b.weight, 0).toFixed(2)} Kg</div>
          </div>
        </div>
      ))}
    </div>
  );
}
