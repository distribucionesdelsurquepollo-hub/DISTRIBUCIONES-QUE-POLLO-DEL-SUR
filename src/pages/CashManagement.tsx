import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWithinInterval, setHours, setMinutes } from 'date-fns';

export default function CashManagement() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ balance: 0, entries: 0, exits: 0 });
  const [showMove, setShowMove] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cash_transactions'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = data.sort((a: any, b: any) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
      
      const balance = data.reduce((acc, curr: any) => 
        curr.type === 'entry' ? acc + curr.amount : acc - curr.amount, 0);
      const entries = data.filter((d: any) => d.type === 'entry').reduce((a, b: any) => a + b.amount, 0);
      const exits = data.filter((d: any) => d.type === 'exit').reduce((a, b: any) => a + b.amount, 0);

      setTransactions(sorted);
      setSummary({ balance, entries, exits });
    });
    return () => unsub();
  }, []);

  const now = new Date();
  const start = setMinutes(setHours(now, 6), 0);
  const end = setMinutes(setHours(now, 19), 0);
  const isWithinTime = isWithinInterval(now, { start, end });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-500 text-sm">Control de flujo financiero y base diaria.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isWithinTime && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-100">
              <Clock size={14} />
              Fuera de horario comercial (6am - 7pm)
            </div>
          )}
          <button 
            onClick={() => setShowMove(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
          >
            <ArrowUpRight size={18} />
            Nuevo Movimiento
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Saldo Actual" value={summary.balance} icon={Wallet} color="text-slate-900" />
        <StatCard title="Ingresos Totales" value={summary.entries} icon={ArrowUpRight} color="text-emerald-500" />
        <StatCard title="Egresos Totales" value={summary.exits} icon={ArrowDownLeft} color="text-red-500" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            Historial de Movimientos
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 30 días</span>
        </div>
        
        <div className="divide-y divide-slate-50">
          {transactions.map(t => (
            <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'entry' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {t.type === 'entry' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.description}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t.timestamp ? format(t.timestamp.toDate(), 'PPP p') : 'Sincronizando...'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-black ${t.type === 'entry' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'entry' ? '+' : '-'}${t.amount.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">{t.category || 'Varios'}</div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-xs">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMove && (
          <CashModal onClose={() => setShowMove(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 bg-slate-50 rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">${value.toLocaleString()}</h3>
      </div>
    </div>
  );
}

function CashModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'entry' | 'exit'>('entry');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'cash_transactions'), {
        amount: parseFloat(amount),
        description,
        type,
        category,
        timestamp: serverTimestamp()
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
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <h2 className="font-black uppercase tracking-widest text-sm">Nuevo Movimiento de Caja</h2>
          </div>
          
          <div className="p-8 space-y-4">
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
              <button 
                type="button"
                onClick={() => setType('entry')}
                className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${type === 'entry' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                Ingreso
              </button>
              <button 
                type="button"
                onClick={() => setType('exit')}
                className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${type === 'exit' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
              >
                Egreso
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Monto ($)</label>
              <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="0.00" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Descripción / Concepto</label>
              <input required type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="Ej: Pago de flete" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900">
                <option value="">Seleccionar...</option>
                <option value="Ventas">Ventas</option>
                <option value="Compras">Compras</option>
                <option value="Gastos">Gastos Generales</option>
                <option value="Sueldos">Sueldos</option>
                <option value="Servicios">Servicios</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-slate-50 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Cancelar</button>
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-[2] py-4 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg disabled:opacity-50 ${type === 'entry' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'}`}
            >
              Confirmar Movimiento
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
