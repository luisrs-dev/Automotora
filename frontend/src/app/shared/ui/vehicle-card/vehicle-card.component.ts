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

  contactWhatsApp() {
    // Simulación del click del usuario hacia WhatsApp
    const msg = `Hola Automotora JARA, estoy muy interesado en el ${this.vehicle.brand} ${this.vehicle.model} de ${this.vehicle.year}. ¿Sigue disponible?`;
    window.open(`https://wa.me/56912345678?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
