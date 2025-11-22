
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Operation, StockLedgerEntry } from '../types';
import { MOCK_PRODUCTS, MOCK_OPERATIONS, MOCK_LEDGER } from '../constants';

interface StoreContextType {
  products: Product[];
  operations: Operation[];
  ledger: StockLedgerEntry[];
  addProduct: (product: Product) => void;
  addOperation: (op: Operation) => void;
  updateOperation: (id: string, op: Partial<Operation>) => void;
  validateOperation: (id: string) => void;
  deleteOperation: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  // Initialize with mock data
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [operations, setOperations] = useState<Operation[]>(MOCK_OPERATIONS);
  const [ledger, setLedger] = useState<StockLedgerEntry[]>(MOCK_LEDGER);

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const addOperation = (op: Operation) => {
    setOperations(prev => [op, ...prev]);
  };

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    setOperations(prev => prev.map(o => o.id === id ? { ...o, ...updates, lastEditedBy: 'Admin', version: (o.version || 1) + 1 } : o));
  };

  const deleteOperation = (id: string) => {
    setOperations(prev => prev.filter(o => o.id !== id));
  }

  const addToLedger = (entry: StockLedgerEntry) => {
    setLedger(prev => [entry, ...prev]);
  };

  // CORE BUSINESS LOGIC
  const validateOperation = (id: string) => {
    const op = operations.find(o => o.id === id);
    if (!op || op.status === 'DONE') return;

    // 1. STRICT VALIDATION CHECKS
    if (op.type === 'DELIVERY' || op.type === 'INTERNAL') {
      for (const item of op.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          alert(`Error: Product ${item.productName} not found.`);
          return;
        }
        if (product.quantity < item.quantity) {
          alert(`Validation Failed: Insufficient stock for ${product.name}.\nAvailable: ${product.quantity}\nRequired: ${item.quantity}`);
          return;
        }
      }
    }

    // 2. UPDATE STATUS
    const updatedOps = operations.map(o => 
      o.id === id ? { ...o, status: 'DONE' as const } : o
    );
    setOperations(updatedOps);

    // 3. PROCESS STOCK IMPACT
    op.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      let newQty = product.quantity;
      let newLocation = product.location;
      let ledgerType: 'IN' | 'OUT' | 'ADJ' | 'MOVE' = 'IN';
      let debit = 0;
      let credit = 0;
      let logLocation = op.destLocation || op.sourceLocation || product.location;

      switch (op.type) {
        case 'RECEIPT':
          newQty += item.quantity;
          debit = item.quantity;
          ledgerType = 'IN';
          logLocation = op.destLocation || 'WH-Main'; 
          // If product was out of stock or new, set location to inbound location
          if (product.quantity === 0 && op.destLocation) {
             newLocation = op.destLocation;
          }
          break;
        
        case 'DELIVERY':
          newQty -= item.quantity;
          credit = item.quantity;
          ledgerType = 'OUT';
          logLocation = op.sourceLocation || 'WH-Dispatch';
          break;
        
        case 'INTERNAL':
          ledgerType = 'MOVE';
          debit = item.quantity;
          credit = item.quantity;
          logLocation = `${op.sourceLocation} → ${op.destLocation}`;
          // LOGIC: If moving entire stock, update the product's main location reference
          if (item.quantity >= product.quantity && op.destLocation) {
             newLocation = op.destLocation;
          }
          break;

        case 'ADJUSTMENT':
          const diff = item.quantity - product.quantity; // item.quantity here is the "Physical Count"
          newQty = item.quantity;
          ledgerType = 'ADJ';
          if (diff > 0) {
             debit = diff;
          } else {
             credit = Math.abs(diff);
          }
          logLocation = op.sourceLocation || product.location;
          break;
      }

      // Update Product State
      if (newQty !== product.quantity || newLocation !== product.location) {
        setProducts(prev => prev.map(p => 
          p.id === product.id ? { ...p, quantity: newQty, location: newLocation } : p
        ));
      }

      // Add Ledger Entry
      addToLedger({
        id: `leg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toLocaleString(),
        reference: op.reference,
        productName: product.name,
        sku: product.sku,
        location: logLocation,
        debit,
        credit,
        balance: newQty,
        user: op.responsible || 'Admin',
        type: ledgerType
      });
    });
  };

  return (
    <StoreContext.Provider value={{ products, operations, ledger, addProduct, addOperation, updateOperation, validateOperation, deleteOperation }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
