"use client";

import React, { useEffect, useState } from 'react';
import { BusinessConfig } from '@/src/types';
import { getBusinessConfig, saveBusinessConfig } from '@/src/services/businessService';
import { Save, Building2, Phone, MapPin, Mail, User, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/button';

export default function ConfigurationPage() {
  const [config, setConfig] = useState<BusinessConfig>({
    name: 'Distribuciones Que Pollo Del Sur',
    nit: '',
    phone1: '',
    phone2: '',
    addressMain: '',
    addressWarehouse: '',
    email: '',
    manager: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await getBusinessConfig();
      if (data) setConfig(data);
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveBusinessConfig(config);
      setMessage('Configuración guardada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm">Datos de la empresa y personalización del sistema.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Building2 size={16} /> Información Legal
            </h3>
            {message && (
              <span className={`text-xs font-bold ${message.includes('Error') ? 'text-red-500' : 'text-emerald-500'}`}>
                {message}
              </span>
            )}
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ConfigInput 
              label="Nombre Comercial" 
              icon={Building2} 
              value={config.name} 
              onChange={v => setConfig({...config, name: v})} 
            />
            <ConfigInput 
              label="NIT / Identificación Fiscal" 
              icon={ShieldAlert} 
              value={config.nit} 
              onChange={v => setConfig({...config, nit: v})} 
            />
            <ConfigInput 
              label="Dirección Principal" 
              icon={MapPin} 
              value={config.addressMain} 
              onChange={v => setConfig({...config, addressMain: v})} 
            />
            <ConfigInput 
              label="Teléfono 1" 
              icon={Phone} 
              value={config.phone1} 
              onChange={v => setConfig({...config, phone1: v})} 
            />
            <ConfigInput 
              label="Email Corporativo" 
              icon={Mail} 
              value={config.email} 
              onChange={v => setConfig({...config, email: v})} 
            />
            <ConfigInput 
              label="Gerente / Representante" 
              icon={User} 
              value={config.manager} 
              onChange={v => setConfig({...config, manager: v})} 
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
               {config.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <ImageIcon size={24} />}
             </div>
             <div>
               <h4 className="font-bold text-slate-900">Logo de la Empresa</h4>
               <p className="text-xs text-slate-500">Se usará en facturas PDF automáticamente.</p>
             </div>
          </div>
          <input 
            type="text" 
            placeholder="URL del logo (JPG/PNG)" 
            className="flex-1 max-w-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            value={config.logoUrl || ''}
            onChange={e => setConfig({...config, logoUrl: e.target.value})}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 h-auto font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-slate-200"
          >
            <Save size={18} className="mr-2" /> 
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ShieldAlert({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>; }

function ConfigInput({ label, icon: Icon, value, onChange }: { label: string, icon: any, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </div>
        <input 
          type="text" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-red-500 transition-all font-medium text-sm text-slate-800 shadow-inner"
        />
      </div>
    </div>
  );
}
