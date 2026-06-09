import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-financiamiento',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './financiamiento.component.html',
  styleUrl: './financiamiento.component.css'
})
export class FinanciamientoComponent {
  
  openWhatsAppSimulation(tipoCredito?: string): void {
    let msg = "Hola, me interesa obtener financiamiento para comprar un vehículo usado.";
    if (tipoCredito) {
      msg = `Hola, me gustaría simular y evaluar un Crédito ${tipoCredito} para un vehículo usado en la automotora.`;
    }
    const text = encodeURIComponent(msg);
    window.open(`https://wa.me/56979970545?text=${text}`, '_blank');
  }
}
