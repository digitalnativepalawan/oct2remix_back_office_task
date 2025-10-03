

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { FilterBar } from './components/FilterBar';
import { LaborTab } from './components/tabs/LaborTab';
import { MaterialsTab } from './components/tabs/MaterialsTab';
import { TasksTab } from './components/tabs/TasksTab';
import { InvoiceTab } from './components/tabs/InvoiceTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { TaskModal } from './components/modals/TaskModal';
import { MaterialModal } from './components/modals/MaterialModal';
import { LaborModal } from './components/modals/LaborModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { InvoiceDetailModal } from './components/modals/InvoiceDetailModal';
import { BulkTaskModal } from './components/modals/BulkTaskModal';
import { Footer } from './components/Footer';
import type { Tab, Status, Task, Comment, MaterialItem, LaborItem, InvoiceItem, Invoice, InvoiceStatus, SortConfig, ClientInfo } from './types';
import { TABS } from './constants';
import { useMockData } from './hooks/useMockData';

const LABOR_CSV_HEADERS = ['name', 'date', 'hours', 'rate', 'total', 'status'];
const MATERIALS_CSV_HEADERS = ['name', 'date', 'quantity', 'unitPrice', 'total', 'status', 'linkUrl', 'comments'];
const TASKS_CSV_HEADERS = ['title', 'date', 'dueDate', 'status', 'description', 'notes', 'imageUrl', 'linkUrl', 'comments'];


