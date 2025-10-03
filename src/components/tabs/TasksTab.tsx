
import React, { useMemo } from 'react';
import type { Task, Status, SortConfig, Invoice } from '../../types';
import { LinkIcon } from '../LinkIcon';
import { ActionButton, PencilIcon, TrashIcon, EyeIcon, SortIcon } from '../Icons';
import { formatRelativeDate, formatDisplayDate } from '../../utils/date';

interface TasksTabProps {
    data: Task[];
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    onView: (task: Task) => void;
    onStatusChange: (id: string, status: Status) => void;
    sortConfig: SortConfig;
    onSort: (key: 'date') => void;
    paidInvoices: Invoice[];
    onViewInvoice: (invoice: Invoice) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({ data, onDelete, onEdit, onView, onStatusChange, sortConfig, onSort, paidInvoices, onViewInvoice }) => {
    const headers = ['Title', 'Date', 'Due Date', 'Status', 'Link', 'Actions'];
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }), []);

    return (
        <>
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
                            {data.map(task => {
                                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Completed', 'Paid'].includes(task.status);
                                return (
                                    <tr key={task.id} className="border-b border-border-dark table-row-hover">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{task.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                            <time dateTime={task.date} title={new Date(task.date).toLocaleString()}>
                                                {formatRelativeDate(task.date)}
                                            </time>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                {task.dueDate ? (
                                                    <time dateTime={task.dueDate} title={new Date(task.dueDate).toLocaleString()} className={isOverdue ? 'text-red-400 font-semibold' : 'text-text-secondary'}>
                                                        {formatDisplayDate(task.dueDate)}
                                                    </time>
                                                ) : (
                                                    <span className="text-text-tertiary">-</span>
                                                )}
                                                {isOverdue && (
                                                    <span className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select 
                                                value={task.status}
                                                onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                                                className="form-input text-xs p-1"
                                            >
                                                <option>In Progress</option>
                                                <option>Completed</option>
                                                <option>Unpaid</option>
                                                <option>Paid</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <LinkIcon url={task.linkUrl} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <ActionButton onClick={(e) => onView(task)} tooltip="View">
                                                    <EyeIcon />
                                                </ActionButton>
                                                <ActionButton onClick={(e) => onEdit(task)} tooltip="Edit">
                                                    <PencilIcon />
                                                </ActionButton>
                                                <ActionButton onClick={(e) => onDelete(task.id)} tooltip="Delete" className="hover:text-red-500">
                                                    <TrashIcon />
                                                </ActionButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                 {/* Mobile Card View */}
                 <div className="md:hidden space-y-4">
                    {data.map(task => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Completed', 'Paid'].includes(task.status);
                        return (
                            <div key={task.id} className="glass-card p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-text-primary pr-2 break-words">{task.title}</h3>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <ActionButton onClick={(e) => onView(task)} tooltip="View"><EyeIcon /></ActionButton>
                                        <ActionButton onClick={(e) => onEdit(task)} tooltip="Edit"><PencilIcon /></ActionButton>
                                        <ActionButton onClick={(e) => onDelete(task.id)} tooltip="Delete" className="hover:text-red-500"><TrashIcon /></ActionButton>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div>
                                        <p className="text-text-tertiary text-xs">Date</p>
                                        <p className="text-text-secondary">{formatRelativeDate(task.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-tertiary text-xs">Due Date</p>
                                        <p className={isOverdue ? 'text-red-400 font-semibold' : 'text-text-secondary'}>
                                            {task.dueDate ? formatDisplayDate(task.dueDate) : '-'}
                                        </p>
                                    </div>
                                </div>
                                {task.linkUrl && (
                                    <div>
                                        <p className="text-text-tertiary text-xs">Link</p>
                                        <a href={task.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all text-sm flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
                                            <span>View Link</span>
                                        </a>
                                    </div>
                                )}
                                <div>
                                    <select
                                        value={task.status}
                                        onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
                                        className="form-input w-full mt-1 text-sm p-2"
                                    >
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                        <option>Unpaid</option>
                                        <option>Paid</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {paidInvoices.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border-dark">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Paid Invoices Archive</h3>
                    <div className="overflow-x-auto glass-card">
                        <table className="w-full">
                            <thead className="border-b border-border-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Invoice #</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Client</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">Total</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-text-tertiary uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paidInvoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b border-border-dark last:border-b-0 table-row-hover">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDisplayDate(invoice.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{invoice.client.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">{currencyFormatter.format(invoice.total)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                            <ActionButton onClick={(e) => onViewInvoice(invoice)} tooltip="View Invoice">
                                                <EyeIcon />
                                            </ActionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};
