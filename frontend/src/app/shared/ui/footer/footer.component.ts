import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly branches = [
    {
      name: 'Casa Matriz',
      address: 'Uno Sur 2480, esquina 18 Oriente',
      city: 'Talca, Región del Maule',
    },
    {
      name: 'Sucursal Oriente',
      address: 'Uno Sur 2400, esquina 17 Oriente',
      city: 'Talca, Región del Maule',
    },
  ];

  readonly navLinks = [
    { label: 'Inicio',           href: '#' },
    { label: 'Empresa',          href: '#' },
    { label: 'Sucursales',       href: '#' },
    { label: 'Financiamiento',   href: '#' },
    { label: 'Recibimos tu auto',href: '#' },
    { label: 'Catálogo',         href: '#catalogo' },
    { label: 'Contacto',         href: '#' },
  ];

  openWhatsApp(): void {
    window.open('https://wa.me/56979970545?text=Hola%20Automotora%20JARA%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n.', '_blank');
  }
}
