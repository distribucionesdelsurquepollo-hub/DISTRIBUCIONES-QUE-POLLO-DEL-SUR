import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sale, Purchase, Product } from '../types';

export const getFinancialReport = async (startDate: Date, endDate: Date) => {
  // Fetch Sales
  const salesQuery = query(
    collection(db, 'sales'),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const salesSnap = await getDocs(salesQuery);
  const sales = salesSnap.docs.map(doc => doc.data() as Sale);

  // Fetch Purchases
  const purchasesQuery = query(
    collection(db, 'purchases'),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const purchasesSnap = await getDocs(purchasesQuery);
  const purchases = purchasesSnap.docs.map(doc => doc.data() as Purchase);

  const totalIncome = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpense = purchases.reduce((sum, p) => sum + p.total, 0);
  
  // Calculate profit by comparing sale total vs hypothetical cost
  // In a real system, we'd track unit cost per sale
  // Here we'll approximate using current product cost
  const productsSnap = await getDocs(collection(db, 'products'));
  const products = productsSnap.docs.reduce((acc, doc) => {
    acc[doc.id] = doc.data() as Product;
    return acc;
  }, {} as Record<string, Product>);

  let calculatedCostOfGoodsSold = 0;
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const prod = products[item.productId];
      if (prod) {
        calculatedCostOfGoodsSold += item.qty * prod.purchasePrice;
      }
    });
  });

  const grossProfit = totalIncome - calculatedCostOfGoodsSold;

  return {
    totalIncome,
    totalExpense,
    calculatedCostOfGoodsSold,
    grossProfit,
    netProfit: totalIncome - totalExpense, // Simple cash flow profit
    salesCount: sales.length,
    purchasesCount: purchases.length
  };
};
