
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
            <table className="w-full responsive-table">
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
                            <td data-label="Invoice #" className="px-6 py-4 text-sm font-medium text-text-primary">{item.invoiceNumber}</td>
                            <td data-label="Date" className="px-6 py-4 text-sm text-text-secondary">{formatDisplayDate(item.date)}</td>
                            <td data-label="Total" className="px-6 py-4 text-sm text-text-secondary">{currencyFormatter.format(item.total)}</td>
                            <td data-label="Items" className="px-6 py-4 text-sm text-text-secondary">{item.items.length}</td>
                            <td data-label="Status" className="px-6 py-4 text-sm">
                                 <select 
                                    value={item.status}
                                    onChange={(e) => onStatusChange(item.id, e.target.value as InvoiceStatus)}
                                    className="form-input text-xs p-1"
                                >
                                    <option>Draft</option>
                                    <option>Paid</option>
                                </select>
                            </td>
                            <td data-label="Actions" className="px-6 py-4 text-sm font-medium">
                                <div className="flex items-center gap-3">
                                    <ActionButton onClick={() => onView(item)} tooltip="View">
                                        <EyeIcon />
                                    </ActionButton>
                                    <ActionButton onClick={() => onDelete(item.id)} tooltip="Delete" className="hover:text-red-500">
                                        <TrashIcon />
                                    </ActionButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
