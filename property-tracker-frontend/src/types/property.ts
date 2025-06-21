export interface EnhancedProperty {
  id: string;
  address: string;
  status: 'Active' | 'Pending' | 'Inactive';
  lat: number;
  lng: number;
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
}

// Optional: Keep old Property type as legacy if needed elsewhere
export type Property = Omit<EnhancedProperty, 'financials'|'maintenance'> & {
  // Any legacy fields you need to maintain
};