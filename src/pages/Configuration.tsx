import React, { useEffect, useState } from 'react';
import { BusinessConfig } from '../types';
import { getBusinessConfig, saveBusinessConfig } from '../services/businessService';
import { Save, Building2, Phone, MapPin, Mail, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Configuration() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>({
    name: 'DISTRIBUCIONES QUE POLLO DEL SUR',
    nit: '',
    phone1: '3173315203',
    phone2: '',
    addressMain: '',
    addressWarehouse: 'Calle 9 CR 11-33 El Carmen',
    email: 'distribucionesdelsurquepollo@gmail.com',
    manager: 'Jorge Luis Lasprilla',
    logoUrl: ''
  });

  useEffect(() => {
    const loadConfig = async () => {
      const data = await getBusinessConfig();
      if (data) setConfig(data);
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveBusinessConfig(config);
      alert('Configuración guardada correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configuración de la Empresa</h1>
        <p className="text-slate-500 text-sm">Gestiona la información que aparece en facturas y reportes.</p>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Building2 size={12} />
              Nombre de la Empresa
            </label>
            <input 
              type="text" 
              value={config.name}
              onChange={e => setConfig({...config, name: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Building2 size={12} />
              NIT
            </label>
            <input 
              type="text" 
              value={config.nit}
              onChange={e => setConfig({...config, nit: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
              placeholder="Pendiente"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Phone size={12} />
              Teléfono Principal
            </label>
            <input 
              type="text" 
              value={config.phone1}
              onChange={e => setConfig({...config, phone1: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Phone size={12} />
              Teléfono Alternativo
            </label>
            <input 
              type="text" 
              value={config.phone2}
              onChange={e => setConfig({...config, phone2: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <MapPin size={12} />
              Dirección Principal
            </label>
            <input 
              type="text" 
              value={config.addressMain}
              onChange={e => setConfig({...config, addressMain: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <MapPin size={12} />
              Dirección de Bodega
            </label>
            <input 
              type="text" 
              value={config.addressWarehouse}
              onChange={e => setConfig({...config, addressWarehouse: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Mail size={12} />
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={config.email}
              onChange={e => setConfig({...config, email: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <User size={12} />
              Gerente
            </label>
            <input 
              type="text" 
              value={config.manager}
              onChange={e => setConfig({...config, manager: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none" 
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              Logo (URL o Base64)
            </label>
            <input 
              type="text" 
              value={config.logoUrl || ''}
              onChange={e => setConfig({...config, logoUrl: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none font-mono text-[10px]" 
              placeholder="data:image/png;base64,..."
            />
            {config.logoUrl && (
              <div className="mt-2 p-2 border border-dashed border-slate-200 rounded-lg inline-block">
                <img src={config.logoUrl} alt="Preview" className="max-h-24" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-red-100"
          >
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
