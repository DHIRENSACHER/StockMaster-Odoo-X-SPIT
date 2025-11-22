
import React, { useState } from 'react';
import { Plus, Truck, CheckCircle2, X, Search, Trash2, AlertTriangle, Box, ArrowRight, Copy, FileEdit } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { GlassCard } from '../../components/GlassCard';
import { Operation, OperationItem } from '../../types';

export default function Deliveries() {
  const { operations, products, addOperation, updateOperation, validateOperation, deleteOperation } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customer, setCustomer] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItems, setSelectedItems] = useState<OperationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
    p.quantity > 0 
  );

  const addItem = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const existing = selectedItems.find(i => i.productId === productId);
      if (existing) {
         if (existing.quantity < prod.quantity) {
            setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i));
         }
      } else {
         setSelectedItems([...selectedItems, { productId: prod.id, productName: prod.name, quantity: 1 }]);
      }
      setSearchTerm('');
      setIsAddingProduct(false);
    }
  };

  const handleEdit = (op: Operation) => {
    setCustomer(op.contact);
    setScheduleDate(op.scheduledDate);
    setSelectedItems(op.items);
    setEditingId(op.id);
    setShowCreate(true);
  };

  const handleDuplicate = (op: Operation) => {
    const newOp: Operation = {
        ...op,
        id: `del-${Date.now()}`,
        reference: `WH/OUT/${String(operations.length + 1001).padStart(4, '0')}`,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        items: [...op.items]
    };
    addOperation(newOp);
  };

  const handleCreate = (validateNow: boolean = false) => {
    if (!customer) { alert('Please enter a customer'); return; }
    if (selectedItems.length === 0) { alert('Please add products'); return; }

    if (editingId) {
       // UPDATE
       updateOperation(editingId, {
           contact: customer,
           scheduledDate: scheduleDate,
           items: selectedItems
       });
       if (validateNow) setTimeout(() => validateOperation(editingId), 100);
    } else {
       // CREATE
       const newOp: Operation = {
          id: `del-${Date.now()}`,
          type: 'DELIVERY',
          reference: `WH/OUT/${String(operations.length + 1001).padStart(4, '0')}`,
          contact: customer,
          responsible: 'Admin',
          scheduledDate: scheduleDate,
          status: 'DRAFT',
          items: selectedItems,
          createdAt: new Date().toISOString(),
          sourceLocation: 'WH-Dispatch'
       };
       addOperation(newOp);
       if (validateNow) {
          setTimeout(() => validateOperation(newOp.id), 100);
       }
    }
    resetForm();
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setCustomer('');
    setSelectedItems([]);
    setSearchTerm('');
    setIsAddingProduct(false);
  };

  const deliveries = operations.filter(o => o.type === 'DELIVERY');

  return (
    <div className="space-y-6 animate-slide-up pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Delivery Orders</h1>
          <p className="text-gray-400 text-sm mt-1">Pick, Pack & Ship to customers.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primaryLight text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_20px_rgba(109,40,217,0.4)] transition-all hover:scale-105">
          <Plus size={18} /> Create Delivery
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
           <div className="w-full max-w-5xl bg-[#02010A] border border-primary/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-white/5 shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="bg-amber-500/20 p-2 rounded-lg"><Truck className="text-amber-500" size={20}/></div>
                    <div>
                        <div className="text-white font-bold tracking-wide text-sm uppercase">{editingId ? 'Edit Delivery' : 'Outgoing Delivery'}</div>
                        <div className="text-gray-500 text-xs font-mono">Reference: {editingId ? operations.find(o => o.id === editingId)?.reference : 'AUTO-GENERATED'}</div>
                    </div>
                 </div>
                 <button onClick={resetForm} className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 {/* Workflow */}
                 <div className="flex justify-end mb-8">
                    <div className="flex items-center bg-white/5 rounded-full px-1 p-1 border border-white/10">
                       <div className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase border border-amber-500/20">Draft</div>
                       <div className="px-2 text-gray-600"><ArrowRight size={12}/></div>
                       <div className="px-4 py-1.5 text-gray-500 text-xs font-bold uppercase">Done</div>
                    </div>
                 </div>

                 {/* Form */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                    <div className="space-y-8">
                       <div className="group">
                          <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Customer</label>
                          <input 
                            value={customer} 
                            onChange={e => setCustomer(e.target.value)} 
                            className="w-full bg-transparent border-b border-white/20 py-2 text-2xl text-white outline-none focus:border-primary transition-colors placeholder-gray-700 font-display font-bold" 
                            placeholder="Customer Name..." 
                            autoFocus
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Source Location</label>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                             <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-xs font-bold">WH</div>
                             <span className="text-white font-medium">Dispatch Center</span>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-8">
                       <div>
                          <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-wider">Delivery Date</label>
                          <input 
                            type="date" 
                            value={scheduleDate} 
                            onChange={e => setScheduleDate(e.target.value)} 
                            className="w-full bg-transparent border-b border-white/20 py-2 text-xl text-white outline-none focus:border-primary transition-colors font-mono" 
                          />
                       </div>
                    </div>
                 </div>

                 {/* Products */}
                 <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                       <h3 className="text-sm font-bold text-white uppercase tracking-wider">Items to Ship</h3>
                    </div>
                    <table className="w-full text-left text-sm">
                       <thead className="bg-black/20">
                          <tr className="text-gray-500 text-xs uppercase tracking-wider">
                             <th className="px-6 py-3 font-medium">Product</th>
                             <th className="px-6 py-3 font-medium text-right">Quantity</th>
                             <th className="px-6 py-3 font-medium text-right">Stock</th>
                             <th className="px-6 py-3 w-10"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {selectedItems.map((item, idx) => {
                             const prod = products.find(p => p.id === item.productId);
                             const maxStock = prod ? prod.quantity : 0;
                             return (
                                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                   <td className="px-6 py-4 text-white font-medium">{item.productName}</td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="inline-flex items-center bg-[#02010A] rounded-lg border border-white/20 focus-within:border-primary transition-colors">
                                         <input 
                                           type="number" 
                                           min="1"
                                           max={maxStock}
                                           value={item.quantity} 
                                           onChange={e => {
                                              let val = parseInt(e.target.value);
                                              if (val > maxStock) val = maxStock;
                                              const newItems = [...selectedItems];
                                              newItems[idx].quantity = isNaN(val) ? 0 : val;
                                              setSelectedItems(newItems);
                                           }}
                                           className="w-20 bg-transparent text-right text-white p-2 outline-none font-mono text-sm" 
                                         />
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      {item.quantity > maxStock ? (
                                         <span className="text-red-400 text-xs flex items-center justify-end gap-1"><AlertTriangle size={12}/> Shortage</span>
                                      ) : (
                                         <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded border border-green-500/20">{maxStock} Avail</span>
                                      )}
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

                    {/* INLINE ADD PRODUCT */}
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        {!isAddingProduct ? (
                           <button 
                              onClick={() => setIsAddingProduct(true)}
                              className="w-full py-3 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                           >
                              <Plus size={16} /> Add Item
                           </button>
                        ) : (
                           <div className="animate-fade-in bg-[#02010A] border border-amber-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                                 <Search size={16} className="text-amber-500"/>
                                 <input 
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
                                    placeholder="Search for available stock..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                 />
                                 <button onClick={() => setIsAddingProduct(false)} className="text-xs text-gray-500 hover:text-white">Close</button>
                              </div>
                              <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                                 {filteredProducts.map(p => (
                                    <button 
                                       key={p.id} 
                                       onClick={() => addItem(p.id)} 
                                       className="w-full text-left p-2 hover:bg-white/10 rounded flex justify-between items-center group transition-colors"
                                    >
                                       <span className="text-gray-300 group-hover:text-white">{p.name}</span>
                                       <span className="text-xs font-mono text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{p.quantity} avail</span>
                                    </button>
                                 ))}
                                 {filteredProducts.length === 0 && <div className="text-center text-gray-600 text-xs py-2">No available stock found</div>}
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
                    <button onClick={() => handleCreate(true)} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.4)] font-bold">Validate & Ship</button>
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
                 <th className="p-5 font-semibold">Customer</th>
                 <th className="p-5 font-semibold">Schedule</th>
                 <th className="p-5 font-semibold">Status</th>
                 <th className="p-5 font-semibold text-right">Workflow</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
              {deliveries.map(op => (
                 <tr key={op.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 font-mono text-primary font-medium">{op.reference}</td>
                    <td className="p-5 text-white font-medium">{op.contact}</td>
                    <td className="p-5 text-gray-400">{op.scheduledDate}</td>
                    <td className="p-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border tracking-wide ${op.status === 'DONE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{op.status}</span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                       {op.status !== 'DONE' ? (
                          <button onClick={() => validateOperation(op.id)} className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-bold shadow-lg shadow-amber-900/20 hover:scale-105 active:scale-95">
                             <Truck size={14} /> Ship
                          </button>
                       ) : (
                          <span className="text-green-400 flex items-center justify-end gap-1 text-xs font-medium bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"><CheckCircle2 size={14}/> Shipped</span>
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
                       {op.status === 'DRAFT' && (
                             <button onClick={() => deleteOperation(op.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg"><Trash2 size={16}/></button>
                       )}
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
        {deliveries.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><Box size={24} opacity={0.5}/></div>
               <p>No delivery orders found.</p>
               <button onClick={() => setShowCreate(true)} className="mt-4 text-primary hover:text-primaryLight text-sm">Create delivery</button>
            </div>
        )}
      </GlassCard>
    </div>
  );
}
