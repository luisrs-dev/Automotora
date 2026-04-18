import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AiChatbotComponent } from '../ai-chatbot/ai-chatbot.component';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, AiChatbotComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-ai-chatbot></app-ai-chatbot>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 200px); /* Adjust based on navbar/footer height */
    }
  `]
})
export class MainLayoutComponent {}
