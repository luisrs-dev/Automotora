import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-floating-buttons',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-buttons.component.html',
  styleUrls: ['./floating-buttons.component.css'],
})
export class FloatingButtonsComponent {
  openWhatsApp(): void {
    window.open('https://wa.me/56979970545?text=Hola%20Automotora%20JARA%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n.', '_blank');
  }
}
