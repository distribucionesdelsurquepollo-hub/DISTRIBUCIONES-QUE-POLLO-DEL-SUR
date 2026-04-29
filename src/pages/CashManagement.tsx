import React, { useEffect, useState } from 'react';
import { CashSession, CashMovement, Role } from '../types';
import { getCurrentSession, openSession, addMovement, getSessionDate } from '../services/cashService';
import { useAuth } from '../hooks/useAuth';
import { 
  Banknote, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History,
  Lock,
  Unlock,
  AlertCircle,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CashManagement() {
  const { profile } = useAuth();
  const [session, setSession] = useState<CashSession | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoveModal, setShowMoveModal] = useState<'entry' | 'exit' | null>(null);
  const [initialBase, setInitialBase] = useState(0);

  const isAdmin = profile?.role === Role.ADMIN;
  const sessionDate = getSessionDate();

  useEffect(() => {
    const fetchData = async () => {
      const current = await getCurrentSession();
      setSession(current);
      setLoading(false);
    };
    fetchData();

    const q = query(
      collection(db, 'cashMovements'), 
      where('date', '>=', new Date(new Date().setHours(0,0,0,0))),
      orderBy('date', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMovements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashMovement)));
    });

    return () => unsub();
  }, []);

  const handleOpenSession = async () => {
    if (initialBase < 0) return;
    try {
      await openSession(initialBase);
      const current = await getCurrentSession();
      setSession(current);
    } catch (e) {
      console.error(e);
      alert('Error al abrir caja');
    }
  };

  if (loading) return <div>Cargando Caja...</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Caja</h1>
          <p className="text-slate-500 text-sm">Control diario de ingresos y egresos de efectivo.</p>
        </div>
        <div className="flex bg-white px-4 py-2 rounded-xl border border-slate-200 items-center gap-2">
          <History size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{sessionDate}</span>
        </div>
      </header>

      {!session ? (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 text-center max-w-xl mx-auto"
        >
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Caja Cerrada</h2>
          <p className="text-slate-500 mb-8 font-medium">Ingresa la base inicial para abrir la jornada operativa de hoy.</p>
          
          <div className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Base Inicial (COP)</label>
              <input 
                type="number" 
                value={initialBase}
                onChange={e => setInitialBase(parseFloat(e.target.value))}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono font-bold text-xl text-center"
              />
            </div>
            <button 
              onClick={handleOpenSession}
              className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Unlock size={18} />
              Abrir Caja
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-900"><Banknote size={60} /></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Base Inicial</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(session.initialBase)}</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Entradas</p>
                <p className="text-2xl font-black text-emerald-700">+{formatCurrency(session.totalEntries)}</p>
              </div>
              <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Total Salidas</p>
                <p className="text-2xl font-black text-red-700">-{formatCurrency(session.totalExits)}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                   <History size={18} className="text-slate-400" />
                   Movimientos del Día
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {movements.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 p-12 text-center flex-col">
                    <AlertCircle size={40} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">No se han registrado movimientos de caja el día de hoy.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="px-6 py-4">Hora</th>
                        <th className="px-6 py-4">Justificación</th>
                        <th className="px-6 py-4 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {movements.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-slate-500">
                             {m.date?.toDate?.() ? m.date.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">{m.reason}</p>
                          </td>
                          <td className={cn(
                            "px-6 py-4 text-right font-bold",
                            m.type === 'entry' ? "text-emerald-600" : "text-red-600"
                          )}>
                            {m.type === 'entry' ? '+' : '-'}{formatCurrency(m.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 text-white rotate-12"><Banknote size={100} /></div>
               <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Saldo en Caja</p>
               <h3 className="text-4xl font-black font-mono mb-8">{formatCurrency(session.closingBalance)}</h3>
               
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowMoveModal('entry')}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all active:scale-95"
                  >
                    <ArrowUpCircle size={20} />
                    Entrada
                  </button>
                  <button 
                    onClick={() => setShowMoveModal('exit')}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex flex-col items-center gap-2 transition-all active:scale-95"
                  >
                    <ArrowDownCircle size={20} />
                    Salida
                  </button>
               </div>
            </div>

            <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4">
               <AlertCircle size={24} className="text-amber-500 shrink-0" />
               <div className="space-y-1">
                 <h4 className="text-sm font-bold text-amber-900">Restricción de Horarios</h4>
                 <p className="text-[11px] text-amber-700 leading-relaxed">
                   Las transacciones después de las <b>7:00 PM</b> se registrarán automáticamente en la sesión del día siguiente.
                 </p>
               </div>
            </div>

            {isAdmin && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ajustes Base Inicial</h3>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Nueva Base..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
                  />
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">Actualizar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showMoveModal && (
        <MovementModal 
          type={showMoveModal} 
          onClose={() => {
            setShowMoveModal(null);
            getCurrentSession().then(setSession);
          }} 
          userId={profile?.uid || ''}
        />
      )}
    </div>
  );
}

function MovementModal({ type, onClose, userId }: { type: 'entry' | 'exit'; onClose: () => void; userId: string }) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !reason) return;
    setSaving(true);
    try {
      await addMovement({ type, amount, reason, date: null, userId });
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className={cn("p-6 flex items-center justify-between text-white", type === 'entry' ? "bg-emerald-600" : "bg-red-600")}>
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            {type === 'entry' ? <ArrowUpCircle /> : <ArrowDownCircle />}
            Registrar {type === 'entry' ? 'Entrada' : 'Salida'}
          </h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto de la Operación</label>
             <input 
              required
              type="number" 
              autoFocus
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold text-2xl text-center"
             />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Justificación Obligatoria</label>
             <textarea 
              required
              placeholder="Describa el motivo del movimiento..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 min-h-[100px] text-sm"
             />
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className={cn(
              "w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg",
              type === 'entry' ? "bg-emerald-600 shadow-emerald-100" : "bg-red-600 shadow-red-100"
            )}
          >
            {saving ? 'Procesando...' : 'Confirmar Movimiento'}
          </button>
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
