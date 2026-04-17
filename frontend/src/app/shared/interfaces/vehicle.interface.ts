export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  priceCurrency: 'USD' | 'CLP';
  status: 'Disponible' | 'Reservado' | 'Vendido';
  bodyType: 'SUV' | 'Sedan' | 'Deportivo' | 'Pickup';
  mileage: number;
  transmission: 'Manual' | 'Automático';
  fuel: 'Gasolina' | 'Diesel' | 'Híbrido' | 'Eléctrico';
  imageUrl: string;
  description: string;
  isNewArrival?: boolean;
  
  // Extended details for detail view
  code?: string;
  location?: string;
  cylinderCapacity?: string;
  visits?: number;
  features?: string[];
  images?: string[];
}
