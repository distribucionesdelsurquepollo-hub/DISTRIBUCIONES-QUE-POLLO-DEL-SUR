import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Deboning } from '../types';
import { updateStock } from './productService';

export const createDeboningProcess = async (data: Omit<Deboning, 'id'>) => {
  const docRef = await addDoc(collection(db, 'deboning'), {
    ...data,
    date: serverTimestamp()
  });

  // 1. Subtract source product
  await updateStock(data.sourceProductId, -data.sourceQty);

  // 2. Add result items
  for (const item of data.resultItems) {
    await updateStock(item.productId, item.qty);
  }

  return docRef.id;
};
