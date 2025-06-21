// src/types/property.ts
export interface Financials {
  monthlyIncome: number;
  monthlyExpenses: number;
  cashFlow: number;
  yield: number;
}

export interface Maintenance {
  lastService: string;
  nextScheduled?: string;
  urgentIssues: number;
}

export interface EnhancedProperty {
  id: string;
  name: string;
  address: string;
  status: string;
  lat: number;
  lng: number;
  purchasePrice: number;
  purchaseDate: string;
  squareMeters: number;
  tenantCount: number;
  financials: Financials;
  maintenance: Maintenance;
  photos: string[];
}