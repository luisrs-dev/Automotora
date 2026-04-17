import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/ui/navbar/navbar.component';
import { AiChatbotComponent } from './shared/ui/ai-chatbot/ai-chatbot.component';
import { FooterComponent } from './shared/ui/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, AiChatbotComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-ai-chatbot></app-ai-chatbot>
  `
})
export class AppComponent {
}
