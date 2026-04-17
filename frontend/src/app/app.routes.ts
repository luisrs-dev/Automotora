import { Routes } from '@angular/router';
import { CatalogComponent } from './features/shop/catalog/catalog.component';
import { VehicleDetailComponent } from './features/shop/vehicle-detail/vehicle-detail.component';

export const routes: Routes = [
  { path: '', component: CatalogComponent },
  { path: 'vehiculo/:id', component: VehicleDetailComponent }
];
