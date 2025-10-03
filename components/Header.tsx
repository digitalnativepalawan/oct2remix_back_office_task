
import React from 'react';

interface HeaderProps {
    paidTotal: number;
    unpaidTotal: number;
    onExportClick: () => void;
    onTemplateClick: () => void;
    onImportClick: () => void;
    onResetClick: () => void;
    customLinks: Array<{ label: string; url: string }>;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

export const Header: React.FC<HeaderProps> = ({ paidTotal, unpaidTotal, onExportClick, onTemplateClick, onImportClick, onResetClick, customLinks }) => {
    return (
        <header className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-40">
            <div className="flex items-center gap-2 flex-wrap">
                 <h1 className="text-xl font-bold text-white mr-4">Back-Office</h1>
                {customLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary font-semibold py-2 px-3 rounded-md text-sm"
                    >
                        {link.label}
                    </a>
                ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-3 bg-black/20 p-1 rounded-lg">
                     <div className="bg-green-500/20 text-green-300 font-bold py-1.5 px-3 rounded-md text-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        PAID: {currencyFormatter.format(paidTotal)}
                    </div>
                    <div className="bg-red-500/20 text-red-300 font-bold py-1.5 px-3 rounded-md text-xs flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        UNPAID: {currencyFormatter.format(unpaidTotal)}
                    </div>
                </div>

                <div className="w-px h-8 bg-border-dark mx-2"></div>
                
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onExportClick} title="Export Data" className="btn-secondary p-2 rounded-md"><ArrowDownTrayIcon /></button>
                    <button type="button" onClick={onTemplateClick} title="Download Template" className="btn-secondary p-2 rounded-md"><DocumentTextIcon /></button>
                    <button type="button" onClick={onImportClick} title="Import Data" className="btn-secondary p-2 rounded-md"><ArrowUpTrayIcon /></button>
                    <button type="button" onClick={onResetClick} title="Reset All Data" className="bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-md transition-colors"><TrashIcon /></button>
                </div>
            </div>
        </header>
    );
};


const ArrowDownTrayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
const ArrowUpTrayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);
const TrashIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);