import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  Users, 
  UserPlus, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Trash2,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function HR() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
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
          <p className="text-slate-500 text-sm">Gestión de personal, nómina y asistencia.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
        >
          <UserPlus size={18} />
          Nuevo Empleado
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Personal</h2>
          <div className="space-y-3">
            {employees.map(emp => (
              <button 
                key={emp.id}
                onClick={() => setSelectedEmp(emp)}
                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedEmp?.id === emp.id ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-100' : 'bg-white border-slate-100 text-slate-700 hover:border-red-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedEmp?.id === emp.id ? 'bg-red-500' : 'bg-slate-50 text-slate-400'}`}>
                    <Users size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{emp.name}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${selectedEmp?.id === emp.id ? 'text-red-100' : 'text-slate-400'}`}>{emp.position}</div>
                  </div>
                </div>
                <UserCheck size={16} className={selectedEmp?.id === emp.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedEmp ? (
            <EmployeeDetail employee={selectedEmp} />
          ) : (
            <div className="h-full min-h-[400px] bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-slate-400">
              <Users size={64} className="mb-4 opacity-5" />
              <p className="font-bold uppercase tracking-widest text-xs">Selecciona un empleado para ver detalles</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}

function EmployeeDetail({ employee }: { employee: any }) {
  const [tab, setTab] = useState<'info' | 'attendance' | 'payroll' | 'sanctions' | 'advances'>('info');

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
      <div className="p-8 bg-slate-900 text-white flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black">{employee.name}</h2>
          <p className="font-bold text-red-500 uppercase tracking-[0.2em] text-[10px] mt-1">{employee.position} · ${employee.salary?.toLocaleString()}/mes</p>
        </div>
      </div>

      <div className="flex border-b border-slate-100 px-4">
        {['info', 'attendance', 'payroll', 'sanctions', 'advances'].map((t: any) => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${tab === t ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t === 'info' ? 'Resumen' : 
             t === 'attendance' ? 'Asistencia' :
             t === 'payroll' ? 'Nómina' :
             t === 'sanctions' ? 'Amonestaciones' : 'Adelantos'}
            {tab === t && <motion.div layoutId="tab" className="absolute bottom-0 left-6 right-6 h-1 bg-red-600 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="p-8">
        {tab === 'info' && <EmployeeSummary employee={employee} />}
        {tab === 'attendance' && <AttendanceTab employee={employee} />}
        {tab === 'payroll' && <PayrollTab employee={employee} />}
        {tab === 'sanctions' && <SanctionsTab employee={employee} />}
        {tab === 'advances' && <AdvancesTab employee={employee} />}
      </div>
    </div>
  );
}

// Attendance Component
function AttendanceTab({ employee }: { employee: any }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'attendance'), where('employeeId', '==', employee.id));
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => b.timestamp?.toMillis() - a.timestamp?.toMillis()));
    });
    return () => unsub();
  }, [employee.id]);

  const recordAttendance = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'attendance'), {
        employeeId: employee.id,
        timestamp: serverTimestamp(),
        type: 'clock-in'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Clock size={20} className="text-red-500" />
          Registro de Entrada
        </h3>
        <button 
          onClick={recordAttendance}
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-100 disabled:opacity-50"
        >
          Marcar Entrada Hoy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map(h => (
          <div key={h.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Presente</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {h.timestamp ? format(h.timestamp.toDate(), 'PPP p') : 'Sincronizando...'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black py-1 px-2 bg-emerald-100 text-emerald-600 rounded uppercase">A tiempo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Advances Component with 30% Restriction
function AdvancesTab({ employee }: { employee: any }) {
  const [advances, setAdvances] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'advances'), where('employeeId', '==', employee.id));
    const unsub = onSnapshot(q, (snap) => {
      setAdvances(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [employee.id]);

  const maxAdvance = (employee.salary || 0) * 0.3;
  const currentTotal = advances.filter(a => {
    const date = a.timestamp?.toDate();
    if (!date) return false;
    return isWithinInterval(date, { 
      start: startOfMonth(new Date()), 
      end: endOfMonth(new Date()) 
    });
  }).reduce((a, b) => a + b.amount, 0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (currentTotal + val > maxAdvance) {
      alert(`Límite excedido. El adelanto máximo permitido es del 30% del sueldo ($${maxAdvance.toLocaleString()}).`);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'advances'), {
        employeeId: employee.id,
        amount: val,
        timestamp: serverTimestamp(),
        description: 'Adelanto de nómina'
      });
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl text-amber-500 shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-amber-900">Regla de Adelanto</h4>
            <p className="text-sm text-amber-700 mt-1">Los adelantos no pueden superar el 30% del sueldo base mensual del empleado.</p>
            <div className="mt-4 flex gap-8">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500">Límite Mensual</span>
                <div className="text-xl font-black text-amber-900">${maxAdvance.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500">Utilizado</span>
                <div className="text-xl font-black text-amber-900">${currentTotal.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500">Disponible</span>
                <div className="text-xl font-black text-emerald-600">${(maxAdvance - currentTotal).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-4 items-end bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Solicitar Adelanto ($)</label>
          <input 
            required 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            placeholder="Monto a solicitar..."
          />
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          Confirmar
        </button>
      </form>

      <div className="space-y-3">
        {advances.map(a => (
          <div key={a.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400">
                <DollarSign size={16} />
              </div>
              <span className="text-sm font-bold text-slate-700">{format(a.timestamp?.toDate() || new Date(), 'PPP')}</span>
            </div>
            <span className="font-black text-slate-900">-${a.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mock Salary Summary (Admin only view)
function PayrollTab({ employee }: { employee: any }) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl shadow-slate-200">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black uppercase tracking-widest text-sm text-slate-400">Estado de Nómina Actual</h3>
          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black">ABRIL 2024</span>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sueldo Base</div>
            <div className="text-3xl font-black">${employee.salary?.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</div>
            <div className="text-3xl font-black text-red-500">${(employee.salary || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SanctionsTab({ employee }: { employee: any }) {
  const [sanctions, setSanctions] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'sanctions'), where('employeeId', '==', employee.id));
    const unsub = onSnapshot(q, (snap) => {
      setSanctions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [employee.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-600" />
          Control de Conducta
        </h3>
        <button onClick={() => setShowAdd(true)} className="text-xs font-black text-red-600 uppercase border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50">
          Registrar Amonestación
        </button>
      </div>

      <div className="space-y-4">
        {sanctions.map(s => (
          <div key={s.id} className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4">
            <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-black text-red-900 uppercase text-xs tracking-widest">{s.type}</h4>
              <p className="text-sm text-red-700 mt-1 font-medium">{s.reason}</p>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mt-3 block">
                {format(s.timestamp?.toDate() || new Date(), 'PPP')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <SanctionModal employee={employee} onClose={() => setShowAdd(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmployeeSummary({ employee }: { employee: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Información General</h4>
          <div className="space-y-2">
            <div className="p-4 bg-slate-50 rounded-2xl flex justify-between">
              <span className="text-sm text-slate-500">Documento</span>
              <span className="text-sm font-bold text-slate-900">{employee.document || '---'}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl flex justify-between">
              <span className="text-sm text-slate-500">Teléfono</span>
              <span className="text-sm font-bold text-slate-900">{employee.phone || '---'}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl flex justify-between">
              <span className="text-sm text-slate-500">Fecha Ingreso</span>
              <span className="text-sm font-bold text-slate-900">{employee.entryDate || '---'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center">
        <Calendar size={48} className="text-slate-200 mb-4" />
        <h3 className="font-bold text-slate-900">Fichajes Totales</h3>
        <p className="text-4xl font-black text-red-600 mt-2">12</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Este mes</p>
      </div>
    </div>
  );
}

function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', position: '', salary: '', phone: '', document: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'employees'), {
        ...formData,
        salary: parseFloat(formData.salary),
        entryDate: format(new Date(), 'yyyy-MM-dd')
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <h2 className="text-xl font-black uppercase text-slate-900 mb-6">Registar Nuevo Operativo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre Completo</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puesto</label>
              <input required type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sueldo Base Mensual</label>
              <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm mt-4 disabled:opacity-50">Guardar Ficha</button>
        </form>
      </motion.div>
    </div>
  );
}

function SanctionModal({ employee, onClose }: { employee: any, onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [type, setType] = useState('Leve');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'sanctions'), {
      employeeId: employee.id,
      reason,
      type,
      timestamp: serverTimestamp()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <ShieldAlert size={24} />
            <h2 className="text-xl font-black uppercase tracking-tighter">Nueva Amonestación</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400">Gravedad</label>
               <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                 <option>Leve</option>
                 <option>Grave</option>
                 <option>Muy Grave</option>
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400">Motivo de la Falta</label>
               <textarea required value={reason} onChange={e => setReason(e.target.value)} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Describe el incidente..."></textarea>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Registrar Incidente</button>
        </form>
      </motion.div>
    </div>
  );
}
