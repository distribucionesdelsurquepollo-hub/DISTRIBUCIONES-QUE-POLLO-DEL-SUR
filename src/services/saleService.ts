import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sale } from '../types';
import { updateStock } from './productService';

export const subscribeToSales = (callback: (data: Sale[]) => void) => {
  const q = query(collection(db, 'sales'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
  });
};

export const createSale = async (sale: Omit<Sale, 'id'>) => {
  const docRef = await addDoc(collection(db, 'sales'), {
    ...sale,
    date: serverTimestamp()
  });

  // Update inventory
  for (const item of sale.items) {
    await updateStock(item.productId, -item.qty);
  }

  return docRef.id;
};
