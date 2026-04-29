"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { UserCog, UserPlus, Mail, Shield, Trash2, Key, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/button';
import { Role } from '@/src/types';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.SELLER
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // We use email as ID for simplicity in our mock auth implementation
      const userRef = doc(db, 'users', newUser.email.replace(/\./g, '_'));
      await setDoc(userRef, {
        ...newUser,
        createdAt: new Date().toISOString()
      });
      setShowAdd(false);
      setNewUser({ name: '', email: '', password: '', role: Role.SELLER });
    } catch (error) {
      console.error(error);
      alert('Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-slate-500 text-sm italic">Control de acceso y roles del personal.</p>
        </div>
        <Button 
          onClick={() => setShowAdd(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-2 h-auto font-bold uppercase tracking-widest text-xs"
        >
          <UserPlus size={18} className="mr-2" /> Nuevo Usuario
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {showAdd && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[2rem] border-2 border-red-100 shadow-xl shadow-red-50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                   <Shield size={18} />
                 </button>
              </div>
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-6">Crear Nuevo Perfil</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      required 
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                    <input 
                      type="password" 
                      required 
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      <option value={Role.SELLER}>Vendedor</option>
                      <option value={Role.ADMIN}>Administrador</option>
                    </select>
                 </div>
                 <Button 
                   type="submit" 
                   disabled={loading}
                   className="w-full mt-4 bg-red-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-[10px]"
                 >
                   {loading ? 'Guardando...' : 'Confirmar Registro'}
                 </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {users.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${u.role === Role.ADMIN ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                 {u.role === Role.ADMIN ? <Shield size={24} /> : <UserIcon size={24} />}
               </div>
               <button 
                 onClick={() => handleDelete(u.id)}
                 className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
               >
                 <Trash2 size={16} />
               </button>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">{u.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{u.email}</p>
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === Role.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                 {u.role}
               </span>
               <div className="flex items-center gap-1 text-slate-300">
                  <Key size={12} />
                  <span className="text-[10px] font-mono">••••••••</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