const App: React.FC = () => {
  const { initialLabor, initialMaterials, initialTasks, initialInvoices } = useMockData();

  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage`, error);
    }
    return defaultValue;
  };

  const [labor, setLabor] = useState<LaborItem[]>(() => loadFromStorage('laborData', initialLabor));
  const [materials, setMaterials] = useState<MaterialItem[]>(() => loadFromStorage('materialsData', initialMaterials));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('tasksData', initialTasks));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('invoicesData', initialInvoices));

  useEffect(() => {
    localStorage.setItem('laborData', JSON.stringify(labor));
  }, [labor]);
  
  useEffect(() => {
    localStorage.setItem('materialsData', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('tasksData', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('invoicesData', JSON.stringify(invoices));
  }, [invoices]);

  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | InvoiceStatus | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
  
  const [customLinks, setCustomLinks] = useState([
    { label: 'OTR Scan', url: 'https://receipt-capture-extract-738243500004.us-west1.run.app' },
    { label: 'Stratbox SEC', url: 'https://cleo-bingabeachpalawan-738243500004.us-west1.run.app' },
    { label: 'Online Order', url: 'https://onlineorder.palawancollective.com/' },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importTabRef = useRef<Tab | null>(null);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalTaskMode, setModalTaskMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isBulkTaskModalOpen, setIsBulkTaskModalOpen] = useState(false);


  // Material Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [modalMaterialMode, setModalMaterialMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);

  // Labor Modal State
  const [isLaborModalOpen, setIsLaborModalOpen] = useState(false);
  const [modalLaborMode, setModalLaborMode] = useState<'add' | 'edit'>('add');
  const [selectedLabor, setSelectedLabor] = useState<LaborItem | null>(null);

  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoiceDetailModalOpen, setIsInvoiceDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [suggestedInvoiceNumber, setSuggestedInvoiceNumber] = useState('');


  const unbilledItems = useMemo<InvoiceItem[]>(() => {
    const unpaidLabor = labor.filter(l => l.status === 'Unpaid' && l.name);

    type ConsolidatedLaborItem = {
        id: string;
        title: string;
        date: string;
        amount: number;
        status: Status;
        totalHours: number;
        originalIds: string[];
    };
    
    const consolidatedLabor: Record<string, ConsolidatedLaborItem> = unpaidLabor.reduce((acc: Record<string, ConsolidatedLaborItem>, item) => {
        const key = item.name.toLowerCase();
        if (!acc[key]) {
            acc[key] = {
                id: `inv-lab-${key.replace(/\s/g, '-')}`,
                title: item.name,
                date: item.date,
                amount: 0,
                status: 'Unpaid',
                totalHours: 0,
                originalIds: [],
            };
        }
        acc[key].amount += item.total;
        acc[key].totalHours += item.hours;
        acc[key].originalIds.push(item.id);
        if (new Date(item.date) > new Date(acc[key].date)) {
            acc[key].date = item.date;
        }
        return acc;
    }, {} as Record<string, ConsolidatedLaborItem>);

    const laborInvoiceItems: InvoiceItem[] = Object.values(consolidatedLabor).map(item => ({
        id: item.id,
        title: `${item.title} (Labor - ${item.totalHours.toFixed(2)} hrs)`,
        date: item.date,
        amount: item.amount,
        status: 'Unpaid',
        originalIds: item.originalIds,
        type: 'labor',
    }));

    const materialInvoiceItems: InvoiceItem[] = materials
      .filter(m => m.status === 'Unpaid')
      .map(m => ({
        id: `inv-mat-${m.id}`,
        title: m.name,
        date: m.date,
        amount: m.total,
        status: 'Unpaid',
        linkUrl: m.linkUrl,
        originalIds: [m.id],
        type: 'material',
      }));

    return [...laborInvoiceItems, ...materialInvoiceItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [labor, materials]);

  const draftInvoice = useMemo(() => {
    const draft = invoices.find(inv => inv.status === 'Draft');
    if (draft) {
        const unbilledTotal = unbilledItems.reduce((sum, item) => sum + item.amount, 0);
        return {
            ...draft,
            items: unbilledItems,
            total: unbilledTotal,
        };
    }
    return undefined;
  }, [invoices, unbilledItems]);

  const handleStatusChange = <T extends { id: string; status: Status | InvoiceStatus }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    status: Status | InvoiceStatus,
    itemType?: Tab
  ) => {
    if (itemType === 'Invoice') {
        const currentInvoices = items as unknown as Invoice[];
        const invoiceToUpdate = currentInvoices.find(inv => inv.id === id);
        if (!invoiceToUpdate) return;
        
        const newStatus = status as InvoiceStatus;

        // Transitioning FROM Draft TO Paid
        if (invoiceToUpdate.status === 'Draft' && newStatus === 'Paid') {
            const itemsToFinalize = [...unbilledItems];
            if (itemsToFinalize.length === 0) {
                alert("Cannot finalize an empty invoice. Please delete it instead.");
                return; // Abort status change
            }
            const finalTotal = itemsToFinalize.reduce((sum, item) => sum + item.amount, 0);

            const laborIdsToPay = itemsToFinalize.filter(i => i.type === 'labor').flatMap(i => i.originalIds);
            const materialIdsToPay = itemsToFinalize.filter(i => i.type === 'material').flatMap(i => i.originalIds);

            setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid', items: itemsToFinalize, total: finalTotal } : inv));
            setLabor(prev => prev.map(l => laborIdsToPay.includes(l.id) ? { ...l, status: 'Paid' } : l));
            setMaterials(prev => prev.map(m => materialIdsToPay.includes(m.id) ? { ...m, status: 'Paid' } : m));
            return;
        }

        // Transitioning FROM Paid BACK TO Draft
        if (invoiceToUpdate.status === 'Paid' && newStatus === 'Draft') {
            if (invoices.some(inv => inv.id !== id && inv.status === 'Draft')) {
                alert("Another draft invoice already exists. You can't have more than one draft at a time.");
                return; // Abort status change
            }
            const laborIdsToUnpay = invoiceToUpdate.items.filter(i => i.type === 'labor').flatMap(i => i.originalIds);
            const materialIdsToUnpay = invoiceToUpdate.items.filter(i => i.type === 'material').flatMap(i => i.originalIds);

            setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Draft', items: [], total: 0 } : inv));
            setLabor(prev => prev.map(l => laborIdsToUnpay.includes(l.id) ? { ...l, status: 'Unpaid' } : l));
            setMaterials(prev => prev.map(m => materialIdsToUnpay.includes(m.id) ? { ...m, status: 'Unpaid' } : m));
            return;
        }
    }
    
    // Default behavior for other item types or non-special invoice transitions
    setItems(items.map(item => (item.id === id ? { ...item, status } : item)));
  };


  const handleDelete = <T extends { id: string }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    id: string
  ) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        setItems(items.filter(item => item.id !== id));
    }
  };

  const handleInvoiceDelete = useCallback((invoiceId: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This will move all its items back to "Unpaid".')) {
        return;
    }

    const invoiceToDelete = invoices.find(inv => inv.id === invoiceId);
    if (!invoiceToDelete) return;

    const laborIdsToReset: string[] = [];
    const materialIdsToReset: string[] = [];

    invoiceToDelete.items.forEach(item => {
        if (item.type === 'labor') {
            laborIdsToReset.push(...item.originalIds);
        } else if (item.type === 'material') {
            materialIdsToReset.push(...item.originalIds);
        }
    });

    setLabor(prev => prev.map(l => laborIdsToReset.includes(l.id) ? { ...l, status: 'Unpaid' } : l));
    setMaterials(prev => prev.map(m => materialIdsToReset.includes(m.id) ? { ...m, status: 'Unpaid' } : m));

    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  }, [invoices]);

  const openTaskModal = useCallback((mode: 'add' | 'edit' | 'view', task?: Task) => {
    setModalTaskMode(mode);
    setSelectedTask(task || null);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  }, []);

  const openBulkTaskModal = useCallback(() => {
    setIsBulkTaskModalOpen(true);
  }, []);

  const closeBulkTaskModal = useCallback(() => {
    setIsBulkTaskModalOpen(false);
  }, []);
  
  const handleTaskSave = useCallback((task: Task) => {
    if (modalTaskMode === 'add') {
      setTasks(prev => [...prev, { ...task, id: `task-${Date.now()}` }]);
    } else {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
    closeTaskModal();
  }, [modalTaskMode, closeTaskModal]);

  const handleAddComment = useCallback((taskId: string, comment: Comment) => {
      setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === taskId) {
              const updatedTask = { ...task, comments: [...task.comments, comment] };
              setSelectedTask(updatedTask);
              return updatedTask;
          }
          return task;
      }));
  }, []);

  const openMaterialModal = useCallback((mode: 'add' | 'edit' | 'view', material?: MaterialItem) => {
    setModalMaterialMode(mode);
    setSelectedMaterial(material || null);
    setIsMaterialModalOpen(true);
  }, []);

  const closeMaterialModal = useCallback(() => {
    setIsMaterialModalOpen(false);
    setSelectedMaterial(null);
  }, []);

  const handleMaterialSave = useCallback((material: MaterialItem) => {
    if (modalMaterialMode === 'add') {
      setMaterials(prev => [...prev, { ...material, id: `mat-${Date.now()}` }]);
    } else {
      setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
    }
    closeMaterialModal();
  }, [modalMaterialMode, closeMaterialModal]);

  const handleAddMaterialComment = useCallback((materialId: string, comment: Comment) => {
      setMaterials(prevMaterials => prevMaterials.map(material => {
          if (material.id === materialId) {
              const updatedMaterial = { ...material, comments: [...material.comments, comment] };
              setSelectedMaterial(updatedMaterial);
              return updatedMaterial;
          }
          return material;
      }));
  }, []);

  const openLaborModal = useCallback((mode: 'add' | 'edit', laborItem?: LaborItem) => {
    setModalLaborMode(mode);
    setSelectedLabor(laborItem || null);
    setIsLaborModalOpen(true);
  }, []);

  const closeLaborModal = useCallback(() => {
    setIsLaborModalOpen(false);
    setSelectedLabor(null);
  }, []);

  const handleLaborSave = useCallback((laborItem: LaborItem) => {
    if (modalLaborMode === 'add') {
      setLabor(prev => [...prev, { ...laborItem, id: `lab-${Date.now()}` }]);
    } else {
      setLabor(prev => prev.map(l => l.id === laborItem.id ? laborItem : l));
    }
    closeLaborModal();
  }, [modalLaborMode, closeLaborModal]);
  
  const handleInvoiceSave = useCallback((invoiceData: { invoiceNumber: string; date: string; dueDate?: string; client: ClientInfo }) => {
    if (invoices.some(inv => inv.status === 'Draft')) {
        console.warn("Cannot create a new draft invoice while one already exists.");
        return;
    }
    
    const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoiceData.invoiceNumber,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
        client: invoiceData.client,
        items: [], // Empty for drafts
        total: 0, // Empty for drafts
        status: 'Draft',
    };

    setInvoices(prev => [...prev, newInvoice]);
    setIsInvoiceModalOpen(false);
  }, [invoices]);

  const openInvoiceDetailModal = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailModalOpen(true);
  }, []);

  const closeInvoiceDetailModal = useCallback(() => {
    setSelectedInvoice(null);
    setIsInvoiceDetailModalOpen(false);
  }, []);

    const getNextInvoiceNumber = (currentInvoices: Invoice[]): string => {
        if (currentInvoices.length === 0) {
            return 'INV-001';
        }

        const maxNumber = currentInvoices.reduce((max, inv) => {
            const match = inv.invoiceNumber.match(/\d+$/);
            const num = match ? parseInt(match[0], 10) : 0;
            return num > max ? num : max;
        }, 0);

        const nextNumber = maxNumber + 1;
        return `INV-${String(nextNumber).padStart(3, '0')}`;
    };

    const handleCreateOrViewInvoiceClick = useCallback(() => {
        if (draftInvoice) {
            openInvoiceDetailModal(draftInvoice);
        } else if (unbilledItems.length > 0) {
            const nextInvoiceNum = getNextInvoiceNumber(invoices);
            setSuggestedInvoiceNumber(nextInvoiceNum);
            setIsInvoiceModalOpen(true);
        }
    }, [unbilledItems.length, invoices, draftInvoice, openInvoiceDetailModal]);

  const handleAddClick = useCallback(() => {
    if (activeTab === 'Tasks') {
        openTaskModal('add');
    } else if (activeTab === 'Materials') {
        openMaterialModal('add');
    } else if (activeTab === 'Labor') {
        openLaborModal('add');
    } else if (activeTab === 'Invoice') {
        handleCreateOrViewInvoiceClick();
    }
  }, [activeTab, openTaskModal, openMaterialModal, openLaborModal, handleCreateOrViewInvoiceClick]);

  const handleDeleteAllForTab = useCallback(() => {
    if (activeTab === 'Dashboard') return;

    if (activeTab === 'Invoice') {
        if (invoices.length === 0) {
            alert(`There are no items to delete in the "Invoice" tab.`);
            return;
        }
        if (window.confirm(`Are you sure you want to delete all invoices? This will move all items in paid invoices back to "Unpaid". This action cannot be undone.`)) {
            const laborIdsToReset: string[] = [];
            const materialIdsToReset: string[] = [];

            invoices.forEach(invoice => {
                invoice.items.forEach(item => {
                    if (item.type === 'labor') {
                        laborIdsToReset.push(...item.originalIds);
                    } else if (item.type === 'material') {
                        materialIdsToReset.push(...item.originalIds);
                    }
                });
            });

            if (laborIdsToReset.length > 0) {
                setLabor(prev => prev.map(l => laborIdsToReset.includes(l.id) ? { ...l, status: 'Unpaid' } : l));
            }
            if (materialIdsToReset.length > 0) {
                setMaterials(prev => prev.map(m => materialIdsToReset.includes(m.id) ? { ...m, status: 'Unpaid' } : m));
            }

            setInvoices([]);
            alert(`All invoices have been deleted.`);
        }
        return;
    }

    // For Labor, Materials, Tasks
    let items: LaborItem[] | MaterialItem[] | Task[] = [];
    let setItems: React.Dispatch<React.SetStateAction<any>> | null = null;
    let itemType: 'labor' | 'material' | null = null;

    switch (activeTab) {
        case 'Labor':
            items = labor;
            setItems = setLabor;
            itemType = 'labor';
            break;
        case 'Materials':
            items = materials;
            setItems = setMaterials;
            itemType = 'material';
            break;
        case 'Tasks':
            items = tasks;
            setItems = setTasks;
            break;
    }

    if (items.length === 0) {
        alert(`There are no items to delete in the "${activeTab}" tab.`);
        return;
    }

    if (itemType) { // This will be true for Labor and Materials
        const hasItemsInPaidInvoice = invoices.some(invoice =>
            invoice.status === 'Paid' && invoice.items.some(item => item.type === itemType)
        );

        if (hasItemsInPaidInvoice) {
            alert(`Cannot delete all ${activeTab.toLowerCase()} as some are part of a paid invoice. Please revert the relevant invoice(s) to draft status or delete them before proceeding.`);
            return;
        }
    }

    if (window.confirm(`Are you sure you want to delete all items in the "${activeTab}" tab? This action cannot be undone.`)) {
        if (setItems) {
            setItems([]);
        }
        alert(`All items from the "${activeTab}" tab have been deleted.`);
    }
  }, [activeTab, labor, materials, tasks, invoices]);

  const handleSort = useCallback((key: 'date') => {
    setSortConfig(prevConfig => {
      const isAsc = prevConfig?.key === key && prevConfig.direction === 'ascending';
      return { key, direction: isAsc ? 'descending' : 'ascending' };
    });
  }, []);


  const filteredData = useMemo(() => {
    let data;
    switch(activeTab) {
      case 'Labor': data = labor; break;
      case 'Materials': data = materials; break;
      case 'Tasks': data = tasks; break;
      case 'Invoice':
        data = invoices.map(inv => {
            if (inv.status === 'Draft' && draftInvoice) {
                return draftInvoice;
            }
            return inv;
        });
        break;
      default: data = [];
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      const statusMatch = statusFilter === 'All' || item.status === statusFilter;
      const searchMatch = term === '' || Object.values(item).some(val => 
        String(val).toLowerCase().includes(term)
      );
      return statusMatch && searchMatch;
    });

    if (sortConfig.key) {
        return [...filtered].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (sortConfig.direction === 'ascending') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
    }

    return filtered;
  }, [activeTab, labor, materials, tasks, invoices, searchTerm, statusFilter, sortConfig, draftInvoice]);
  
  const paidInvoices = useMemo(() => invoices.filter(inv => inv.status === 'Paid').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [invoices]);

  const { paidTotal, unpaidTotal } = useMemo(() => {
    const allItems = [...labor, ...materials];
    const totals = allItems.reduce((acc, item) => {
      const amount = (item as any).total || (item as any).amount || 0;
      if (item.status === 'Paid') {
        acc.paid += amount;
      } else if (item.status === 'Unpaid') {
        acc.unpaid += amount;
      }
      return acc;
    }, { paid: 0, unpaid: 0 });
    return { paidTotal: totals.paid, unpaidTotal: totals.unpaid };
  }, [labor, materials]);
  
  const statusOptions = useMemo(() => {
    switch (activeTab) {
      case 'Invoice':
        return [
          { value: 'All', label: 'All Statuses' },
          { value: 'Draft', label: 'Draft' },
          { value: 'Paid', label: 'Paid' },
        ];
      case 'Tasks':
        return [
          { value: 'All', label: 'All Statuses' },
          { value: 'In Progress', label: 'In Progress' },
          { value: 'Completed', label: 'Completed' },
          { value: 'Unpaid', label: 'Unpaid' },
          { value: 'Paid', label: 'Paid' },
        ];
      case 'Labor':
      case 'Materials':
        return [
          { value: 'All', label: 'All Statuses' },
          { value: 'Paid', label: 'Paid' },
          { value: 'Unpaid', label: 'Unpaid' },
        ];
      default:
        return [{ value: 'All', label: 'All Statuses' }];
    }
  }, [activeTab]);


  const downloadFile = useCallback((content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);
  
  const handleExport = useCallback(() => {
    if (filteredData.length === 0) {
        alert('No data to export.');
        return;
    }

    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        let str = String(value);
        if (str.search(/("|,|\n)/g) >= 0) {
            str = '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    };

    let header = '';
    let rows: string[] = [];

    switch (activeTab) {
        case 'Labor': {
            const keys = LABOR_CSV_HEADERS;
            header = keys.join(',');
            rows = (filteredData as LaborItem[]).map(row => 
                keys.map(key => escapeCSV(row[key as keyof LaborItem])).join(',')
            );
            break;
        }
        case 'Materials': {
            const keys = MATERIALS_CSV_HEADERS;
            header = keys.join(',');
            rows = (filteredData as MaterialItem[]).map(row =>
                keys.map(key => {
                    if (key === 'comments') {
                        const commentTexts = Array.isArray(row.comments) ? row.comments.map((c: Comment) => c.text.replace(/\|/g, ' ')).join('|') : '';
                        return escapeCSV(commentTexts);
                    }
                    const val = row[key as keyof MaterialItem];
                    return escapeCSV(val);
                }).join(',')
            );
            break;
        }
        case 'Tasks': {
            const keys = TASKS_CSV_HEADERS;
            header = keys.join(',');
            rows = (filteredData as Task[]).map(row => 
                keys.map(key => {
                    if (key === 'comments') {
                        const commentTexts = Array.isArray(row.comments) ? row.comments.map((c: Comment) => c.text.replace(/\|/g, ' ')).join('|') : '';
                        return escapeCSV(commentTexts);
                    }
                    const val = row[key as keyof Task];
                    return escapeCSV(val);
                }).join(',')
            );
            break;
        }
        case 'Invoice':
            alert("Exporting invoices is not yet supported.");
            return;
        default:
            alert(`Export not implemented for ${activeTab}`);
            return;
    }

    const csvContent = [header, ...rows].join('\n');
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadFile(csvContent, `${activeTab.toLowerCase()}_export_${timestamp}.csv`, 'text/csv;charset=utf-8;');
  }, [filteredData, activeTab, downloadFile]);

  const handleDownloadTemplate = useCallback(() => {
      if (activeTab === 'Invoice') {
        alert("Invoices are auto-generated. A template is not applicable.");
        return;
      }
      let headers = '';
      switch (activeTab) {
          case 'Labor':
              headers = LABOR_CSV_HEADERS.join(',');
              break;
          case 'Materials':
              headers = MATERIALS_CSV_HEADERS.join(',');
              break;
          case 'Tasks':
              headers = TASKS_CSV_HEADERS.join(',');
              break;
      }
      if (headers) {
        downloadFile(headers, `${activeTab.toLowerCase()}_template.csv`, 'text/csv;charset=utf-8;');
      }
  }, [activeTab, downloadFile]);

  const handleImportClick = () => {
      if (activeTab === 'Invoice' || activeTab === 'Dashboard') {
        alert(`Import is not supported for the "${activeTab}" tab.`);
        return;
      }
      importTabRef.current = activeTab;
      fileInputRef.current?.click();
  };

  const handleBulkUploadClick = useCallback(() => {
    importTabRef.current = 'Tasks';
    fileInputRef.current?.click();
  }, []);
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const tabToImportTo = importTabRef.current;
      if (!tabToImportTo) {
          alert('Could not determine which tab to import to. Please try again.');
          return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
          const content = e.target?.result as string;
          try {
              const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
              if (lines.length === 0) {
                  throw new Error("CSV file is empty or contains only whitespace.");
              }

              const parseCsvRow = (rowString: string): string[] => {
                  const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(,|$)/g;
                  const values: string[] = [];
                  let match;
                  regex.lastIndex = 0;
                  
                  let tempRowString = rowString.trim();
                  if (tempRowString.slice(-1) === ',') tempRowString += ' ';

                  while ((match = regex.exec(tempRowString))) {
                      let value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
                      values.push(value.trim());
                      if (match[3] === '' || regex.lastIndex >= tempRowString.length) break;
                  }
                  return values;
              };

              const headers = parseCsvRow(lines[0]);
              const rows = lines.slice(1);
              
              if (rows.length === 0) {
                  alert("The selected file only contains a header row. No data was imported.");
                  if (event.target) event.target.value = '';
                  importTabRef.current = null;
                  return;
              }

              const parsedData = rows.map((rowStr, index) => {
                  const rowNumber = index + 2; // Line number in the original file
                  const values = parseCsvRow(rowStr);
                  
                  if (values.length === headers.length + 1 && values[values.length - 1] === '') {
                      values.pop();
                  }

                   if (values.length !== headers.length) {
                    console.warn(`Skipping row ${rowNumber}: Incorrect number of columns. Expected ${headers.length}, but found ${values.length}.`);
                    return null;
                  }
                  return headers.reduce((obj, header, index) => {
                      obj[header.trim().toLowerCase()] = values[index] || '';
                      return obj;
                  }, {} as Record<string, string>);
              }).filter(item => item !== null) as Record<string, string>[];

              switch (tabToImportTo) {
                  case 'Labor':
                      const newLabor: LaborItem[] = parsedData.map((row, i) => ({
                          id: `imported-lab-${Date.now()}-${i}`, name: row.name, date: row.date,
                          hours: parseFloat(row.hours) || 0, rate: parseFloat(row.rate) || 0,
                          total: (parseFloat(row.hours) || 0) * (parseFloat(row.rate) || 0),
                          status: row.status === 'Paid' ? 'Paid' : 'Unpaid',
                      }));
                      setLabor(prev => [...prev, ...newLabor]);
                      break;
                  case 'Materials':
                      const newMaterials: MaterialItem[] = parsedData.map((row, i) => {
                          const comments: Comment[] = [];
                          if (row.comments) {
                              row.comments.split('|').forEach((text, j) => {
                                  if (text.trim()) {
                                      comments.push({
                                          id: `imported-comment-mat-${Date.now()}-${i}-${j}`,
                                          author: 'Imported',
                                          text: text.trim(),
                                          timestamp: new Date().toISOString(),
                                      });
                                  }
                              });
                          }
                          return {
                              id: `imported-mat-${Date.now()}-${i}`, name: row.name, date: row.date,
                              quantity: parseFloat(row.quantity) || 0, unitPrice: parseFloat(row.unitPrice) || 0,
                              total: (parseFloat(row.quantity) || 0) * (parseFloat(row.unitPrice) || 0),
                              status: row.status === 'Paid' ? 'Paid' : 'Unpaid', linkUrl: row.linkUrl,
                              comments: comments,
                          };
                      });
                      setMaterials(prev => [...prev, ...newMaterials]);
                      break;
                   case 'Tasks':
                      const newTasks: Task[] = parsedData.map((row, i) => {
                          const comments: Comment[] = [];
                          if (row.comments) {
                               row.comments.split('|').forEach((text, j) => {
                                   if (text.trim()) {
                                       comments.push({
                                           id: `imported-comment-task-${Date.now()}-${i}-${j}`,
                                           author: 'Imported',
                                           text: text.trim(),
                                           timestamp: new Date().toISOString(),
                                       });
                                   }
                               });
                           }
                          return {
                              id: `imported-task-${Date.now()}-${i}`, title: row.title, date: row.date,
                              dueDate: row.dueDate || undefined,
                              status: ['In Progress', 'Completed', 'Paid', 'Unpaid'].includes(row.status) ? row.status as Status : 'In Progress',
                              description: row.description, notes: row.notes, imageUrl: row.imageUrl, linkUrl: row.linkUrl,
                              comments: comments, 
                              checklist: []
                          };
                      });
                      setTasks(prev => [...prev, ...newTasks]);
                      break;
                  default: throw new Error('Unsupported tab for import.');
              }
              alert(`${parsedData.length} items imported successfully to ${tabToImportTo}!`);
          } catch (error) {
              console.error("Import failed:", error);
              alert(`Failed to import data. Please check file format. Error: ${error instanceof Error ? error.message : String(error)}`);
          } finally {
              if (event.target) event.target.value = '';
              importTabRef.current = null;
          }
      };
      reader.onerror = () => {
          alert('Error reading file.');
          if (event.target) event.target.value = '';
          importTabRef.current = null;
      };
      reader.readAsText(file);
  };

  const handleReset = useCallback(() => {
      if (window.confirm('Are you sure you want to reset ALL data? This action cannot be undone.')) {
          setLabor([]);
          setMaterials([]);
          setTasks([]);
          setInvoices([]);
          localStorage.removeItem('laborData');
          localStorage.removeItem('materialsData');
          localStorage.removeItem('tasksData');
          localStorage.removeItem('invoicesData');
          alert('All data has been reset.');
      }
  }, []);


  const renderTabContent = () => {
    switch(activeTab) {
      case 'Dashboard':
        return <DashboardTab 
          labor={labor} 
          materials={materials} 
          tasks={tasks} 
          onEditTask={(task) => openTaskModal('edit', task)}
          onDeleteTask={(id) => handleDelete(tasks, setTasks, id)}
        />;
      case 'Labor':
        return <LaborTab 
            data={filteredData as any} 
            onStatusChange={(id, status) => handleStatusChange(labor, setLabor, id, status)}
            onDelete={(id) => handleDelete(labor, setLabor, id)}
            onEdit={(laborItem) => openLaborModal('edit', laborItem)}
            sortConfig={sortConfig}
            onSort={handleSort}
        />;
      case 'Materials':
        return <MaterialsTab 
            data={filteredData as any}
            onStatusChange={(id, status) => handleStatusChange(materials, setMaterials, id, status)}
            onDelete={(id) => handleDelete(materials, setMaterials, id)}
            onEdit={(material) => openMaterialModal('edit', material)}
            onView={(material) => openMaterialModal('view', material)}
            sortConfig={sortConfig}
            onSort={handleSort}
        />;
      case 'Tasks':
        return <TasksTab 
            data={filteredData as any}
            onDelete={(id) => handleDelete(tasks, setTasks, id)}
            onEdit={(task) => openTaskModal('edit', task)}
            onView={(task) => openTaskModal('view', task)}
            onStatusChange={(id, status) => handleStatusChange(tasks, setTasks, id, status)}
            sortConfig={sortConfig}
            onSort={handleSort}
            paidInvoices={paidInvoices}
            onViewInvoice={openInvoiceDetailModal}
        />;
      case 'Invoice':
        return <InvoiceTab 
            data={filteredData as Invoice[]}
            onStatusChange={(id, status) => handleStatusChange(invoices, setInvoices, id, status, 'Invoice')}
            onDelete={handleInvoiceDelete}
            onView={openInvoiceDetailModal}
            sortConfig={sortConfig}
            onSort={handleSort}
        />;
      default:
        return null;
    }
  }
  
  const isAddInvoiceDisabled = unbilledItems.length === 0 && !draftInvoice;
  const isAddDisabled = activeTab === 'Invoice' && isAddInvoiceDisabled;

  const statCardAction = useMemo(() => {
      if (unbilledItems.length > 0 || draftInvoice) {
          return {
              label: draftInvoice ? 'View Draft' : 'Create Invoice',
              onClick: handleCreateOrViewInvoiceClick
          };
      }
      return undefined;
  }, [unbilledItems.length, draftInvoice, handleCreateOrViewInvoiceClick]);

  const addButtonText = useMemo(() => {
    if (activeTab !== 'Invoice') return 'Add New';
    return draftInvoice ? 'View Draft' : 'Add Invoice';
  }, [activeTab, draftInvoice]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header 
            paidTotal={paidTotal} 
            unpaidTotal={unpaidTotal} 
            onExportClick={handleExport}
            onTemplateClick={handleDownloadTemplate}
            onImportClick={handleImportClick}
            onResetClick={handleReset}
            customLinks={customLinks}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
          <StatCard title="LABOR" value={labor.length} icon="wrench" />
          <StatCard title="MATERIALS" value={materials.length} icon="box" />
          <StatCard 
            title="UNBILLED ITEMS" 
            value={unbilledItems.length} 
            icon="invoice" 
            action={statCardAction}
          />
          <StatCard title="INVOICES" value={invoices.length} icon="folder" />
        </div>

        <div className="glass-card p-6">
            <div className="flex justify-between items-center">
                <nav className="flex space-x-2" aria-label="Tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`relative whitespace-nowrap py-3 px-4 font-medium text-sm transition-colors rounded-md ${
                                activeTab === tab
                                    ? 'text-white'
                                    : 'text-text-secondary hover:text-white'
                            }`}
                        >
                            {activeTab === tab && (
                                <span className="absolute inset-0 bg-blue-600/20 rounded-md z-0"></span>
                            )}
                            <span className="relative z-10">{tab}</span>
                             {activeTab === tab && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-accent rounded-full"></span>
                            )}
                        </button>
                    ))}
                </nav>
                {activeTab !== 'Dashboard' && (
                    <div className="hidden sm:block">
                        <FilterBar 
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            onAddClick={handleAddClick}
                            showAddButton={['Tasks', 'Materials', 'Labor', 'Invoice'].includes(activeTab)}
                            onDeleteAllClick={handleDeleteAllForTab}
                            showDeleteAllButton={['Tasks', 'Materials', 'Labor', 'Invoice'].includes(activeTab)}
                            statusOptions={statusOptions}
                            activeTab={activeTab}
                            showBulkAddButton={activeTab === 'Tasks'}
                            onBulkAddClick={openBulkTaskModal}
                            isAddDisabled={isAddDisabled}
                            addButtonText={addButtonText}
                        />
                    </div>
                )}
            </div>
            
            {activeTab !== 'Dashboard' && (
                <div className="sm:hidden mt-4">
                    <FilterBar 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        onAddClick={handleAddClick}
                        showAddButton={['Tasks', 'Materials', 'Labor', 'Invoice'].includes(activeTab)}
                        onDeleteAllClick={handleDeleteAllForTab}
                        showDeleteAllButton={['Tasks', 'Materials', 'Labor', 'Invoice'].includes(activeTab)}
                        statusOptions={statusOptions}
                        activeTab={activeTab}
                        showBulkAddButton={activeTab === 'Tasks'}
                        onBulkAddClick={openBulkTaskModal}
                        isAddDisabled={isAddDisabled}
                        addButtonText={addButtonText}
                    />
                </div>
            )}
            
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
        
        <Footer />
        
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv"
            className="hidden"
            aria-hidden="true"
        />

        {isTaskModalOpen && selectedTask !== undefined && (
          <TaskModal 
            isOpen={isTaskModalOpen}
            onClose={closeTaskModal}
            mode={modalTaskMode}
            task={selectedTask}
            onSave={handleTaskSave}
            onAddComment={handleAddComment}
          />
        )}
        {isMaterialModalOpen && (
          <MaterialModal
            isOpen={isMaterialModalOpen}
            onClose={closeMaterialModal}
            mode={modalMaterialMode}
            material={selectedMaterial}
            onSave={handleMaterialSave}
            onAddComment={handleAddMaterialComment}
          />
        )}
        {isLaborModalOpen && (
          <LaborModal
            isOpen={isLaborModalOpen}
            onClose={closeLaborModal}
            mode={modalLaborMode}
            labor={selectedLabor}
            onSave={handleLaborSave}
          />
        )}
        {isInvoiceModalOpen && (
          <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
            onSave={handleInvoiceSave}
            items={unbilledItems}
            suggestedInvoiceNumber={suggestedInvoiceNumber}
          />
        )}
        {isInvoiceDetailModalOpen && selectedInvoice && (
          <InvoiceDetailModal
            isOpen={isInvoiceDetailModalOpen}
            onClose={closeInvoiceDetailModal}
            invoice={selectedInvoice}
          />
        )}
        {isBulkTaskModalOpen && (
            <BulkTaskModal
                isOpen={isBulkTaskModalOpen}
                onClose={closeBulkTaskModal}
                onDownloadTemplate={handleDownloadTemplate}
                onUploadClick={handleBulkUploadClick}
            />
        )}
      </div>
    </div>
  );
};

export default App;