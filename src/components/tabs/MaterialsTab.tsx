import React from 'react';
import type { MaterialItem, Status, SortConfig } from '../../types';
import { LinkIcon } from '../LinkIcon';
import { ActionButton, PencilIcon, TrashIcon, EyeIcon, SortIcon } from '../Icons';
import { formatRelativeDate } from '../../utils/date';


interface MaterialsTabProps {
    data: MaterialItem[];
    onStatusChange: (id: string, status: Status) => void;
    onDelete: (id: string) => void;
    onEdit: (material: MaterialItem) => void;
    onView: (material: MaterialItem) => void;
    sortConfig: SortConfig;
    onSort: (key: 'date') => void;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export const MaterialsTab: React.FC<MaterialsTabProps> = ({ data, onStatusChange, onDelete, onEdit, onView, sortConfig, onSort }) => {
    const headers = ['Name', 'Date', 'Qty', 'Unit Price', 'Total', 'Link', 'Status', 'Actions'];
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
                                 <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider ${header === 'Link' ? 'text-center' : ''}`}>
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
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                     <time dateTime={item.date} title={new Date(item.date).toLocaleString()}>
                                        {formatRelativeDate(item.date)}
                                    </time>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{currencyFormatter.format(item.unitPrice)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{currencyFormatter.format(item.total)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <LinkIcon url={item.linkUrl} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select 
                                        value={item.status}
                                        onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
                                        className="form-input text-xs p-1"
                                    >
                                        <option>Paid</option>
                                        <option>Unpaid</option>
                                    </select>
                                </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                         <ActionButton onClick={(e) => onView(item)} tooltip="View">
                                            <EyeIcon />
                                        </ActionButton>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {data.map(item => (
                    <div key={item.id} className="glass-card p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-text-primary pr-2 break-words">{item.name}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <ActionButton onClick={(e) => onView(item)} tooltip="View">
                                    <EyeIcon />
                                </ActionButton>
                                <ActionButton onClick={(e) => onEdit(item)} tooltip="Edit">
                                    <PencilIcon />
                                </ActionButton>
                                <ActionButton onClick={(e) => onDelete(item.id)} tooltip="Delete" className="hover:text-red-500">
                                    <TrashIcon />
                                </ActionButton>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <p className="text-text-tertiary text-xs">Date</p>
                                <p className="text-text-secondary">{formatRelativeDate(item.date)}</p>
                            </div>
                            <div>
                                <p className="text-text-tertiary text-xs">Total</p>
                                <p className="text-text-primary font-semibold">{currencyFormatter.format(item.total)}</p>
                            </div>
                            <div>
                                <p className="text-text-tertiary text-xs">Quantity</p>
                                <p className="text-text-secondary">{item.quantity}</p>
                            </div>
                            <div>
                                <p className="text-text-tertiary text-xs">Unit Price</p>
                                <p className="text-text-secondary">{currencyFormatter.format(item.unitPrice)}</p>
                            </div>
                            {item.linkUrl && (
                                <div className="col-span-2">
                                    <p className="text-text-tertiary text-xs">Link</p>
                                    <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all text-sm flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                                        <span>View Link</span>
                                    </a>
                                </div>
                            )}
                        </div>
                        <div>
                            <select
                                value={item.status}
                                onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
                                className="form-input w-full mt-1 text-sm p-2"
                            >
                                <option>Paid</option>
                                <option>Unpaid</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
