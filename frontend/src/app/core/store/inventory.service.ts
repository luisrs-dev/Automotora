import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Vehicle } from '../../shared/interfaces/vehicle.interface';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API_BASE_URL = 'http://31.97.9.216:8055';
  private readonly ASSETS_URL = `${this.API_BASE_URL}/assets`;

  // Mock Data base as fallback
  private readonly initialVehicles: Vehicle[] = [
    {
      id: 'v1', brand: 'Porsche', model: '911 Carrera S', year: 2023, price: 120500, priceCurrency: 'USD',
      status: 'Disponible', bodyType: 'Deportivo', mileage: 12000, transmission: 'Automático', fuel: 'Gasolina',
      imageUrl: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&q=80&w=1200',
      description: 'Un verdadero ícono del diseño y la potencia. Estado inmaculado.', isNewArrival: true
    },
    {
      id: 'v2', brand: 'BMW', model: 'X5 xDrive40i', year: 2022, price: 85900, priceCurrency: 'USD',
      status: 'Disponible', bodyType: 'SUV', mileage: 24000, transmission: 'Automático', fuel: 'Híbrido',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1200',
      description: 'Lujo y versatilidad alemana en su máximo esplendor. Paquete M Sport incluido.'
    },
    {
      id: 'v3', brand: 'Audi', model: 'e-tron GT', year: 2024, price: 92000, priceCurrency: 'USD',
      status: 'Reservado', bodyType: 'Deportivo', mileage: 0, transmission: 'Automático', fuel: 'Eléctrico',
      imageUrl: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=1200',
      description: 'Movilidad 100% eléctrica con prestaciones deportivas inigualables.'
    },
    {
      id: 'v4', brand: 'Mercedes-Benz', model: 'Clase G 63 AMG', year: 2021, price: 185000, priceCurrency: 'USD',
      status: 'Disponible', bodyType: 'SUV', mileage: 36000, transmission: 'Automático', fuel: 'Gasolina',
      imageUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=1200',
      description: 'Potencia todoterreno con el inconfundible sonido AMG.'
    },
    {
      id: 'v5', brand: 'Volvo', model: 'XC90 Recharge', year: 2023, price: 78000, priceCurrency: 'USD',
      status: 'Disponible', bodyType: 'SUV', mileage: 15000, transmission: 'Automático', fuel: 'Híbrido',
      imageUrl: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=1200',
      description: 'Seguridad escandinava definitiva con propulsión ecológica.'
    },
    {
      id: 'v6', brand: 'Kia', model: 'Rio 5 1.4 AC', year: 2012, price: 5600000, priceCurrency: 'CLP',
      status: 'Disponible', bodyType: 'Sedan', mileage: 160000, transmission: 'Manual', fuel: 'Gasolina',
      imageUrl: 'https://images.unsplash.com/photo-1623232973601-a9903518f270?auto=format&fit=crop&q=80&w=1200',
      description: 'VERSION RIO 5 EX 1.4. Mecánico 5 vel. Motor 1.2-1.4 4 cilindros bencina. Tracción 4x2. Radio, Aire acondicionado. Auto económico, confiable e ideal para uso diario.',
      code: '00639',
      location: 'Casa Matriz, Uno Sur 2480, esquina 18 Oriente, Talca',
      cylinderCapacity: '1.4 (1.400 c.c.)',
      visits: 53,
      features: ['5 puertas', 'Catalítico', 'Cierre centralizado', 'Llantas', 'Frenos ABS', 'Espejos eléctricos', 'Alzacidrio', 'Radio', 'Airbag', 'Aire acondicionado', 'Alarma'],
      images: [
        'https://images.unsplash.com/photo-1623232973601-a9903518f270?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?auto=format&fit=crop&q=80&w=1200'
      ]
    }
  ];

  // ── RESOURCE: Cargamos los datos usando httpResource ───────
  // private vehiclesResource = httpResource<any>(`${this.API_BASE_URL}/items/Auto?fields=*,marca.*,modelo.*,imagenes.directus_files_id`);
  private vehiclesResource = httpResource<any>(
  `${this.API_BASE_URL}/items/Auto?fields=*,Marca.*,Modelo.*,Auto_files.directus_files_id`
);

  // ── STATE: Procesamos los datos con las URLs completas ─────
  private vehiclesSignal = computed<Vehicle[]>(() => {
    const res = this.vehiclesResource.value();
    
    if (res && res.data) {
      const mappedVehicles = res.data.map((item: any) => this.mapApiToVehicle(item));
      console.log('[mappedVehicles]',mappedVehicles);
      return mappedVehicles;
    }
    
    // Fallback a mock data si hay error
    if (this.vehiclesResource.error()) {
      console.error('Error fetching vehicles, falling back to mock data:', this.vehiclesResource.error());
      return this.initialVehicles;
    }
    
    return [];
  });

  private mapApiToVehicle(item: any): Vehicle {
    // Manejo de Marca y Modelo (con fallback si son null)
    console.log('[item]',item);
    const brand = item.marca?.Nombre || 'Desconocida';
    const model = item.modelo?.Nombre || 'Modelo no especificado';

    // Procesamiento de Imágenes: Convertimos el array de IDs [1, 2, 3] en URLs completas
    const galleryUrls = (item.imagenes || []).map((img: any) => 
      `${this.ASSETS_URL}/${img.directus_files_id}`
    );

    // Usamos la primera imagen como principal, o un placeholder si no hay
    const mainImageUrl = galleryUrls.length > 0 
      ? galleryUrls[0] 
      : 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=1200';

    // Manejo de Transmisión
    let transmission: 'Manual' | 'Automático' = 'Manual';
    if (item.Transmision?.toLowerCase().includes('auto')) transmission = 'Automático';

    // Manejo de Status basado en el JSON recibido
    let status: 'Disponible' | 'Reservado' | 'Vendido' = 'Disponible';
    if (item.status === 'archived' || item.status === 'vendido') status = 'Vendido';
    if (item.status === 'draft') status = 'Reservado';

    return {
      id: String(item.id),
      brand,
      model,
      year: item.Anio || 2000,
      price: item.Precio || 0,
      priceCurrency: 'CLP',
      status,
      bodyType: 'Sedan', 
      mileage: item.Kilometraje || 0,
      transmission,
      fuel: 'Gasolina',
      imageUrl: mainImageUrl, 
      images: galleryUrls,
      description: item.Titulo || 'Sin descripción',
      cylinderCapacity: item.Cilindrada || 'N/A',
      
    };
  }

  constructor() {
    // Ya no es necesario llamar a loadVehicles(), el recurso es reactivo
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.vehiclesSignal().find((v: Vehicle) => v.id === id);
  }

  filterBrand    = signal<string>('Todas');
  filterModel    = signal<string>('Todos');
  filterBodyType = signal<string>('Todos');
  filterYear     = signal<number>(0);        // 0 = todos los años
  filterMinPrice = signal<number>(0);
  filterMaxPrice = signal<number>(50000000);

  // ── COMPUTED: Vehículos filtrados ──────────────────────────
  filteredVehicles = computed(() => {
    return this.vehiclesSignal().filter((v: Vehicle) => {
      const matchBrand    = this.filterBrand()    === 'Todas' || v.brand    === this.filterBrand();
      const matchModel    = this.filterModel()    === 'Todos' || v.model    === this.filterModel();
      const matchBodyType = this.filterBodyType() === 'Todos' || v.bodyType === this.filterBodyType();
      const matchYear     = this.filterYear()     === 0       || v.year     === this.filterYear();
      const matchPrice    = v.price >= this.filterMinPrice() && v.price <= this.filterMaxPrice();
      return matchBrand && matchModel && matchBodyType && matchYear && matchPrice;
    });
  });

  // ── COMPUTED: Opciones de selects ─────────────────────────
  uniqueBrands = computed(() => {
    const brands = new Set(this.vehiclesSignal().map((v: Vehicle) => v.brand));
    return ['Todas', ...Array.from(brands).sort()];
  });

  uniqueModelsForBrand = computed(() => {
    const brand = this.filterBrand();
    const vehicles = brand === 'Todas'
      ? this.vehiclesSignal()
      : this.vehiclesSignal().filter((v: Vehicle) => v.brand === brand);
    const models = new Set(vehicles.map((v: Vehicle) => v.model));
    return ['Todos', ...Array.from(models).sort()];
  });

  uniqueBodyTypes = computed(() => {
    const types = new Set(this.vehiclesSignal().map((v: Vehicle) => v.bodyType));
    return ['Todos', ...Array.from(types).sort()];
  });

  uniqueYears = computed(() => {
    const years = new Set(this.vehiclesSignal().map((v: Vehicle) => v.year));
    return [0, ...Array.from(years).sort((a: number, b: number) => b - a)];
  });


  changeBrand(brand: string): void {
    this.filterBrand.set(brand);
    this.filterModel.set('Todos');
  }
}
