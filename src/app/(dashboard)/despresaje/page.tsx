"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Scissors, Plus, History, Scale, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/src/components/ui/button';

export default function DeboningPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'deboning_logs'), (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)));
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Despresaje</h1>
          <p className="text-slate-500 text-sm italic">Transformación de pollo entero en presas individuales.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2 h-auto font-bold uppercase tracking-widest text-xs">
          <Plus size={18} className="mr-2" /> Nueva Operación
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
            <History size={16} /> Últimas Operaciones
          </h2>
          <div className="space-y-3">
             {logs.map(log => (
               <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{log.sourceName}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{log.outputs.map((o: any) => o.name).join(', ')}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        {log.timestamp ? format(log.timestamp.toDate(), 'PPP p') : 'Sincronizando...'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-red-600">-{log.sourceQty} Ud</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Procesado</div>
                  </div>
               </div>
             ))}
             {logs.length === 0 && (
               <div className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">Historial Vacío</div>
             )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
              <Scale size={24} className="text-red-500 mb-4" />
              <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-2">Relación de Transformación</h3>
              <p className="text-sm text-slate-400 italic">El despresaje afecta automáticamente el stock del pollo entero y aumenta el stock de cada presa resultante.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
