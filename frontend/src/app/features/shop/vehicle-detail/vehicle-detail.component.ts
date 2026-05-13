import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/store/inventory.service';
import { Vehicle } from '../../../shared/interfaces/vehicle.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.css'
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  
  vehicle = signal<Vehicle | undefined>(undefined);
  activeImage = signal<string>('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const foundVehicle = this.inventoryService.getVehicleById(id);
      if (foundVehicle) {
        this.vehicle.set(foundVehicle);
        this.activeImage.set(foundVehicle.imageUrl);
      }
    }
  }

  setActiveImage(url: string): void {
    this.activeImage.set(url);
  }

  onContactSubmit(): void {
    // Logic for form submission
    alert('Mensaje enviado con éxito. El vendedor se pondrá en contacto pronto.');
  }

  contactWhatsApp(): void {
    const v = this.vehicle();
    if (!v) return;
    const msg = `Hola Automotora José Luis Jara, estoy muy interesado en el ${v.brand} ${v.model} (${v.year}). ¿Me podrían dar más información?`;
    window.open(`https://wa.me/56979970545?text=${encodeURIComponent(msg)}`, '_blank');
  }

  printVehicle(): void {
    window.print();
  }
}
