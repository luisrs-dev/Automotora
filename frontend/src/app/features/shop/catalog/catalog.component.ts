import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InventoryService } from '../../../core/store/inventory.service';
import { VehicleCardComponent } from '../../../shared/ui/vehicle-card/vehicle-card.component';
import { HeroSliderComponent } from '../../../shared/ui/hero-slider/hero-slider.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [VehicleCardComponent, HeroSliderComponent, FormsModule, CommonModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  store = inject(InventoryService);
  private platformId = inject(PLATFORM_ID);

  /** Controls mobile bottom sheet visibility */
  isFilterSheetOpen = signal(false);

  /** Count of active (non-default) filters for the badge */
  activeFilterCount = computed(() => {
    let count = 0;
    if (this.store.filterBrand()    !== 'Todas')   count++;
    if (this.store.filterModel()    !== 'Todos')   count++;
    if (this.store.filterBodyType() !== 'Todos')   count++;
    if (this.store.filterYear()     !== 0)         count++;
    if (this.store.filterMinPrice() > 0)           count++;
    if (this.store.filterMaxPrice() < 50000000)    count++;
    return count;
  });

  openFilterSheet(): void {
    this.isFilterSheetOpen.set(true);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeFilterSheet(): void {
    this.isFilterSheetOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  clearFilters(): void {
    this.store.filterBrand.set('Todas');
    this.store.filterModel.set('Todos');
    this.store.filterBodyType.set('Todos');
    this.store.filterYear.set(0);
    this.store.filterMinPrice.set(0);
    this.store.filterMaxPrice.set(50000000);
  }
}
