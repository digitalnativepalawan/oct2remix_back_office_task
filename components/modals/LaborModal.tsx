
import React, { useState, useEffect, useMemo } from 'react';
import type { LaborItem } from '../../types';

interface LaborModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    labor: LaborItem | null;
    onSave: (labor: LaborItem) => void;
}

const emptyLabor: Omit<LaborItem, 'id' | 'total'> = {
    name: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    rate: 0,
    status: 'Unpaid',
};

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export const LaborModal: React.FC<LaborModalProps> = ({ isOpen, onClose, mode, labor, onSave }) => {
    const [formData, setFormData] = useState<Omit<LaborItem, 'id' | 'total'>>({...emptyLabor});
    const [id, setId] = useState<string>('');
    
    useEffect(() => {
        if (labor && mode === 'edit') {
            const { id, total, ...rest } = labor;
            setFormData(rest);
            setId(id);
        } else {
            setFormData({...emptyLabor});
            setId('');
        }
    }, [labor, mode, isOpen]);
    
    const total = useMemo(() => {
        return formData.hours * formData.rate;
    }, [formData.hours, formData.rate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const val = (name === 'hours' || name === 'rate') ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSave = () => {
        onSave({ ...formData, total, id });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="glass-modal rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-5 border-b border-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {mode === 'add' ? 'Add New Labor' : 'Edit Labor'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-input" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Hours</label>
                            <input type="number" name="hours" value={formData.hours} onChange={handleChange} className="form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Rate</label>
                            <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="form-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Total</label>
                            <input type="text" name="total" value={currencyFormatter.format(total)} readOnly className="form-input bg-base-dark/50 text-text-secondary" />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/20 border-t border-border-dark flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary font-bold py-2 px-4 rounded-md">Cancel</button>
                    <button type="button" onClick={handleSave} className="btn-primary font-bold py-2 px-4 rounded-md">Save Labor</button>
                </div>
            </div>
        </div>
    );
};