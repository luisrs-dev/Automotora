import { Component, Input } from '@angular/core';
import { Vehicle } from '../../../shared/interfaces/vehicle.interface';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.css'
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: Vehicle;

  get tractionType(): string {
    const text = `${this.vehicle.description || ''} ${this.vehicle.brand || ''} ${this.vehicle.model || ''}`.toLowerCase();
    if (text.includes('4x4') || text.includes('4wd') || text.includes('tracción 4x4') || text.includes('traction 4x4')) {
      return '4X4';
    }
    if (text.includes('awd') || text.includes('all-wheel') || text.includes('all wheel') || text.includes('tracción integral') || text.includes('4matic') || text.includes('quattro')) {
      return 'AWD';
    }
    return '';
  }

  contactWhatsApp() {
    // Simulación del click del usuario hacia WhatsApp
    const msg = `Hola Automotora JARA, estoy muy interesado en el ${this.vehicle.brand} ${this.vehicle.model} de ${this.vehicle.year}. ¿Sigue disponible?`;
    window.open(`https://wa.me/56912345678?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
