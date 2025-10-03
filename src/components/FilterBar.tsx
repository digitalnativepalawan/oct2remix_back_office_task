
import React from 'react';
import type { Status, Tab, InvoiceStatus } from '../types';

interface FilterBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: Status | InvoiceStatus | 'All';
    setStatusFilter: (value: Status | InvoiceStatus | 'All') => void;
    onAddClick: () => void;
    showAddButton: boolean;
    onDeleteAllClick: () => void;
    showDeleteAllButton: boolean;
    statusOptions: { value: string; label: string }[];
    activeTab: Tab;
    onBulkAddClick?: () => void;
    showBulkAddButton?: boolean;
    isAddDisabled?: boolean;
    addButtonText?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAddClick, showAddButton, onDeleteAllClick, showDeleteAllButton, statusOptions, activeTab, onBulkAddClick, showBulkAddButton, isAddDisabled, addButtonText }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-grow max-w-xs">
                <input 
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input w-full pl-10"
                />
                 <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div className="flex items-center flex-wrap gap-4">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Status | InvoiceStatus | 'All')}
                    className="form-input"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {showDeleteAllButton && (
                    <button
                        type="button"
                        onClick={onDeleteAllClick}
                        className="btn-danger font-bold py-2 px-3 rounded-md flex items-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <span>Delete All</span>
                    </button>
                )}
                {showBulkAddButton && (
                    <button 
                        type="button"
                        onClick={onBulkAddClick}
                        className="btn-secondary font-bold py-2 px-3 rounded-md flex items-center gap-2 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                        </svg>
                        <span>Bulk Add</span>
                    </button>
                )}
                {showAddButton && (
                    <button 
                        type="button"
                        onClick={onAddClick}
                        disabled={isAddDisabled}
                        className={`btn-primary font-bold py-2 px-3 rounded-md flex items-center gap-2 text-sm transition-opacity ${isAddDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isAddDisabled && activeTab === 'Invoice' ? 'No unbilled items to create an invoice' : undefined}
                    >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        <span>{addButtonText || 'Add New'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};