import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getBusinessConfig } from '../services/businessService';
import { Purchase, Sale, CartItem } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';

export const generateInvoicePDF = async (data: Purchase | Sale, type: 'compra' | 'venta') => {
  const doc = new jsPDF();
  const config = await getBusinessConfig();
  const isPurchase = type === 'compra';
  
  // Header
  if (config?.logoUrl) {
    try {
      doc.addImage(config.logoUrl, 'PNG', 14, 10, 30, 30);
    } catch (e) {
      console.error("Error loading logo for PDF", e);
    }
  }

  const headerX = config?.logoUrl ? 50 : 14;
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(config?.name || 'QUE POLLO DEL SUR', headerX, 20);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`NIT: ${config?.nit || 'Pendiente'}`, headerX, 26);
  doc.text(`Dirección: ${config?.addressMain || config?.addressWarehouse || ''}`, headerX, 31);
  doc.text(`Tel: ${config?.phone1 || ''} - ${config?.phone2 || ''}`, headerX, 36);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`FACTURA DE ${type.toUpperCase()}`, 140, 20);
  doc.setFontSize(10);
  doc.text(`No: ${data.id?.substring(0, 8).toUpperCase() || 'PROV'}`, 140, 28);
  doc.text(`Fecha: ${data.date?.toDate?.() ? data.date.toDate().toLocaleString() : new Date().toLocaleString()}`, 140, 34);

  // Client / Provider Info
  doc.setDrawColor(240);
  doc.line(14, 45, 196, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(isPurchase ? 'PROVEEDOR:' : 'CLIENTE:', 14, 55);
  doc.setFont('helvetica', 'normal');
  const entityName = isPurchase ? (data as Purchase).providerName : (data as Sale).customerName;
  doc.text(entityName || 'N/A', 45, 55);

  // Table
  autoTable(doc, {
    startY: 65,
    head: [['Descripción', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: data.items.map(item => [
      item.name,
      `${formatNumber(item.qty)} ${item.unit}`,
      formatCurrency(item.price),
      formatCurrency(item.total)
    ]),
    foot: [
      ['', '', 'TOTAL', formatCurrency(data.total)],
      ['', '', 'ABONO', formatCurrency(data.advance || 0)],
      ['', '', 'SALDO', formatCurrency(data.total - (data.advance || 0))]
    ],
    footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
    headStyles: { fillColor: [220, 38, 38] }, // Red 600
    theme: 'striped',
    margin: { top: 65 }
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Gracias por su confianza. Generado automáticamente por Que Pollo del Sur System.', 14, finalY);

  doc.save(`factura-${type}-${data.id || Date.now()}.pdf`);
};
