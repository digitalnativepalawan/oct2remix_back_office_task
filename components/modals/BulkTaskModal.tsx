
import React from 'react';

interface BulkTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownloadTemplate: () => void;
    onUploadClick: () => void;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

export const BulkTaskModal: React.FC<BulkTaskModalProps> = ({ isOpen, onClose, onDownloadTemplate, onUploadClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="glass-modal rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-5 border-b border-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold">Bulk Add Tasks</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-text-secondary">Follow these steps to add multiple tasks at once using a CSV file.</p>
                    
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
                        <div>
                            <h3 className="font-semibold text-text-primary mb-1">Download the Template</h3>
                            <p className="text-sm text-text-secondary mb-3">Get the CSV template with the correct headers for importing tasks.</p>
                            <button
                                type="button"
                                onClick={onDownloadTemplate}
                                className="btn-secondary font-bold py-2 px-4 rounded-md flex items-center gap-2 text-sm"
                            >
                                <DownloadIcon />
                                <span>Download Template</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                         <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">2</div>
                        <div>
                            <h3 className="font-semibold text-text-primary mb-1">Fill Out the Template</h3>
                            <p className="text-sm text-text-secondary">Open the downloaded CSV file and add your task information. Make sure to follow the format and don't change the column headers.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                         <div className="flex-shrink-0 bg-blue-500/20 text-blue-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">3</div>
                        <div>
                            <h3 className="font-semibold text-text-primary mb-1">Upload the File</h3>
                            <p className="text-sm text-text-secondary mb-3">Once your file is ready, upload it here to import the tasks.</p>
                             <button
                                type="button"
                                onClick={onUploadClick}
                                className="btn-primary font-bold py-2 px-4 rounded-md flex items-center gap-2 text-sm"
                            >
                                <UploadIcon />
                                <span>Upload CSV</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/20 border-t border-border-dark flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary font-bold py-2 px-4 rounded-md">Done</button>
                </div>
            </div>
        </div>
    );
};
