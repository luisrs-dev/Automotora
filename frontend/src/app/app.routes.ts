import { Routes } from '@angular/router';
import { CatalogComponent } from './features/shop/catalog/catalog.component';
import { VehicleDetailComponent } from './features/shop/vehicle-detail/vehicle-detail.component';
import { UnderConstructionComponent } from './features/under-construction/under-construction.component';
import { MainLayoutComponent } from './shared/ui/main-layout/main-layout.component';

export const routes: Routes = [
  { 
    path: '', 
    component: UnderConstructionComponent,
    title: 'En Construcción - Automotora José Luis Jara'
  },
  {
    path: 'joseluisjara',
    component: MainLayoutComponent,
    children: [
      { 
        path: '', 
        component: CatalogComponent,
        title: 'Catálogo Premium - Automotora José Luis Jara'
      },
      { 
        path: 'vehiculo/:id', 
        component: VehicleDetailComponent 
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
