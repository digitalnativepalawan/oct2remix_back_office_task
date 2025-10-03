
import React, { useState, useEffect, useMemo } from 'react';
import type { MaterialItem, Comment } from '../../types';
import { formatCommentTimestamp } from '../../utils/date';

interface MaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit' | 'view';
    material: MaterialItem | null;
    onSave: (material: MaterialItem) => void;
    onAddComment: (materialId: string, comment: Comment) => void;
}

const emptyMaterial: Omit<MaterialItem, 'id'> = {
    name: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    unitPrice: 0,
    total: 0,
    status: 'Unpaid',
    linkUrl: '',
    comments: [],
};

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export const MaterialModal: React.FC<MaterialModalProps> = ({ isOpen, onClose, mode, material, onSave, onAddComment }) => {
    const [formData, setFormData] = useState<Omit<MaterialItem, 'id'>>({...emptyMaterial});
    const [id, setId] = useState<string>('');
    const [newComment, setNewComment] = useState('');
    const [newCommentUrl, setNewCommentUrl] = useState('');
    
    useEffect(() => {
        if (material && (mode === 'edit' || mode === 'view')) {
            const { id, ...rest } = material;
            setFormData(rest);
            setId(id);
        } else {
            setFormData({...emptyMaterial});
            setId('');
        }
        setNewComment('');
        setNewCommentUrl('');
    }, [material, mode, isOpen]);
    
    const total = useMemo(() => {
        return formData.quantity * formData.unitPrice;
    }, [formData.quantity, formData.unitPrice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const val = (name === 'quantity' || name === 'unitPrice') ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };
    
    const handleSave = () => {
        onSave({ ...formData, total, id });
    };
    
    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && id) {
            const comment: Comment = {
                id: `c-${Date.now()}`,
                author: 'Admin',
                text: newComment.trim(),
                timestamp: new Date().toISOString(),
                linkUrl: newCommentUrl.trim() || undefined,
            };
            onAddComment(id, comment);
            setNewComment('');
            setNewCommentUrl('');
        }
    };

    if (!isOpen) return null;

    const isViewMode = mode === 'view';

    const renderComments = () => (
         <div className="pt-4 mt-4 border-t border-border-dark">
            <h4 className="font-semibold mb-2 text-text-secondary">Comments ({formData.comments.length})</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {formData.comments.map(c => (
                    <div key={c.id} className="bg-base-dark p-3 rounded-md">
                        <p className="text-sm text-text-primary break-words">{c.text}</p>
                        {c.linkUrl && (
                             <a href={c.linkUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-blue-400 hover:underline flex items-center gap-1.5 break-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                                <span>{c.linkUrl}</span>
                             </a>
                         )}
                        <p className="text-xs text-text-tertiary mt-1">- {c.author} on {formatCommentTimestamp(c.timestamp)}</p>
                    </div>
                ))}
                {formData.comments.length === 0 && <p className="text-sm text-text-secondary">No comments yet.</p>}
            </div>
             <form onSubmit={handleCommentSubmit} className="mt-4 space-y-2">
                 <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="form-input w-full" />
                <div className="flex gap-2">
                    <input type="url" value={newCommentUrl} onChange={(e) => setNewCommentUrl(e.target.value)} placeholder="Optional URL..." className="form-input flex-grow" />
                    <button type="submit" className="btn-primary font-bold py-2 px-4 rounded-md">Post</button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="glass-modal rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-border-dark flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">
                        {mode === 'add' && 'Add New Material'}
                        {mode === 'edit' && 'Edit Material'}
                        {mode === 'view' && 'Material Details'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {isViewMode ? (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-semibold text-text-primary">{formData.name}</h3>
                                <p className="text-sm text-text-secondary">Date: {formData.date}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <p><span className="text-text-secondary">Quantity:</span> {formData.quantity}</p>
                                <p><span className="text-text-secondary">Unit Price:</span> {currencyFormatter.format(formData.unitPrice)}</p>
                                <p><span className="text-text-secondary">Total:</span> {currencyFormatter.format(total)}</p>
                            </div>
                            {formData.linkUrl && <a href={formData.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">Related Link</a>}
                        </div>
                    ) : (
                        <>
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
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Quantity</label>
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Unit Price</label>
                                    <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Total</label>
                                    <input type="text" name="total" value={currencyFormatter.format(total)} readOnly className="form-input bg-base-dark/50 text-text-secondary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">URL Link</label>
                                <input type="text" name="linkUrl" value={formData.linkUrl || ''} onChange={handleChange} className="form-input" placeholder="https://..."/>
                            </div>
                        </>
                    )}
                    {(mode === 'view' || mode === 'edit') && material?.id && renderComments()}
                </div>

                <div className="p-4 bg-black/20 border-t border-border-dark flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="btn-secondary font-bold py-2 px-4 rounded-md">
                        {isViewMode ? 'Close' : 'Cancel'}
                    </button>
                    {!isViewMode && (
                        <button type="button" onClick={handleSave} className="btn-primary font-bold py-2 px-4 rounded-md">
                            Save Material
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};