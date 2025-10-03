import React, { useState, useEffect, useCallback } from 'react';
import type { Task, Comment, Status, ChecklistItem } from '../../types';
import { formatCommentTimestamp, formatDisplayDate } from '../../utils/date';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit' | 'view';
    task: Task | null;
    onSave: (task: Task) => void;
    onAddComment: (taskId: string, comment: Comment) => void;
}

const emptyTask: Task = {
    id: '',
    title: '',
    description: '',
    notes: '',
    status: 'In Progress',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    imageUrl: '',
    linkUrl: '',
    comments: [],
    checklist: [],
};

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, mode, task, onSave, onAddComment }) => {
    const [formData, setFormData] = useState<Task>(emptyTask);
    const [newComment, setNewComment] = useState('');
    const [newCommentUrl, setNewCommentUrl] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    useEffect(() => {
        if (task && (mode === 'edit' || mode === 'view')) {
            setFormData(task);
        } else {
            setFormData(emptyTask);
        }
        setNewComment('');
        setNewCommentUrl('');
        setNewChecklistItem('');
        setIsImageZoomed(false);
    }, [task, mode, isOpen]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const base64 = await toBase64(file);
                setFormData(prev => ({ ...prev, imageUrl: base64 }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
         const fileInput = document.getElementById('file-upload') as HTMLInputElement;
         if(fileInput) fileInput.value = "";
    };

    const handleSave = () => {
        onSave(formData);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() === '') return;

        const comment: Comment = {
            id: `c-${Date.now()}`,
            author: 'Admin',
            text: newComment.trim(),
            timestamp: new Date().toISOString(),
            linkUrl: newCommentUrl.trim() || undefined,
        };

        if (mode === 'add') {
            setFormData(prev => ({
                ...prev,
                comments: [...prev.comments, comment],
            }));
        } else if (task) { // For 'edit' and 'view' modes
            onAddComment(task.id, comment);
        }
        setNewComment('');
        setNewCommentUrl('');
    };

    const handleAddChecklistItem = () => {
        if (newChecklistItem.trim() === '') return;
        const newItem: ChecklistItem = {
            id: `ci-${Date.now()}`,
            text: newChecklistItem.trim(),
            completed: false,
        };
        setFormData(prev => ({ ...prev, checklist: [...prev.checklist, newItem] }));
        setNewChecklistItem('');
    };

    const handleToggleChecklistItem = (itemId: string) => {
        if (mode === 'view') return;
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
        }));
    };

    const handleDeleteChecklistItem = (itemId: string) => {
        if (mode === 'view') return;
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.filter(item => item.id !== itemId),
        }));
    };
    
    if (!isOpen) return null;

    const isViewMode = mode === 'view';

    const renderChecklist = () => (
        <div className="pt-4 border-t border-border-dark">
            <h4 className="font-semibold mb-3 text-text-secondary">Checklist ({formData.checklist.length})</h4>
            <div className="space-y-2">
                {formData.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group">
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklistItem(item.id)}
                            disabled={isViewMode}
                            className="h-4 w-4 rounded bg-base-dark border-border-dark text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className={`flex-grow text-sm ${item.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                            {item.text}
                        </span>
                        {!isViewMode && (
                             <button type="button" onClick={() => handleDeleteChecklistItem(item.id)} className="text-gray-500 hover:text-red-500 text-lg opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                        )}
                    </div>
                ))}
            </div>
            {!isViewMode && (
                <form onSubmit={(e) => { e.preventDefault(); handleAddChecklistItem(); }} className="mt-4 flex gap-2">
                    <input type="text" value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} placeholder="Add checklist item..." className="form-input flex-grow text-sm" />
                    <button type="submit" className="btn-primary font-bold py-2 px-3 text-sm rounded-md">Add</button>
                </form>
            )}
        </div>
    );
    
    const renderComments = () => (
         <div className="pt-4 border-t border-border-dark">
            <h4 className="font-semibold mb-2 text-text-secondary">Comments ({formData.comments.length})</h4>
            <div className="space-y-3">
                {formData.comments.map(c => (
                    <div key={c.id} className="bg-base-dark p-3 rounded-md">
                        <p className="text-sm text-text-primary">{c.text}</p>
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
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                <div className="glass-modal rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="p-5 border-b border-border-dark flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold">
                            {mode === 'add' && 'Add New Task'}
                            {mode === 'edit' && 'Edit Task'}
                            {mode === 'view' && 'Task Details'}
                        </h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>

                    <div className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
                        {/* Left Column */}
                        <div className="space-y-4 overflow-y-auto pr-4 -mr-4">
                             {isViewMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-text-primary">{formData.title}</h3>
                                        <p className="text-text-secondary mt-1">{formData.description}</p>
                                        {formData.dueDate && (
                                            <p className="text-sm text-yellow-400 mt-2 flex items-center gap-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Due on {formatDisplayDate(formData.dueDate)}</span>
                                            </p>
                                        )}
                                    </div>
                                     <div>
                                        <h4 className="text-sm font-medium text-text-secondary mb-1">Notes</h4>
                                        <p className="text-text-primary text-sm whitespace-pre-wrap bg-base-dark p-3 rounded-md">{formData.notes || 'No notes.'}</p>
                                    </div>
                                    {formData.imageUrl && (
                                        <button type="button" onClick={() => setIsImageZoomed(true)} className="block w-auto cursor-zoom-in group">
                                            <img src={formData.imageUrl} alt="Task visual" className="rounded-lg max-h-60 w-auto group-hover:opacity-80 transition-opacity"/>
                                        </button>
                                    )}
                                    {formData.linkUrl && <a href={formData.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Related Link</a>}
                                </div>
                            ) : (
                                 <>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="form-input"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={6} className="form-input"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Image</label>
                                        {formData.imageUrl ? (
                                            <div className="mt-2">
                                                <img src={formData.imageUrl} alt="Preview" className="rounded-lg max-h-40 w-auto"/>
                                                <button type="button" onClick={handleRemoveImage} className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors">Remove Image</button>
                                            </div>
                                        ) : (
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-dark border-dashed rounded-md"><div className="space-y-1 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                <div className="flex text-sm justify-center"><label htmlFor="file-upload" className="relative cursor-pointer bg-component-dark rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1"><span>Upload a file</span><input id="file-upload" name="imageFile" type="file" className="sr-only" onChange={handleChange} accept="image/*" /></label><p className="pl-1 text-text-secondary">or drag and drop</p></div><p className="text-xs text-text-secondary">PNG, JPG, GIF</p></div></div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">URL Link</label>
                                        <input type="text" name="linkUrl" value={formData.linkUrl || ''} onChange={handleChange} className="form-input" placeholder="https://..."/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="form-input">
                                            <option value="In Progress">In Progress</option><option value="Completed">Completed</option><option value="Unpaid">Unpaid</option><option value="Paid">Paid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Due Date (Optional)</label>
                                        <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} className="form-input" />
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-6 overflow-y-auto pr-4 -mr-4">
                             { (mode === 'view' || mode === 'edit' || mode === 'add') && renderChecklist() }
                             { (mode === 'view' || mode === 'edit' || mode === 'add') && renderComments() }
                        </div>
                    </div>

                    <div className="p-4 bg-black/20 border-t border-border-dark flex justify-end gap-3 flex-shrink-0">
                        <button type="button" onClick={onClose} className="btn-secondary font-bold py-2 px-4 rounded-md">
                            {isViewMode ? 'Close' : 'Cancel'}
                        </button>
                        {!isViewMode && (
                            <button type="button" onClick={handleSave} className="btn-primary font-bold py-2 px-4 rounded-md">
                                Save Task
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isImageZoomed && formData.imageUrl && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex justify-center items-center p-4 cursor-zoom-out"
                    onClick={() => setIsImageZoomed(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Zoomed image view"
                >
                    <img
                        src={formData.imageUrl}
                        alt="Task visual - zoomed"
                        className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        type="button"
                        onClick={() => setIsImageZoomed(false)}
                        className="absolute top-4 right-4 text-white text-5xl font-light hover:text-gray-300 leading-none"
                        aria-label="Close zoomed image"
                    >
                        &times;
                    </button>
                </div>
            )}
        </>
    );
};