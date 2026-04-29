"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWithinInterval, setHours, setMinutes } from 'date-fns';
import { Button } from '@/src/components/ui/button';

export default function CashPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({ balance: 0, entries: 0, exits: 0 });
  const [showMove, setShowMove] = useState(false);
  const [showOpening, setShowOpening] = useState(false);
  const [initialBase, setInitialBase] = useState('');
  const [currentSession, setCurrentSession] = useState<any>(null);

  useEffect(() => {
    // Listen for current day session
    const today = format(new Date(), 'yyyy-MM-dd');
    const unsubSession = onSnapshot(doc(db, 'cash_sessions', today), (doc) => {
      if (doc.exists()) {
        setCurrentSession({ id: doc.id, ...doc.data() });
      } else {
        setCurrentSession(null);
      }
    });

    const unsubTransactions = onSnapshot(collection(db, 'cash_transactions'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = data.sort((a: any, b: any) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
      
      const balance = data.reduce((acc, curr: any) => 
        curr.type === 'entry' ? acc + curr.amount : acc - curr.amount, 0);
      const entries = data.filter((d: any) => d.type === 'entry').reduce((a, b: any) => a + b.amount, 0);
      const exits = data.filter((d: any) => d.type === 'exit').reduce((a, b: any) => a + b.amount, 0);

      setTransactions(sorted);
      setSummary({ balance, entries, exits });
    });

    return () => {
      unsubSession();
      unsubTransactions();
    };
  }, []);

  const handleOpenCash = async () => {
    const amount = parseFloat(initialBase);
    if (isNaN(amount) || amount < 0) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await setDoc(doc(db, 'cash_sessions', today), {
        initialBase: amount,
        openedAt: serverTimestamp(),
        status: 'open'
      });
      
      // Also record as an entry if we want it to reflect in balance immediately
      await addDoc(collection(db, 'cash_transactions'), {
        type: 'entry',
        amount: amount,
        description: 'Base Inicial (Apertura)',
        category: 'Apertura',
        timestamp: serverTimestamp()
      });

      setShowOpening(false);
      setInitialBase('');
    } catch (error) {
      console.error(error);
    }
  };

  const now = new Date();
  const start = setMinutes(setHours(now, 6), 0);
  const end = setMinutes(setHours(now, 19), 0);
  const isWithinTime = isWithinInterval(now, { start, end });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-500 text-sm italic">Control de flujo financiero y base diaria.</p>
        </div>
        <div className="flex items-center gap-3">
          {!currentSession && (
            <Button 
              onClick={() => setShowOpening(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold uppercase tracking-widest text-xs px-6"
            >
              <TrendingUp size={18} className="mr-2" /> Apertura de Caja
            </Button>
          )}
          {currentSession && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black border border-emerald-100 uppercase tracking-widest">
              <CheckCircle2 size={14} /> Caja Abierta
            </div>
          )}
          {!isWithinTime && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-[10px] font-black border border-amber-100 uppercase tracking-widest">
              <Clock size={14} /> Fuera de Horario (6am - 7pm)
            </div>
          )}
          <Button 
            onClick={() => setShowMove(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold uppercase tracking-widest text-xs px-6"
          >
            <ArrowUpRight size={18} className="mr-2" /> Nuevo Movimiento
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {showOpening && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Apertura de Jornada</h3>
              <p className="text-emerald-100 text-sm font-medium mt-1">Ingrese el monto base con el que inicia la caja hoy.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
               <input 
                 type="number" 
                 placeholder="Monto Base ($)"
                 value={initialBase}
                 onChange={e => setInitialBase(e.target.value)}
                 className="flex-1 md:w-48 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:bg-white/20 transition-all font-bold placeholder:text-white/40"
               />
               <Button 
                 onClick={handleOpenCash}
                 className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 h-auto rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg"
               >
                 Confirmar
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Saldo Actual" value={summary.balance} icon={Wallet} color="text-slate-900" />
        <StatCard title="Ingresos Totales" value={summary.entries} icon={ArrowUpRight} color="text-emerald-500" />
        <StatCard title="Egresos Totales" value={summary.exits} icon={ArrowDownLeft} color="text-red-500" />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
             <History size={18} className="text-slate-400" /> Historial Operativo
           </h2>
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
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[160px]">
      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${color} mb-4`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">${value.toLocaleString()}</h3>
      </div>
    </div>
  );
}
