

import React from 'react';

interface StatCardAction {
    label: string;
    onClick: () => void;
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: 'wrench' | 'box' | 'invoice' | 'folder';
    action?: StatCardAction;
}

const Icon: React.FC<{ icon: StatCardProps['icon'] }> = ({ icon }) => {
    let path, colorClass;
    switch (icon) {
        case 'wrench':
            path = <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.878-5.878m-5.878 5.878L3 21m0 0h3.75L3 21m0 0V17.25m5.878-5.878L3 11.42m5.878 5.878L11.42 3l5.878 5.878-5.878 5.878Z" />;
            colorClass = 'text-blue-400';
            break;
        case 'box':
            path = <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />;
            colorClass = 'text-orange-400';
            break;
        case 'invoice':
             path = <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 5.25 6h.75m1.5.75V8.25m0 12.75v-1.5m0 0V8.25m0 11.25h-1.5m1.5 0v-1.5m0 0h1.5m-1.5 0V8.25m-1.5 0h-1.5v1.5m0-1.5v-1.5m1.5 0v-1.5m0 0V3.75m0 0h1.5" />;
             colorClass = 'text-yellow-400';
             break;
        case 'folder':
             path = <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />;
             colorClass = 'text-green-400';
             break;
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-7 h-7 ${colorClass}`}>
            {path}
        </svg>
    )
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, action }) => {
    return (
        <div className="glass-card p-5 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">{title}</p>
                    <Icon icon={icon} />
                </div>
            </div>
            <div className="mt-2 flex items-end justify-between">
                <p className="text-4xl font-semibold text-text-primary">{value}</p>
                {action && (
                     <button
                        type="button"
                        onClick={action.onClick}
                        className="btn-secondary text-xs font-semibold py-1.5 px-3 rounded-md transition-all hover:shadow-lg flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};
