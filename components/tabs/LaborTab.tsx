import React from 'react';
import type { LaborItem, Status, SortConfig } from '../../types';
import { ActionButton, PencilIcon, TrashIcon, SortIcon } from '../Icons';
import { formatRelativeDate } from '../../utils/date';

interface LaborTabProps {
    data: LaborItem[];
    onStatusChange: (id: string, status: Status) => void;
    onDelete: (id: string) => void;
    onEdit: (laborItem: LaborItem) => void;
    sortConfig: SortConfig;
    onSort: (key: 'date') => void;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export const LaborTab: React.FC<LaborTabProps> = ({ data, onStatusChange, onDelete, onEdit, sortConfig, onSort }) => {
    const headers = ['Name', 'Date', 'Hours', 'Rate', 'Total', 'Status', 'Actions'];

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
                            <td data-label="Name" className="px-6 py-4 text-sm font-medium text-text-primary">{item.name}</td>
                            <td data-label="Date" className="px-6 py-4 text-sm text-text-secondary">
                                <time dateTime={item.date} title={new Date(item.date).toLocaleString()}>
                                    {formatRelativeDate(item.date)}
                                </time>
                            </td>
                            <td data-label="Hours" className="px-6 py-4 text-sm text-text-secondary">{item.hours.toFixed(2)}</td>
                            <td data-label="Rate" className="px-6 py-4 text-sm text-text-secondary">{currencyFormatter.format(item.rate)}</td>
                            <td data-label="Total" className="px-6 py-4 text-sm text-text-secondary">{currencyFormatter.format(item.total)}</td>
                            <td data-label="Status" className="px-6 py-4 text-sm">
                                <select 
                                    value={item.status}
                                    onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
                                    className="form-input text-xs p-1"
                                >
                                    <option>Paid</option>
                                    <option>Unpaid</option>
                                </select>
                            </td>
                            <td data-label="Actions" className="px-6 py-4 text-sm font-medium">
                                <div className="flex items-center gap-3">
                                    <ActionButton onClick={(e) => onEdit(item)} tooltip="Edit">
                                        <PencilIcon />
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
    );
};
