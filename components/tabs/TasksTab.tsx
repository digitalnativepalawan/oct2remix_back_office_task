
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
                <table className="w-full responsive-table">
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
                                <td data-label="Title" className="px-6 py-4 text-sm font-medium text-text-primary">{task.title}</td>
                                    <td data-label="Date" className="px-6 py-4 text-sm text-text-secondary">
                                        <time dateTime={task.date} title={new Date(task.date).toLocaleString()}>
                                            {formatRelativeDate(task.date)}
                                        </time>
                                    </td>
                                    <td data-label="Due Date" className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2 justify-end md:justify-start">
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
                                    <td data-label="Status" className="px-6 py-4 text-sm">
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
                                    <td data-label="Link" className="px-6 py-4 text-center">
                                        <LinkIcon url={task.linkUrl} />
                                    </td>
                                    <td data-label="Actions" className="px-6 py-4 text-sm font-medium">
                                        <div className="flex items-center gap-3">
                                            <ActionButton onClick={() => onView(task)} tooltip="View">
                                                <EyeIcon />
                                            </ActionButton>
                                            <ActionButton onClick={() => onEdit(task)} tooltip="Edit">
                                                <PencilIcon />
                                            </ActionButton>
                                            <ActionButton onClick={() => onDelete(task.id)} tooltip="Delete" className="hover:text-red-500">
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

            {paidInvoices.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border-dark">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Paid Invoices Archive</h3>
                    <div className="glass-card md:p-0">
                        <table className="w-full responsive-table">
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
                                        <td data-label="Invoice #" className="px-6 py-4 text-sm font-medium text-text-primary">{invoice.invoiceNumber}</td>
                                        <td data-label="Date" className="px-6 py-4 text-sm text-text-secondary">{formatDisplayDate(invoice.date)}</td>
                                        <td data-label="Client" className="px-6 py-4 text-sm text-text-secondary">{invoice.client.name}</td>
                                        <td data-label="Total" className="px-6 py-4 text-sm text-text-secondary text-right">{currencyFormatter.format(invoice.total)}</td>
                                        <td data-label="Actions" className="px-6 py-4 text-sm font-medium text-center">
                                            <ActionButton onClick={() => onViewInvoice(invoice)} tooltip="View Invoice">
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
