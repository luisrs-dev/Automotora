import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    { label: 'Inicio',             routerLink: '/joseluisjara' },
    { label: 'Empresa',            routerLink: '/joseluisjara/empresa' },
    { label: 'Financiamiento',     href: '#' },
    { label: 'Compramos tu auto',  routerLink: '/joseluisjara/compramos-tu-auto' },
    { label: 'Catálogo',           routerLink: '/joseluisjara' },
    { label: 'Contacto',           routerLink: '/joseluisjara/contacto' },
  ];

  openWhatsApp(): void {
    window.open('https://wa.me/56979970545?text=Hola%20Automotora%20JARA%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n.', '_blank');
  }
}
