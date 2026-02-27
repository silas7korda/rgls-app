
export interface DataRecord {
  id: string;
  date: string;
  store: number;
  savings: number; // 0.2 column renamed from tax20
  machine: number;
  restockFunds: number;
  expenses: number;
}

export type ViewType = 'dashboard' | 'calendar' | 'records' | 'tools' | 'export' | 'settings';

export interface DashboardStats {
  totalRecords: number;
  activeRecords: number;
  monthTotal: number;
  todayEntries: number;
}
