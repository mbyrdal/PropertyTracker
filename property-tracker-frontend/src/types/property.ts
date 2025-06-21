export interface Property {
  id: number;
  name: string;
  address: string;
  latitude: number;  // Must match your backend DTO
  longitude: number; // Must match your backend DTO
  tenantCount: number;
}