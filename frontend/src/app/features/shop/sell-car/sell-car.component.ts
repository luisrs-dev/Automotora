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
  loadingPatente = signal(false);
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

  // Database of mock vehicles to simulate real search by ending digits
  private mockVehiclesDb = [
    { marca: 'Hyundai', modelo: 'Tucson', anio: 2020, version: '2.0 AT Premium' },
    { marca: 'Chevrolet', modelo: 'Spin', anio: 2022, version: '1.6 MT Comfort' },
    { marca: 'Toyota', modelo: 'RAV4', anio: 2019, version: '2.0 GL MT' },
    { marca: 'Suzuki', modelo: 'Swift', anio: 2021, version: '1.3T CVT Elite' },
    { marca: 'Mazda', modelo: 'CX-5', anio: 2018, version: '2.0 AT Premium' }
  ];

  loadingMessage = signal('Iniciando búsqueda...');

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

  /** Simulate fetching vehicle data by license plate when focus is lost (blur) */
  onPatenteBlur(): void {
    const patenteControl = this.vehicleForm.get('patente');
    if (!patenteControl || patenteControl.invalid || this.loadingPatente()) return;

    const patenteValue = patenteControl.value.replace(/[^a-zA-Z0-9]/g, '');
    if (patenteValue.length < 6) return;

    this.loadingPatente.set(true);
    this.loadingMessage.set('Conectando con base de datos Registro Civil...');

    // Step 2 message at 800ms
    setTimeout(() => {
      this.loadingMessage.set(`Buscando patente ${patenteControl.value}...`);
    }, 800);

    // Step 3 message at 1600ms
    setTimeout(() => {
      this.loadingMessage.set('Decodificando marca, modelo y año...');
    }, 1600);

    // Final resolution at 2500ms
    setTimeout(() => {
      // Pick a vehicle based on the last char of patente to make it dynamic
      const lastChar = patenteValue.charCodeAt(patenteValue.length - 1) || 0;
      const mockCarIndex = lastChar % this.mockVehiclesDb.length;
      const carData = this.mockVehiclesDb[mockCarIndex];

      // Auto populate form
      this.vehicleForm.patchValue({
        marca: carData.marca,
        modelo: carData.modelo,
        anio: carData.anio,
        version: carData.version
      });

      // Mark auto populated fields as dirty/touched to trigger success validations automatically
      ['marca', 'modelo', 'anio', 'version'].forEach(field => {
        const control = this.vehicleForm.get(field);
        if (control) {
          control.markAsDirty();
          control.markAsTouched();
        }
      });

      this.loadingPatente.set(false);
    }, 2500);
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
