import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactoService } from '../../../core/services/contacto.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css',
})
export class ContactoComponent {
  private contactoService = inject(ContactoService);

  submitting = signal(false);
  submitted = signal(false);
  submitError = signal<string | null>(null);

  contactForm: FormGroup;

  asuntoOptions = [
    'Consulta sobre un vehículo',
    'Financiamiento',
    'Servicio post-venta',
    'Tasación de mi auto',
    'Sugerencia o reclamo',
    'Otro'
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.minLength(9)]],
      asunto: ['', [Validators.required]],
      mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });
  }

  /** Format phone as user types: +56 9 XXXX XXXX */
  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9+]/g, '');

    if (value && !value.startsWith('+')) {
      if (value.startsWith('56')) {
        value = '+' + value;
      } else if (value.startsWith('9')) {
        value = '+56 ' + value;
      }
    }

    input.value = value;
    this.contactForm.get('celular')?.setValue(value, { emitEvent: false });
  }

  isFieldValid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!control && control.valid && (control.dirty || control.touched);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get messageLength(): number {
    return this.contactForm.get('mensaje')?.value?.length || 0;
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.submitting.set(true);
      this.submitError.set(null);

      this.contactoService
        .enviarMensaje(this.contactForm.value)
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.submitted.set(true);
          },
          error: (err) => {
            this.submitting.set(false);
            console.error('Error al enviar mensaje:', err);
            this.submitError.set(
              'No pudimos enviar tu mensaje. Por favor intenta nuevamente.'
            );
          },
        });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.contactForm.reset();
    this.submitted.set(false);
    this.submitError.set(null);
  }
}
