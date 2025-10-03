

import React from 'react';
import type { Invoice, InvoiceStatus, SortConfig } from '../../types';
import { ActionButton, TrashIcon, EyeIcon, SortIcon } from '../Icons';
import { formatDisplayDate } from '../../utils/date';


interface InvoiceTabProps {
    data: Invoice[];
    onStatusChange: (id: string, status: InvoiceStatus) => void;
    onDelete: (id: string) => void;
    onView: (invoice: Invoice) => void;
    sortConfig: SortConfig;
    onSort: (key: 'date') => void;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

const statusColorMap: Record<InvoiceStatus, string> = {
    Draft: 'bg-yellow-500',
    Paid: 'bg-green-500',
};

export const InvoiceTab: React.FC<InvoiceTabProps> = ({ data, onStatusChange, onDelete, onView, sortConfig, onSort }) => {
    const headers = ['Invoice #', 'Date', 'Total', 'Items', 'Status', 'Actions'];

    return (
        <div>
            {/* Mobile Sort Control */}
            <div className="md:hidden flex justify-end mb-4">
                <button type="button" onClick={() => onSort('date')} className="btn-secondary text-sm font-semibold py-2 px-3 rounded-md flex items-center gap-1.5">
                    <span>Date</span>
                    {sortConfig?.key === 'date' && <SortIcon direction={sortConfig.direction} />}
                </button>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border-dark">
                        <tr>
                            {headers.map(header => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    {header === 'Date' ? (
                                        <button type="button" onClick={() => onSort('date')} className="flex items-center hover:text-text-secondary transition-colors">
                                            {header}
                                            {sortConfig?.key === 'date' && <SortIcon direction={sortConfig.direction} />}
                                        </button>
                                    ) : (
                                        header
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="border-b border-border-dark table-row-hover">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.invoiceNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDisplayDate(item.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{currencyFormatter.format(item.total)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.items.length}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select 
                                        value={item.status}
                                        onChange={(e) => onStatusChange(item.id, e.target.value as InvoiceStatus)}
                                        className="form-input text-xs p-1"
                                    >
                                        <option>Draft</option>
                                        <option>Paid</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        <ActionButton onClick={(e) => onView(item)} tooltip="View">
                                            <EyeIcon />
                                        </ActionButton>
                                        <ActionButton onClick={(e) => onDelete(item.id)} tooltip="Delete" className="hover:text-red-500">
                                            <TrashIcon />
                                        </ActionButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {data.map(item => (
                    <div key={item.id} className="glass-card p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-text-primary pr-2 break-words">{item.invoiceNumber}</h3>
                                 <p className="text-sm text-text-secondary">{formatDisplayDate(item.date)}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <ActionButton onClick={(e) => onView(item)} tooltip="View"><EyeIcon /></ActionButton>
                                <ActionButton onClick={(e) => onDelete(item.id)} tooltip="Delete" className="hover:text-red-500"><TrashIcon /></ActionButton>
                            </div>
                        </div>
                         <div className="flex justify-between items-center text-sm pt-3 border-t border-border-dark">
                            <div>
                                <p className="text-text-tertiary text-xs">Total</p>
                                <p className="text-text-primary font-semibold text-lg">{currencyFormatter.format(item.total)}</p>
                            </div>
                             <div>
                                <p className="text-text-tertiary text-xs">Items</p>
                                <p className="text-text-secondary text-right">{item.items.length}</p>
                            </div>
                        </div>
                        <div>
                            <select
                                value={item.status}
                                onChange={(e) => onStatusChange(item.id, e.target.value as InvoiceStatus)}
                                className="form-input w-full mt-1 text-sm p-2"
                            >
                                <option>Draft</option>
                                <option>Paid</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};