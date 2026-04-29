"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  Users, 
  UserPlus, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  ShieldAlert,
  Calendar,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Button } from '@/src/components/ui/button';

export default function RRHHPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snap) => {
      setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recursos Humanos</h1>
          <p className="text-slate-500 text-sm italic">Gestión de personal operativo y administrativo.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 rounded-xl font-bold uppercase tracking-widest text-xs px-6 h-auto py-3 text-white">
          <UserPlus size={18} className="mr-2" /> Nuevo Empleado
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {employees.map(emp => (
            <button 
              key={emp.id}
              onClick={() => setSelectedEmp(emp)}
              className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedEmp?.id === emp.id ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-100' : 'bg-white border-slate-100 text-slate-700 hover:border-red-200'}`}
            >
              <div className="flex items-center gap-3 text-left">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedEmp?.id === emp.id ? 'bg-red-500' : 'bg-slate-50 text-slate-400'}`}>
                   <Users size={20} />
                 </div>
                 <div>
                   <div className="font-bold text-sm truncate">{emp.name}</div>
                   <div className={`text-[9px] font-black uppercase tracking-widest ${selectedEmp?.id === emp.id ? 'text-red-100' : 'text-slate-400'}`}>{emp.position}</div>
                 </div>
              </div>
            </button>
          ))}
          {employees.length === 0 && (
             <div className="text-center py-10 text-slate-300 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-100 rounded-3xl">
               Sin Personal Registrado
             </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selectedEmp ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
               <div className="p-8 bg-slate-900 text-white">
                 <h2 className="text-3xl font-black">{selectedEmp.name}</h2>
                 <p className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px] mt-1">{selectedEmp.position} · ${selectedEmp.salary?.toLocaleString()}/mes</p>
               </div>
               <div className="p-12 text-center text-slate-400">
                 <UserCheck size={64} className="mx-auto mb-6 opacity-5" />
                 <p className="text-xs font-black uppercase tracking-widest">Información detallada en proceso...</p>
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-white rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300">
              <Users size={48} className="mb-4 opacity-10" />
              <p className="font-bold uppercase tracking-widest text-[10px]">Selecciona un perfil para ver su ficha</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
