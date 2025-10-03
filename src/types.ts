

export type Status = 'Paid' | 'Unpaid' | 'In Progress' | 'Completed';

export type Tab = 'Dashboard' | 'Labor' | 'Materials' | 'Tasks' | 'Invoice';

export interface LaborItem {
  id: string;
  name: string;
  date: string;
  hours: number;
  rate: number;
  total: number;
  status: Status;
}

export interface MaterialItem {
    id: string;
    name: string;
    date: string;
    quantity: number;
    unitPrice: number;
    total: number;
    status: Status;
    linkUrl?: string;
    comments: Comment[];
}

export interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
    linkUrl?: string;
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    notes: string;
    status: Status;
    date: string;
    dueDate?: string;
    imageUrl?: string;
    linkUrl?: string;
    comments: Comment[];
    checklist: ChecklistItem[];
}

export interface InvoiceItem {
  id: string;
  title: string;
  date: string;
  amount: number;
  status: Status;
  linkUrl?: string;
  originalIds: string[];
  type: 'labor' | 'material';
}

export type InvoiceStatus = 'Draft' | 'Paid';

export interface ClientInfo {
  name: string;
  address?: string;
  vatInfo?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

export interface Invoice {
  id:string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  total: number;
  status: InvoiceStatus;
  client: ClientInfo;
}

export type SortDirection = 'ascending' | 'descending';

export interface SortConfig {
  key: 'date';
  direction: SortDirection;
}