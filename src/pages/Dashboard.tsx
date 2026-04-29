import React, { useEffect, useState } from 'react';
import { 
  getFinancialReport 
} from '../services/reportService';
import { subscribeToProducts } from '../services/productService';
import { Product } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  Download,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { startOfMonth, endOfMonth } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const [report, setReport] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      const res = await getFinancialReport(start, end);
      setReport(res);
      setLoading(false);
    };
    fetchData();

    return subscribeToProducts(setProducts);
  }, []);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const chartData = [
    { name: 'Ingresos', value: report?.totalIncome || 0, color: '#10b981' },
    { name: 'Egresos', value: report?.totalExpense || 0, color: '#ef4444' },
    { name: 'Utilidad', value: report?.netProfit || 0, color: '#3b82f6' }
  ];

  const exportFinancialPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Reporte Financiero Mensual', 14, 22);
    doc.setFontSize(10);
    doc.text(`Periodo: ${startOfMonth(new Date()).toLocaleDateString()} al ${endOfMonth(new Date()).toLocaleDateString()}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Concepto', 'Valor']],
      body: [
        ['Total Ingresos (Ventas)', formatCurrency(report.totalIncome)],
        ['Total Egresos (Compras)', formatCurrency(report.totalExpense)],
        ['Costo de Ventas (Propio)', formatCurrency(report.calculatedCostOfGoodsSold)],
        ['Utilidad Bruta', formatCurrency(report.grossProfit)],
        ['Flujo de Caja Neto', formatCurrency(report.netProfit)]
      ],
      theme: 'striped'
    });

    doc.save('reporte-financiero.pdf');
  };

  if (loading) return <div>Cargando Dashboard...</div>;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 text-sm italic">Resumen de operaciones mes actual.</p>
        </div>
        <button 
          onClick={exportFinancialPDF}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={14} /> Reporte PDF
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Ingresos Mes" 
          value={formatCurrency(report?.totalIncome)} 
          icon={TrendingUp} 
          trend="+12%" 
          color="emerald" 
        />
        <StatCard 
          label="Egresos Mes" 
          value={formatCurrency(report?.totalExpense)} 
          icon={TrendingDown} 
          trend="-5%" 
          color="red" 
        />
        <StatCard 
          label="Utilidad Neta" 
          value={formatCurrency(report?.netProfit)} 
          icon={DollarSign} 
          trend="Estable" 
          color="blue" 
        />
        <StatCard 
          label="Ventas Realizadas" 
          value={report?.salesCount} 
          icon={ShoppingCart} 
          trend="Activo" 
          color="slate" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest">
                <BarChart3 size={16} className="text-slate-400" /> Comparativa Financiera
              </h3>
           </div>
           <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Alerts & Stock */}
        <div className="space-y-6">
           <div className="bg-red-600 p-8 rounded-3xl text-white shadow-xl shadow-red-100 flex flex-col justify-between h-full">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 opacity-80 uppercase text-[10px] font-black tracking-[0.2em]">
                    <AlertTriangle size={14} /> Alertas de Inventario
                 </div>
                 <h3 className="text-3xl font-black">{lowStockProducts.length}</h3>
                 <p className="text-xs opacity-80 font-medium leading-relaxed italic">
                    Productos que han alcanzado o están por debajo de su stock mínimo de seguridad.
                 </p>
                 
                 <div className="space-y-2 mt-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {lowStockProducts.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                        <span className="text-xs font-bold">{p.name}</span>
                        <span className="text-xs font-mono font-black italic">{p.stock} {p.unit}</span>
                      </div>
                    ))}
                    {lowStockProducts.length === 0 && (
                      <div className="text-center py-4 text-xs font-bold opacity-50 uppercase tracking-widest">Stock Saludable</div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom detailed logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-3xl border border-slate-200">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Rentabilidad por Producto (Top)</h3>
           <div className="space-y-4">
              {products.slice(0, 5).sort((a, b) => (b.salePrice - b.purchasePrice) - (a.salePrice - a.purchasePrice)).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-colors">
                  <span className="text-sm font-bold text-slate-800">{p.name}</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">+{formatCurrency(p.salePrice - p.purchasePrice)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Margen Bruto</p>
                  </div>
                </div>
              ))}
           </div>
         </div>

         <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-center">
            <h3 className="text-xs font-black opacity-50 uppercase tracking-widest mb-2">Resumen Operativo</h3>
            <div className="grid grid-cols-2 gap-8 mt-4">
               <div>
                 <p className="text-[10px] font-black uppercase opacity-40">Eficiencia</p>
                 <p className="text-2xl font-black">94.2%</p>
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase opacity-40">Retención</p>
                 <p className="text-2xl font-black">88%</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase opacity-40">Ticket Promedio</p>
                  <p className="text-xl font-bold">{formatCurrency((report?.totalIncome / report?.salesCount) || 0)}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase opacity-40">Entregas</p>
                  <p className="text-2xl font-black">124</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: { label: string, value: any, icon: any, trend: string, color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-600 border-red-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border", colors[color])}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      </div>
      <div className="mt-4 flex items-center gap-2">
         <span className={cn(
           "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
           trend.includes('+') ? "bg-emerald-100 text-emerald-700" : trend.includes('-') ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
         )}>
           {trend}
         </span>
         <span className="text-[10px] text-slate-400 font-bold uppercase italic">vs Periodo Anterior</span>
      </div>
    </motion.div>
  );
}
