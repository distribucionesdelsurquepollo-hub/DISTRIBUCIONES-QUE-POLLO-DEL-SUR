import React, { useEffect, useState } from 'react';
import { Employee, Attendance, EmployeeAdvance } from '../types';
import { 
  subscribeToEmployees, 
  addEmployee, 
  updateEmployee, 
  registerCheckIn, 
  registerCheckOut, 
  subscribeToTodayAttendance,
  addAdvance 
} from '../services/hrService';
import { 
  Users, 
  Clock, 
  Wallet, 
  UserPlus, 
  CheckCircle2, 
  XCircle,
  Coffee,
  Utensils,
  AlertCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';

export default function HR() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'advances'>('employees');
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  useEffect(() => {
    const unsubE = subscribeToEmployees(setEmployees);
    const unsubA = subscribeToTodayAttendance(setAttendance);
    return () => { unsubE(); unsubA(); };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recursos Humanos</h1>
          <p className="text-slate-500 text-sm">Gestiona el equipo, asistencia y nómina.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
           <TabButton active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} icon={Users} label="Equipo" />
           <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={Clock} label="Asistencia" />
           <TabButton active={activeTab === 'advances'} onClick={() => setActiveTab('advances')} icon={Wallet} label="Adelantos" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'employees' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="employees">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Nómina de Empleados</h3>
                  <button 
                    onClick={() => setShowAddEmployee(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
                  >
                    <UserPlus size={14} /> Registrar Nuevo
                  </button>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-white">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-6 py-4">Nombre</th>
                      <th className="px-6 py-4">Sueldo Base</th>
                      <th className="px-6 py-4">Límite Adelanto (30%)</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{e.name}</td>
                        <td className="px-6 py-4 font-mono text-sm">{formatCurrency(e.salary)}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{formatCurrency(e.salary * 0.3)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                            e.active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}>
                            {e.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Control de Asistencia del Día</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {employees.filter(e => e.active).map(emp => {
                      const att = attendance.find(a => a.employeeId === emp.id);
                      return (
                        <div key={emp.id} className="p-6 flex items-center justify-between hover:bg-slate-50/30">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl",
                               att ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                             )}>
                               {emp.name.charAt(0)}
                             </div>
                             <div>
                               <p className="font-bold text-slate-900">{emp.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                 {att ? (
                                   <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold uppercase">Presente</span>
                                 ) : (
                                   <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Ausente</span>
                                 )}
                               </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             {!att ? (
                               <button 
                                 onClick={() => registerCheckIn(emp.id!)}
                                 className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                               >
                                 <Clock size={14} /> Registrar Entrada
                               </button>
                             ) : !att.checkOut ? (
                               <button 
                                 onClick={() => registerCheckOut(att.id!)}
                                 className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
                               >
                                 <XCircle size={14} /> Registrar Salida
                               </button>
                             ) : (
                               <div className="text-right">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jornada Completada</p>
                                 <p className="text-xs font-bold text-slate-900">Salida: {att.checkOut?.toDate?.() ? att.checkOut.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}</p>
                               </div>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>

               <div className="space-y-6">
                 <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-widest opacity-80">Reglas de Horarios</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <Coffee size={20} className="opacity-70" />
                          <div className="text-xs">
                            <p className="font-bold">Desayuno</p>
                            <p className="opacity-70">8:15 AM – 8:30 AM</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <Utensils size={20} className="opacity-70" />
                          <div className="text-xs">
                            <p className="font-bold">Almuerzo</p>
                            <p className="opacity-70">12:00 PM – 2:00 PM</p>
                          </div>
                       </div>
                    </div>
                    <div className="h-px bg-white/20 my-4" />
                    <div className="flex gap-3">
                       <AlertCircle size={32} className="opacity-50 shrink-0" />
                       <p className="text-[10px] leading-relaxed opacity-90 italic">
                         "Entrada tarde sin justificación previa deriva en amonestación disciplinaria y posible descuento salarial."
                       </p>
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'advances' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="advances">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm md:col-span-1 h-fit">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Solicitar Adelanto</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Empleado</label>
                        <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                           <option>Seleccione...</option>
                           {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Monto Adelanto</label>
                        <input type="number" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="0" />
                      </div>
                      <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-100">Registrar Adelanto</button>
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-700">
                         <Info size={18} className="shrink-0" />
                         <p className="text-[10px] font-medium leading-relaxed">Solo se permiten adelantos de máximo el 30% del salario base.</p>
                      </div>
                   </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm md:col-span-2">
                   <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                     <h3 className="font-bold text-slate-900">Historial de Adelantos (Quincena)</h3>
                     <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">Abril - 2da Quincena</span>
                   </div>
                   <div className="p-12 text-center text-slate-400 font-medium">
                     No hay adelantos registrados en este periodo.
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddEmployee && (
          <EmployeeModal onClose={() => setShowAddEmployee(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
        active 
          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function EmployeeModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [salary, setSalary] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || salary <= 0) return;
    try {
      await addEmployee({ name, salary, active: true });
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al registrar empleado');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-900 text-white font-bold text-center uppercase tracking-widest">Registrar Nuevo Empleado</div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</label>
             <input autoFocus required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Salario Mensual</label>
             <input required type="number" value={salary} onChange={e => setSalary(parseFloat(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95">Guardar Empleado</button>
        </form>
      </motion.div>
    </div>
  );
}
