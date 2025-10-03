import React from 'react';
import type { Invoice } from '../../types';
import { formatDisplayDate } from '../../utils/date';

interface InvoiceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ isOpen, onClose, invoice }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        const printContainer = document.getElementById('invoice-to-print-container');
        if (printContainer) {
            const printWindow = window.open('', '_blank', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Print Invoice</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
                 printWindow.document.write(`<style>
                    body { font-family: sans-serif; color: #1f2937; }
                    .print-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
                    .print-table { width: 100%; border-collapse: collapse; }
                    .print-table th, .print-table td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
                    .print-table td { vertical-align: top; }
                    .print-table th { background-color: #f3f4f6; text-align: left; text-transform: uppercase; font-size: 0.75rem; color: #4b5563; }
                    .print-total-section { display: flex; justify-content: flex-end; margin-top: 2rem; }
                 </style>`);
                printWindow.document.write('</head><body class="bg-white">');
                printWindow.document.write(printContainer.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { // Give tailwind time to load and apply styles
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 p-4 flex justify-center items-center">
            <div className="glass-modal rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-border-dark flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold">Invoice Preview</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <div className="flex-grow p-6 bg-gray-900/50 overflow-y-auto">
                    <div id="invoice-to-print-container">
                       <div className="p-8 max-w-4xl mx-auto bg-white text-gray-900 rounded-lg shadow-2xl font-sans">
                            {/* Header */}
                            <header className="flex justify-between items-start mb-10 print-header">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Binga Beach Palawan</h2>
                                    <p className="text-gray-500 text-sm">San Vicente, Palawan</p>
                                    <p className="text-gray-500 text-sm">Philippines</p>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-4xl font-bold uppercase text-gray-800">Invoice</h1>
                                    <div className="mt-2 text-sm">
                                        <div className="flex justify-end items-center">
                                            <span className="font-semibold text-gray-600 mr-2">Invoice #</span>
                                            <span>{invoice.invoiceNumber}</span>
                                        </div>
                                        <div className="flex justify-end items-center">
                                            <span className="font-semibold text-gray-600 mr-2">Date:</span>
                                            <span>{formatDisplayDate(invoice.date)}</span>
                                        </div>
                                         {invoice.dueDate && (
                                            <div className="flex justify-end items-center">
                                                <span className="font-semibold text-gray-600 mr-2">Due Date:</span>
                                                <span>{formatDisplayDate(invoice.dueDate)}</span>
                                            </div>
                                        )}
                                         <div className="flex justify-end items-center mt-1">
                                            <span className="font-semibold text-gray-600 mr-2">Status:</span>
                                            <span className={`font-semibold ${invoice.status === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            {/* Client Info */}
                            <section className="mb-10">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                                <p className="font-bold text-gray-800">{invoice.client.name}</p>
                                {invoice.client.address && <p className="text-gray-600">{invoice.client.address}</p>}
                                {invoice.client.postalCode && <p className="text-gray-600">{invoice.client.postalCode}</p>}
                                {invoice.client.email && <p className="text-gray-600">{invoice.client.email}</p>}
                                {invoice.client.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
                                {invoice.client.vatInfo && <p className="text-gray-600 mt-2">{invoice.client.vatInfo}</p>}
                            </section>

                            {/* Items Table */}
                            <section>
                                <div className="border border-gray-200 rounded-lg print:border-none">
                                    <table className="w-full print-table">
                                        <thead className="bg-gray-100">
                                            <tr className="border-b border-gray-300">
                                                <th className="p-3 text-left font-semibold text-gray-600 uppercase text-sm">Description</th>
                                                <th className="p-3 w-40 text-right font-semibold text-gray-600 uppercase text-sm">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.items.map(item => (
                                                <tr key={item.id} className="border-b border-gray-200">
                                                    <td className="p-3 align-top text-gray-800">{item.title}</td>
                                                    <td className="p-3 text-right align-top text-gray-800">{currencyFormatter.format(item.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Total */}
                            <section className="flex justify-end mt-8 print-total-section">
                                <div className="w-full max-w-xs text-sm">
                                     <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-800">{currencyFormatter.format(invoice.total)}</span>
                                    </div>
                                     <div className="flex justify-between items-center py-2 border-t border-gray-200">
                                        <span className="font-bold text-lg text-gray-800">Total</span>
                                        <span className="font-bold text-lg text-gray-800">{currencyFormatter.format(invoice.total)}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Notes & Footer */}
                            <div className="mt-12 pt-6 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                                <p className="text-gray-500 text-sm mb-8">
                                    Thank you for your business. Please make payment by {invoice.dueDate ? formatDisplayDate(invoice.dueDate) : 'the due date'}.
                                </p>
                                <footer className="text-center text-gray-500 text-xs">
                                    <p>Binga Beach Palawan | San Vicente, Palawan, Philippines</p>
                                    <p>david@bingabeach.com</p>
                                </footer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/20 border-t border-border-dark flex justify-end gap-3 flex-shrink-0">
                     <button type="button" onClick={onClose} className="btn-secondary font-bold py-2 px-4 rounded-md">
                        Close
                    </button>
                    <button type="button" onClick={handlePrint} className="btn-primary font-bold py-2 px-4 rounded-md flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Save PDF
                    </button>
                </div>
            </div>
        </div>
    );
};