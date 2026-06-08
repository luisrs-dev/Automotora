import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TasacionService } from '../../../core/services/tasacion.service';

@Component({
  selector: 'app-sell-car',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sell-car.component.html',
  styleUrl: './sell-car.component.css',
})
export class SellCarComponent {
  private tasacionService = inject(TasacionService);

  step = signal(1); // 1 = Personal Info, 2 = Vehicle Info, 3 = Success state
  submitting = signal(false);
  submitError = signal<string | null>(null);

  personalForm: FormGroup;
  vehicleForm: FormGroup;

  // Mock versions list for version dropdown
  versionsList = [
    '1.6 MT Comfort',
    '1.6 AT Deluxe',
    '2.0 AT Premium',
    '1.5T DCT Luxury',
    '1.3T CVT Elite',
    '2.0 GL MT'
  ];

  constructor(private fb: FormBuilder) {
    this.personalForm = this.fb.group({
      rut: ['', [Validators.required, Validators.minLength(11)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      celular: ['', [Validators.required, Validators.minLength(9)]],
      acceptComms: [false],
    });

    this.vehicleForm = this.fb.group({
      patente: ['', [Validators.required, Validators.minLength(8)]],
      anio: ['', [Validators.required, Validators.min(1990), Validators.max(2027)]],
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', [Validators.required, Validators.minLength(2)]],
      version: ['', [Validators.required]],
      kilometraje: ['', [Validators.required, Validators.min(0), Validators.max(100000)]],
      acceptTerms: [false, [Validators.requiredTrue]],
    });
  }


  /** Format RUT as user types: 12.345.678-9 */
  formatRut(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9kK]/g, '').toUpperCase();

    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    if (value.length > 1) {
      const body = value.slice(0, -1);
      const dv = value.slice(-1);
      let formatted = '';
      const reversed = body.split('').reverse();
      for (let i = 0; i < reversed.length; i++) {
        if (i > 0 && i % 3 === 0) {
          formatted = '.' + formatted;
        }
        formatted = reversed[i] + formatted;
      }
      value = formatted + '-' + dv;
    }

    input.value = value;
    this.personalForm.get('rut')?.setValue(value, { emitEvent: false });
  }

  /** Format phone as user types: +56 9 XXXX XXXX */
  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9+]/g, '');

    // If user starts typing without +56, prepend it
    if (value && !value.startsWith('+')) {
      if (value.startsWith('56')) {
        value = '+' + value;
      } else if (value.startsWith('9')) {
        value = '+56 ' + value;
      }
    }

    input.value = value;
    this.personalForm.get('celular')?.setValue(value, { emitEvent: false });
  }

  /** Format Patente as user types: AA-AA-AA or AA-BB-11 */
  formatPatente(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formatted += '-';
      }
      formatted += value[i];
    }

    input.value = formatted;
    this.vehicleForm.get('patente')?.setValue(formatted, { emitEvent: false });
  }

  isPersonalFieldValid(field: string): boolean {
    const control = this.personalForm.get(field);
    return !!control && control.valid && (control.dirty || control.touched);
  }

  isPersonalFieldInvalid(field: string): boolean {
    const control = this.personalForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  isVehicleFieldValid(field: string): boolean {
    const control = this.vehicleForm.get(field);
    return !!control && control.valid && (control.dirty || control.touched);
  }

  isVehicleFieldInvalid(field: string): boolean {
    const control = this.vehicleForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onNextStep(): void {
    if (this.personalForm.valid) {
      this.step.set(2);
    } else {
      this.personalForm.markAllAsTouched();
    }
  }

  onPrevStep(): void {
    this.step.set(1);
  }

  onSubmit(): void {
    if (this.vehicleForm.valid && this.personalForm.valid) {
      this.submitting.set(true);
      this.submitError.set(null);

      this.tasacionService
        .enviarSolicitud(this.personalForm.value, this.vehicleForm.value)
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.step.set(3);
          },
          error: (err) => {
            this.submitting.set(false);
            console.error('Error al enviar solicitud:', err);
            this.submitError.set(
              'No pudimos enviar tu solicitud. Por favor intenta nuevamente.'
            );
          },
        });
    } else {
      this.vehicleForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.personalForm.reset();
    this.vehicleForm.reset();
    this.step.set(1);
  }
}
