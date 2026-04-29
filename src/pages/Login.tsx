import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';

export default function Login() {
  const { login } = useAuth();
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 w-full max-w-md text-center"
      >
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg shadow-red-200">
          Q
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Bienvenido a Que Pollo</h1>
        <p className="text-slate-500 mb-8">Gestión integral para distribuidoras</p>
        
        <button 
          onClick={login}
          className="flex items-center justify-center gap-3 w-full py-3 px-6 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continuar con Google
        </button>
        
        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Distribuciones Del Sur
        </p>
      </motion.div>
    </div>
  );
}
