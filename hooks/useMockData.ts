import type { LaborItem, MaterialItem, Task, Invoice } from '../types';

const getRelativeDate = (dayOffset: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date;
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const useMockData = () => {
  const initialLabor: LaborItem[] = [
    { id: 'lab-mock-1', name: 'JR x', date: formatDate(getRelativeDate(-2)), hours: 8, rate: 25, total: 200, status: 'Unpaid' },
    { id: 'lab-mock-2', name: 'Leo x', date: formatDate(getRelativeDate(-1)), hours: 6, rate: 30, total: 180, status: 'Unpaid' },
    { id: 'lab-mock-3', name: 'Boyy x', date: formatDate(getRelativeDate(-5)), hours: 7, rate: 28, total: 196, status: 'Paid' },
    { id: 'lab-mock-4', name: 'Beth x', date: formatDate(getRelativeDate(-3)), hours: 8, rate: 26, total: 208, status: 'Unpaid' },
    { id: 'lab-mock-5', name: 'David x', date: formatDate(getRelativeDate(-4)), hours: 5, rate: 35, total: 175, status: 'Paid' },
    { id: 'lab-mock-6', name: 'Queenie x', date: formatDate(getRelativeDate(0)), hours: 4, rate: 22, total: 88, status: 'Unpaid' },
  ];

  const initialMaterials: MaterialItem[] = [
    { id: 'mat-mock-1', name: 'Cement Bags (40kg)', date: formatDate(getRelativeDate(-5)), quantity: 20, unitPrice: 5.50, total: 110, status: 'Unpaid', linkUrl: 'https://example.com/cement', comments: [] },
    { id: 'mat-mock-2', name: 'Plywood Sheets (4x8)', date: formatDate(getRelativeDate(-2)), quantity: 15, unitPrice: 12, total: 180, status: 'Paid', comments: [
      { id: 'c-mock-1', author: 'Admin', text: 'Delivered to site B.', timestamp: new Date().toISOString() }
    ] },
    { id: 'mat-mock-3', name: 'Steel Rebar (10mm)', date: formatDate(getRelativeDate(-1)), quantity: 100, unitPrice: 2, total: 200, status: 'Unpaid', comments: [] },
  ];

  const initialTasks: Task[] = [
    { 
      id: 'task-mock-1', 
      title: 'Foundation Pouring', 
      description: 'Pour the concrete foundation for the main structure. Area is 100sqm.', 
      notes: 'Weather must be dry. Check forecast morning of. Need 3-person crew minimum.', 
      status: 'Completed', 
      date: formatDate(getRelativeDate(-5)), 
      dueDate: formatDate(getRelativeDate(-2)),
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop',
      linkUrl: 'https://example.com/foundation-specs',
      comments: [
        { id: 'c-mock-2', author: 'Admin', text: 'Pour completed successfully. Curing started.', timestamp: new Date().toISOString() }
      ], 
      checklist: [
        { id: 'ci-mock-1', text: 'Excavate area', completed: true },
        { id: 'ci-mock-2', text: 'Lay rebar grid', completed: true },
        { id: 'ci-mock-3', text: 'Pour concrete', completed: true },
      ] 
    },
    { 
      id: 'task-mock-2', 
      title: 'Structural Framing', 
      description: 'Erect the steel frame for the building.', 
      notes: 'Crane required for I-beams.', 
      status: 'In Progress', 
      date: formatDate(getRelativeDate(-2)), 
      dueDate: formatDate(getRelativeDate(7)),
      imageUrl: '',
      linkUrl: '',
      comments: [], 
      checklist: [
        { id: 'ci-mock-4', text: 'Lift main columns', completed: true },
        { id: 'ci-mock-5', text: 'Install horizontal beams', completed: false },
        { id: 'ci-mock-6', text: 'Bolt and torque all connections', completed: false },
      ]
    },
    { 
      id: 'task-mock-3', 
      title: 'Client Meeting & Sign-off', 
      description: 'Final walkthrough with the client for Phase 1 sign-off.', 
      notes: 'Prepare all necessary documentation and change orders.', 
      status: 'In Progress', 
      date: formatDate(getRelativeDate(-1)),
      imageUrl: '',
      linkUrl: '',
      comments: [], 
      checklist: []
    },
  ];

  const initialInvoices: Invoice[] = [];

  return { initialLabor, initialMaterials, initialTasks, initialInvoices };
};