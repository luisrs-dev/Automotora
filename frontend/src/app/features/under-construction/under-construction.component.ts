import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simple-container">
      <h1>En Construcción</h1>
    </div>
  `,
  styles: [`
    .simple-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
    }
    h1 {
      font-weight: 300;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.8;
    }
  `]
})
export class UnderConstructionComponent {}
