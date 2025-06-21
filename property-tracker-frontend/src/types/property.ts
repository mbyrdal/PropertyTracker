// src/types/property.ts
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
  financials: {
    monthlyIncome: number;
    monthlyExpenses: number;
    cashFlow: number;
    yield: number;
  };
  maintenance: {
    lastService: string;
    nextScheduled?: string;
    urgentIssues: number;
  };
  photos: string[]; // Added this field which is used in your components
}

// Optional legacy type
export type Property = Omit<EnhancedProperty, 'financials'|'maintenance'> & {
  // Any legacy fields you need to maintain
};