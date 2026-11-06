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
      celular: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}$/)]],
      asunto: ['', [Validators.required]],
      mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });
  }

  /** Format the eight digits after the fixed +56 9 prefix. */
  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 4 ? `${digits.slice(0, 4)} ${digits.slice(4)}` : digits;
    input.value = formatted;
    this.contactForm.get('celular')?.setValue(formatted, { emitEvent: false });
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
