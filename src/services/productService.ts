import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Unit } from '../types';

const COLLECTION = 'products';

export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  });
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  return await addDoc(collection(db, COLLECTION), product);
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, product);
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, COLLECTION, id));
};

export const updateStock = async (id: string, amount: number) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { stock: increment(amount) });
};

export const initializeInventory = async () => {
  const existing = await getProducts();
  if (existing.length > 0) return;

  const initialProducts: Omit<Product, 'id'>[] = [
    // Por KG
    { name: 'Pernil grande', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Pernil mediano', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Alas', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Hueso', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Pollo entero', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Pechuga', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Quesos', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Lácteos' },
    { name: 'Cuajada', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Lácteos' },
    { name: 'Pernil pequeño', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Cachama', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pescado' },
    { name: 'Tilapia', unit: Unit.KG, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pescado' },
    // Por Unidad
    { name: 'Picadas', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Varios' },
    { name: 'Bandeja de hígado', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Bandeja de molleja', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Bolsa de patas', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Bandeja de pescuezo', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Bandeja de corazones', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Menudencia grande', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Menudencia', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Gallina', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
    { name: 'Hielo', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Varios' },
    { name: 'Bandeja de alas', unit: Unit.UNIT, stock: 0, minStock: 0, purchasePrice: 0, salePrice: 0, category: 'Pollo' },
  ];

  for (const p of initialProducts) {
    await addProduct(p);
  }
};
