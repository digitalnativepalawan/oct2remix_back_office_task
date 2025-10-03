


import React, { useMemo, useState } from 'react';
import type { LaborItem, MaterialItem, Task, Status } from '../../types';
import { formatRelativeDate, formatDisplayDate } from '../../utils/date';
import { ActionButton, TrashIcon } from '../Icons';
import { LinkIcon } from '../LinkIcon';

interface DashboardTabProps {
    labor: LaborItem[];
    materials: MaterialItem[];
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
}

const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

interface TooltipData {
    x: number;
    y: number;
    label: string;
    value: string;
    color: string;
}

const DonutChart: React.FC<{ 
    data: Array<{ label: string; value: number; color: string }>, 
    title: string,
    valueFormatter?: (value: number) => string 
}> = ({ data, title, valueFormatter }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const formatter = valueFormatter || currencyFormatter.format;

    const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    if (totalValue === 0) {
        return <div className="glass-card p-6 flex items-center justify-center h-full text-text-secondary">No data to display</div>;
    }

    const radius = 80;
    const innerRadius = 65; // Thinner ring
    const size = radius * 2;
    let cumulativeAngle = -90; // Start at 12 o'clock

    const getCoordinates = (angle: number, r: number) => ({
        x: size / 2 + r * Math.cos(angle * Math.PI / 180),
        y: size / 2 + r * Math.sin(angle * Math.PI / 180),
    });

    return (
        <div className="glass-card p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <div className="relative flex-grow flex items-center justify-center my-4">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={title}>
                    <g>
                        {data.map(item => {
                            const angle = (item.value / totalValue) * 360;
                            const start = getCoordinates(cumulativeAngle, radius);
                            const end = getCoordinates(cumulativeAngle + angle, radius);
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            const innerStart = getCoordinates(cumulativeAngle, innerRadius);
                            const innerEnd = getCoordinates(cumulativeAngle + angle, innerRadius);

                            const pathData = [
                                `M ${start.x} ${start.y}`,
                                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
                                `L ${innerEnd.x} ${innerEnd.y}`,
                                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
                                'Z'
                            ].join(' ');
                            
                            const midAngle = cumulativeAngle + angle / 2;
                            const midRadius = (radius + innerRadius) / 2;
                            const tooltipPos = getCoordinates(midAngle, midRadius);

                            cumulativeAngle += angle;

                            const handleMouseEnter = () => {
                                setTooltip({
                                    x: tooltipPos.x,
                                    y: tooltipPos.y,
                                    label: item.label,
                                    value: `${formatter(item.value)} (${((item.value / totalValue) * 100).toFixed(1)}%)`,
                                    color: item.color,
                                });
                            };
                            
                            return (
                                <path 
                                    key={item.label} 
                                    d={pathData} 
                                    fill={item.color} 
                                    className="transition-transform duration-200 hover:scale-105"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={() => setTooltip(null)}
                                    aria-label={`${item.label}: ${formatter(item.value)}`}
                                />
                            );
                        })}
                    </g>
                </svg>
                 {tooltip && (
                    <div 
                        className="absolute bg-component-dark text-white text-xs rounded py-1 px-2 pointer-events-none shadow-lg" 
                        style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -50%)', transition: 'top 0.2s, left 0.2s' }}>
                        <div className="font-bold">{tooltip.label}</div>
                        <div>{tooltip.value}</div>
                    </div>
                )}
            </div>
            <div className="w-full space-y-2">
                {data.map(item => {
                    const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0.0';
                    return (
                        <div key={item.label} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-text-secondary">{item.label}</span>
                            </div>
                            <div className="text-right">
                                 <span className="font-medium text-text-primary">{formatter(item.value)}</span>
                                 <span className="text-xs text-text-tertiary ml-2 w-12 inline-block text-left">({percentage}%)</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 pt-3 border-t border-border-dark flex justify-between items-center text-base font-semibold">
                <span className="text-text-primary">Total</span>
                <span className="text-text-primary">{formatter(totalValue)}</span>
            </div>
        </div>
    );
};


const LineChart: React.FC<{ data: Array<{ label: string; value: number }>, title: string }> = ({ data, title }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    if (data.length === 0) {
        return (
            <div className="glass-card p-6 lg:col-span-3">
                <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
                <div className="flex items-center justify-center h-64 text-text-secondary">No data to display</div>
            </div>
        );
    }
    
    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value), 0) * 1.1 || 1;

    const yAxisLabels = useMemo(() => {
        const ticks = 5;
        if (maxValue <= 1) return [{ value: 0, y: chartHeight }];
        return Array.from({ length: ticks + 1 }).map((_, i) => {
            const value = (maxValue / ticks) * i;
            return {
                value,
                y: chartHeight - (value / maxValue) * chartHeight
            };
        });
    }, [maxValue, chartHeight]);

    const points = data.map((d, i) => {
        const x = data.length > 1 ? (chartWidth / (data.length - 1)) * i : chartWidth / 2;
        const y = chartHeight - (d.value / maxValue) * chartHeight;
        return { x, y };
    });

    const pathData = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    const areaPathData = pathData + ` L ${points[points.length-1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

    return (
        <div className="glass-card p-6 lg:col-span-3 relative overflow-x-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
             <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[600px]" role="figure" aria-label={title}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Y-Axis */}
                    <g className="text-text-tertiary" aria-hidden="true">
                        {yAxisLabels.map(({ value, y }) => (
                            <g key={value} transform={`translate(0, ${y})`}>
                                <line x1="-5" x2={chartWidth} stroke="var(--color-border)" strokeDasharray="2,2" />
                                <text x="-10" dy=".32em" textAnchor="end" fontSize="12" fill="currentColor">
                                    {currencyFormatter.format(value).replace(/\.00$/, '')}
                                </text>
                            </g>
                        ))}
                    </g>
                     {/* X-Axis Labels */}
                    {data.map((d, i) => (
                         <text
                            key={d.label}
                            x={points[i].x}
                            y={chartHeight + 20}
                            textAnchor="middle"
                            fontSize="12"
                            fill="var(--color-text-secondary)"
                        >
                            {d.label}
                        </text>
                    ))}

                    {/* Gradient Area */}
                    {points.length > 1 && <path d={areaPathData} fill="url(#areaGradient)" />}

                    {/* Line Path */}
                    {points.length > 1 && <path d={pathData} fill="none" stroke="var(--color-accent)" strokeWidth="2" />}

                    {/* Data Points */}
                    {data.map((d, i) => {
                        const handleMouseEnter = (e: React.MouseEvent) => {
                             const parentRect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                             if(!parentRect) return;
                             setTooltip({
                                x: points[i].x,
                                y: points[i].y - 15,
                                label: d.label,
                                value: currencyFormatter.format(d.value),
                                color: 'var(--color-accent)',
                             });
                        };

                        return (
                            <g key={`${d.label}-point`}>
                                <circle
                                    cx={points[i].x}
                                    cy={points[i].y}
                                    r="8"
                                    fill="transparent"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={() => setTooltip(null)}
                                    aria-label={`${d.label}: ${currencyFormatter.format(d.value)}`}
                                />
                                <circle 
                                    cx={points[i].x}
                                    cy={points[i].y}
                                    r="4"
                                    fill="var(--color-accent)"
                                    className="pointer-events-none group-hover:opacity-100 transition-opacity"
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>
            {tooltip && (
                <div 
                    className="absolute bg-component-dark text-white text-xs rounded py-1 px-2 pointer-events-none transform -translate-x-1/2" 
                    style={{ left: tooltip.x + margin.left, top: tooltip.y + margin.top }}>
                    <div className="font-bold">{tooltip.label}</div>
                    <div>{tooltip.value}</div>
                </div>
            )}
        </div>
    );
};

const taskStatusColorMap: Record<Status, string> = {
    'In Progress': 'bg-blue-500',
    'Completed': 'bg-green-500',
    'Unpaid': 'bg-red-500',
    'Paid': 'bg-purple-500',
};

export const DashboardTab: React.FC<DashboardTabProps> = ({ labor, materials, tasks, onEditTask, onDeleteTask }) => {

    const statusData = useMemo(() => {
        const combined = [...labor, ...materials];
        const paid = combined.filter(item => item.status === 'Paid').reduce((sum, item) => sum + item.total, 0);
        const unpaid = combined.filter(item => item.status === 'Unpaid').reduce((sum, item) => sum + item.total, 0);
        
        return [
            { label: 'Paid', value: paid, color: '#22c55e' },
            { label: 'Unpaid', value: unpaid, color: '#ef4444' },
        ];
    }, [labor, materials]);

    const typeData = useMemo(() => {
        const totalLabor = labor.reduce((sum, item) => sum + item.total, 0);
        const totalMaterials = materials.reduce((sum, item) => sum + item.total, 0);

        return [
            { label: 'Labor', value: totalLabor, color: '#3b82f6' },
            { label: 'Materials', value: totalMaterials, color: '#f97316' },
        ];
    }, [labor, materials]);

    const taskStatusData = useMemo(() => {
        const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<Status, number>);

        return [
            { label: 'In Progress', value: statusCounts['In Progress'] || 0, color: '#3b82f6' },
            { label: 'Completed', value: statusCounts['Completed'] || 0, color: '#22c55e' },
            { label: 'Unpaid', value: statusCounts['Unpaid'] || 0, color: '#ef4444' },
            { label: 'Paid', value: statusCounts['Paid'] || 0, color: '#a855f7' },
        ].filter(d => d.value > 0);
    }, [tasks]);

    const monthlyData = useMemo(() => {
        const combined = [...labor, ...materials];
        const monthlyTotals: { [key: string]: number } = {};

        combined.forEach(item => {
            const month = new Date(item.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += item.total;
        });

        const sortedMonths = Object.keys(monthlyTotals).sort((a, b) => {
             const [monthA, yearA] = a.split(' ');
             const [monthB, yearB] = b.split(' ');
             const dateA = new Date(`01 ${monthA} 20${yearA}`);
             const dateB = new Date(`01 ${monthB} 20${yearB}`);
             return dateA.getTime() - dateB.getTime();
        });

        return sortedMonths.map(month => ({
            label: month,
            value: monthlyTotals[month],
        }));

    }, [labor, materials]);

    const recentTasks = useMemo(() => {
        return [...tasks]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [tasks]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 glass-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Tasks</h3>
                {recentTasks.length > 0 ? (
                    <div>
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="border-b border-border-dark">
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell">Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell">Due Date</th>
                                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell">Link</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTasks.map(task => {
                                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Completed', 'Paid'].includes(task.status);
                                    return (
                                        <tr 
                                            key={task.id} 
                                            className="border-b border-border-dark table-row-hover cursor-pointer"
                                            onClick={() => onEditTask(task)}
                                        >
                                            <td className="px-4 py-4 text-sm font-medium text-text-primary break-words">{task.title}</td>
                                            <td className="px-4 py-4 text-sm text-text-secondary">
                                                <span className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${taskStatusColorMap[task.status] || 'bg-gray-500'}`}></span>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-text-secondary hidden md:table-cell">
                                                <time dateTime={task.date} title={new Date(task.date).toLocaleString()}>
                                                    {formatRelativeDate(task.date)}
                                                </time>
                                            </td>
                                            <td className={`px-4 py-4 text-sm hidden md:table-cell ${isOverdue ? 'text-red-400 font-semibold' : 'text-text-secondary'}`}>
                                                {task.dueDate ? (
                                                    <time dateTime={task.dueDate} title={new Date(task.dueDate).toLocaleString()}>
                                                        {formatDisplayDate(task.dueDate)}
                                                    </time>
                                                ) : (
                                                    <span className="text-text-tertiary">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center hidden md:table-cell">
                                                <LinkIcon url={task.linkUrl} />
                                            </td>
                                            <td className="px-4 py-4 text-sm text-right hidden md:table-cell">
                                                <ActionButton 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteTask(task.id);
                                                    }} 
                                                    tooltip="Delete Task"
                                                    className="hover:text-red-500"
                                                >
                                                    <TrashIcon />
                                                </ActionButton>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32 text-text-secondary">
                        No tasks yet. Create one in the Tasks tab!
                    </div>
                )}
            </div>
            <DonutChart data={statusData} title="Cost Breakdown by Status" />
            <DonutChart data={typeData} title="Cost Breakdown by Type" />
            <DonutChart data={taskStatusData} title="Tasks by Status" valueFormatter={(value) => `${value} task${value !== 1 ? 's' : ''}`} />
            <LineChart data={monthlyData} title="Monthly Costs" />
        </div>
    );
};