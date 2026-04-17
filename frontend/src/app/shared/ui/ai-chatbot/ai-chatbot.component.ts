import {
  Component,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ChatMessage {
  id: number;
  role: 'user' | 'agent';
  text: string;
  timestamp: Date;
  typing?: boolean;
}

const MOCK_RESPONSES: string[] = [
  '¡Hola! Soy JARABot, tu asistente virtual de Automotora JARA. ¿En qué vehículo estás interesado?',
  'Con gusto te ayudo. Tenemos una excelente selección de vehículos de alta gama disponibles. ¿Tienes alguna preferencia de marca o presupuesto?',
  'Entiendo. Puedo coordinar una visita presencial o una videollamada para que conozcas el vehículo en detalle. ¿Cuándo estarías disponible?',
  'Contamos con opciones de financiamiento desde 12 hasta 60 meses con tasas competitivas. ¿Te gustaría que un ejecutivo te contacte?',
  'Todos nuestros vehículos cuentan con revisión técnica al día e inspección de 200 puntos. Tu inversión está protegida.',
  'Puedo enviarte más fotografías y el historial completo del vehículo. ¿Me compartes tu correo o preferiría hacerlo por WhatsApp?',
  'Claro, déjame verificar la disponibilidad actual… El vehículo está disponible para visita este fin de semana. ¿Te acomoda el sábado?',
];

let responseIndex = 1; // 0 is the greeting

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [NgClass, NgStyle, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.css'],
})
export class AiChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;

  isOpen = signal(false);
  inputText = signal('');
  isAgentTyping = signal(false);
  messages = signal<ChatMessage[]>([
    {
      id: 0,
      role: 'agent',
      text: MOCK_RESPONSES[0],
      timestamp: new Date(),
    },
  ]);

  private nextId = 1;
  private shouldScroll = false;

  toggleChat(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.shouldScroll = true;
    }
  }

  sendMessage(): void {
    const text = this.inputText().trim();
    if (!text || this.isAgentTyping()) return;

    // Add user message
    this.messages.update(msgs => [
      ...msgs,
      { id: this.nextId++, role: 'user', text, timestamp: new Date() },
    ]);
    this.inputText.set('');
    this.shouldScroll = true;

    // Simulate agent typing
    this.isAgentTyping.set(true);
    const delay = 900 + Math.random() * 800;

    setTimeout(() => {
      const response = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length];
      responseIndex++;
      this.messages.update(msgs => [
        ...msgs,
        { id: this.nextId++, role: 'agent', text: response, timestamp: new Date() },
      ]);
      this.isAgentTyping.set(false);
      this.shouldScroll = true;
    }, delay);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.messagesEndRef) {
      this.messagesEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
}
