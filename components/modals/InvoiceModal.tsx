

import React, { useState, useMemo, useEffect } from 'react';
import type { InvoiceItem, ClientInfo } from '../../types';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (invoiceData: { invoiceNumber: string; date: string; dueDate?: string; client: ClientInfo }) => void;
    items: InvoiceItem[];
    suggestedInvoiceNumber: string;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

const emptyClient: ClientInfo = {
    name: '',
    address: '',
    vatInfo: '',
    postalCode: '',
    phone: '',
    email: '',
};

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, onSave, items, suggestedInvoiceNumber }) => {
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [client, setClient] = useState<ClientInfo>(emptyClient);
    
    useEffect(() => {
        if (isOpen) {
            setInvoiceNumber(suggestedInvoiceNumber);
            setDate(new Date().toISOString().split('T')[0]);
            setDueDate('');
            setClient(emptyClient);
        }
    }, [isOpen, suggestedInvoiceNumber]);

    const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
    
    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!invoiceNumber.trim()) {
            alert("Please enter an invoice number.");
            return;
        }
        if (!client.name.trim()) {
            alert("Please enter the client's name.");
            return;
        }
        onSave({ invoiceNumber: invoiceNumber.trim(), date, dueDate, client });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="glass-modal rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-border-dark flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Create New Invoice</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Invoice Number</label>
                            <input 
                                type="text"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className="form-input"
                                placeholder="e.g., INV-001"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Invoice Date</label>
                             <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                className="form-input"
                             />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Due Date (Optional)</label>
                             <input 
                                type="date" 
                                value={dueDate} 
                                onChange={(e) => setDueDate(e.target.value)} 
                                className="form-input"
                             />
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-text-secondary mb-1">Name (Mandatory)</label>
                             <input type="text" name="name" value={client.name} onChange={handleClientChange} className="form-input" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Email (Optional)</label>
                             <input type="email" name="email" value={client.email} onChange={handleClientChange} className="form-input" />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number (Optional)</label>
                             <input type="text" name="phone" value={client.phone} onChange={handleClientChange} className="form-input" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-text-secondary mb-1">Address (Optional)</label>
                             <input type="text" name="address" value={client.address} onChange={handleClientChange} className="form-input" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">Postal Code (Optional)</label>
                             <input type="text" name="postalCode" value={client.postalCode} onChange={handleClientChange} className="form-input" />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-text-secondary mb-1">VAT / Non-VAT Info (Optional)</label>
                             <input type="text" name="vatInfo" value={client.vatInfo} onChange={handleClientChange} className="form-input" placeholder="e.g., VAT: 123-456-789" />
                        </div>
                    </div>

                    
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Items to be Invoiced ({items.length})</h3>
                    <div className="bg-base-dark/80 rounded-lg border border-border-dark max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-base-dark z-10">
                                <tr>
                                    <th className="p-3 text-left text-text-secondary font-medium">Description</th>
                                    <th className="p-3 text-right text-text-secondary font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="border-t border-border-dark">
                                        <td className="p-3 text-text-primary">{item.title}</td>
                                        <td className="p-3 text-right text-text-secondary">{currencyFormatter.format(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-right mt-4 pr-3">
                        <span className="text-text-secondary font-medium">Total: </span>
                        <span className="text-xl font-bold text-text-primary">{currencyFormatter.format(totalAmount)}</span>
                    </div>

                </div>

                <div className="p-4 bg-black/20 border-t border-border-dark flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="btn-secondary font-bold py-2 px-4 rounded-md">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} className="btn-primary font-bold py-2 px-4 rounded-md">
                        Create Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};