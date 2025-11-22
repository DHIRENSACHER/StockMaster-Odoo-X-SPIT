
import React, { useState } from 'react';
import { RefreshCw, Plus, X, Search, Trash2, AlertOctagon, Copy, FileEdit } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { GlassCard } from '../../components/GlassCard';
import { Operation, OperationItem } from '../../types';

export default function Adjustments() {
  const { operations, products, addOperation, updateOperation, validateOperation, deleteOperation } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inventoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('WH-Main');
  const [selectedItems, setSelectedItems] = useState<OperationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const existing = selectedItems.find(i => i.productId === productId);
      if (!existing) {
         setSelectedItems([...selectedItems, { productId: prod.id, productName: prod.name, quantity: prod.quantity }]);
      }
      setSearchTerm('');
      setIsAddingProduct(false);
    }
  };

  const handleEdit = (op: Operation) => {
    if (op.sourceLocation) setLocation(op.sourceLocation);
    setSelectedItems(op.items);
    setEditingId(op.id);
    setShowCreate(true);
  };

  const handleDuplicate = (op: Operation) => {
    const newOp: Operation = {
        ...op,
        id: `adj-${Date.now()}`,
        reference: `INV/ADJ/${String(operations.length + 1001).padStart(4, '0')}`,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        items: [...op.items]
    };
    addOperation(newOp);
  };

  const handleCreate = (validateNow: boolean = false) => {
     if (selectedItems.length === 0) { alert('Add products to adjust'); return; }

     if (editingId) {
        // UPDATE
        updateOperation(editingId, {
            sourceLocation: location,
            items: selectedItems,
        });
        if (validateNow) setTimeout(() => validateOperation(editingId), 100);
     } else {
        // CREATE
        const newOp: Operation = {
            id: `adj-${Date.now()}`,
            type: 'ADJUSTMENT',
            reference: `INV/ADJ/${String(operations.length + 1001).padStart(4, '0')}`,
            contact: 'Internal',
            responsible: 'Admin',
            scheduledDate: inventoryDate,
            status: 'DRAFT',
            items: selectedItems, // Here 'quantity' means 'Counted Quantity'
            sourceLocation: location,
            createdAt: new Date().toISOString()
        };
        addOperation(newOp);
        if (validateNow) setTimeout(() => validateOperation(newOp.id), 100);
     }
     resetForm();
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setSelectedItems([]);
    setSearchTerm('');
    setIsAddingProduct(false);
  };

  const adjs = operations.filter(o => o.type === 'ADJUSTMENT');

  return (
    <div className="space-y-6 animate-slide-up pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Stock Adjustments</h1>
          <p className="text-gray-400 text-sm mt-1">Correct stock levels based on physical counts.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primaryLight text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(109,40,217,0.4)] transition-all hover:scale-105">
          <Plus size={18} /> Start Inventory Count
        </button>
      </div>

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
           <div className="w-full max-w-5xl bg-[#02010A] border border-primary/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg"><RefreshCw className="text-purple-400" size={20}/></div>
                    <div>
                        <div className="text-white font-bold tracking-wide text-sm uppercase">{editingId ? 'Edit Count' : 'Inventory Adjustment'}</div>
                        <div className="text-gray-500 text-xs font-mono">Reference: {editingId ? operations.find(o => o.id === editingId)?.reference : 'AUTO-GENERATED'}</div>
                    </div>
                 </div>
                 <button onClick={resetForm} className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="mb-8">
                    <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Location to Count</label>
                    <select value={location} onChange={e => setLocation(e.target.value)} className="w-full md:w-1/2 bg-[#02010A] border border-white/20 rounded-lg py-3 px-4 text-white outline-none focus:border-primary transition-colors">
                       <option>WH-Main</option>
                       <option>WH-Dispatch</option>
                    </select>
                 </div>

                 <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                       <h3 className="text-sm font-bold text-white uppercase tracking-wider">Physical Count</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                       <thead className="bg-black/20">
                          <tr className="text-gray-500 text-xs uppercase tracking-wider">
                             <th className="px-6 py-3 font-medium">Product</th>
                             <th className="px-6 py-3 font-medium text-right">Theoretical</th>
                             <th className="px-6 py-3 font-medium text-right">Real Count</th>
                             <th className="px-6 py-3 font-medium text-right">Diff</th>
                             <th className="px-6 py-3 w-10"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {selectedItems.map((item, idx) => {
                             const prod = products.find(p => p.id === item.productId);
                             const systemStock = prod ? prod.quantity : 0;
                             const diff = item.quantity - systemStock;
                             return (
                                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                   <td className="px-6 py-4 text-white pl-6 font-medium">{item.productName}</td>
                                   <td className="px-6 py-4 text-right text-gray-400">{systemStock}</td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="inline-flex items-center bg-[#02010A] rounded-lg border border-white/20 focus-within:border-primary transition-colors">
                                         <input 
                                           type="number" 
                                           value={item.quantity} 
                                           onChange={e => {
                                              const newItems = [...selectedItems];
                                              newItems[idx].quantity = parseInt(e.target.value) || 0;
                                              setSelectedItems(newItems);
                                           }}
                                           className="w-24 bg-transparent text-right text-white p-2 outline-none font-mono font-bold text-sm" 
                                         />
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right font-mono font-bold">
                                      {diff > 0 ? <span className="text-green-400">+{diff}</span> : diff < 0 ? <span className="text-red-400">{diff}</span> : <span className="text-gray-600">-</span>}
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                      <button onClick={() => {
                                          const newItems = [...selectedItems];
                                          newItems.splice(idx, 1);
                                          setSelectedItems(newItems);
                                      }} className="text-gray-600 hover:text-red-400 transition-colors p-2"><Trash2 size={16}/></button>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>

                    {/* INLINE ADD */}
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        {!isAddingProduct ? (
                           <button onClick={() => setIsAddingProduct(true)} className="w-full py-3 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 font-medium text-sm">
                              <Plus size={16} /> Add Product to Count
                           </button>
                        ) : (
                           <div className="animate-fade-in bg-[#02010A] border border-purple-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                                 <Search size={16} className="text-purple-400"/>
                                 <input autoFocus className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600" placeholder="Search products to count..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                 <button onClick={() => setIsAddingProduct(false)} className="text-xs text-gray-500 hover:text-white">Close</button>
                              </div>
                              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                                 {filteredProducts.map(p => (
                                    <button key={p.id} onClick={() => addItem(p.id)} className="w-full text-left p-2 hover:bg-white/10 rounded flex justify-between items-center group transition-colors">
                                       <span className="text-gray-300 group-hover:text-white">{p.name}</span>
                                       <span className="text-xs font-mono text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{p.quantity} current</span>
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                 <button onClick={resetForm} className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium">Discard</button>
                 <div className="flex gap-4">
                    <button onClick={() => handleCreate(false)} className="px-8 py-3 border border-white/10 text-white rounded-xl hover:bg-white/5 transition-colors font-medium">
                        {editingId ? 'Save Changes' : 'Save Draft'}
                    </button>
                    <button onClick={() => handleCreate(true)} className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primaryLight transition-all shadow-[0_0_20px_rgba(109,40,217,0.4)] font-bold">Apply Adjustment</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <GlassCard className="overflow-hidden border-t-0">
        <table className="w-full text-left text-sm">
           <thead className="bg-white/5 text-gray-400">
              <tr>
                 <th className="p-5 font-semibold">Reference</th>
                 <th className="p-5 font-semibold">Location</th>
                 <th className="p-5 font-semibold">Date</th>
                 <th className="p-5 font-semibold">Status</th>
                 <th className="p-5 font-semibold text-right">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
              {adjs.map(op => (
                 <tr key={op.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 font-mono text-primary font-medium">{op.reference}</td>
                    <td className="p-5 text-gray-300">{op.sourceLocation}</td>
                    <td className="p-5 text-gray-400">{op.scheduledDate}</td>
                    <td className="p-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border tracking-wide ${op.status === 'DONE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>{op.status}</span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                       {op.status !== 'DONE' && (
                          <button onClick={() => validateOperation(op.id)} className="text-xs bg-primary hover:bg-primaryLight text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary/20 font-bold hover:scale-105">
                             Validate
                          </button>
                       )}

                       {/* Edit Button */}
                       {op.status === 'DRAFT' && (
                         <button onClick={() => handleEdit(op)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors hover:bg-blue-500/10 rounded-lg" title="Edit">
                           <FileEdit size={16} />
                         </button>
                       )}

                       {/* Duplicate Button */}
                       <button onClick={() => handleDuplicate(op)} className="p-2 text-gray-400 hover:text-purple-400 transition-colors hover:bg-purple-500/10 rounded-lg" title="Duplicate">
                         <Copy size={16} />
                       </button>

                       {/* Delete Button */}
                       {op.status === 'DRAFT' && <button onClick={() => deleteOperation(op.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>}
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
        {adjs.length === 0 && <div className="p-10 text-center text-gray-500">No adjustments found.</div>}
      </GlassCard>
    </div>
  );
}
