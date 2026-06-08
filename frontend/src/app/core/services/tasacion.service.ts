import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SolicitudTasacion {
  rut: string;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  patente: string;
  anio: number;
  marca: string;
  modelo: string;
  version: string;
  kilometraje: number;
}

@Injectable({
  providedIn: 'root',
})
export class TasacionService {
  private readonly API_BASE_URL = 'http://31.97.9.216:8055';
  private http = inject(HttpClient);

  enviarSolicitud(
    personalData: { rut: string; nombre: string; apellido: string; correo: string; celular: string },
    vehicleData: { patente: string; anio: number; marca: string; modelo: string; version: string; kilometraje: number }
  ): Observable<any> {
    const payload: SolicitudTasacion = {
      rut: personalData.rut,
      nombre: personalData.nombre,
      apellido: personalData.apellido,
      correo: personalData.correo,
      celular: personalData.celular,
      patente: vehicleData.patente,
      anio: vehicleData.anio,
      marca: vehicleData.marca,
      modelo: vehicleData.modelo,
      version: vehicleData.version,
      kilometraje: vehicleData.kilometraje,
    };

    return this.http.post(`${this.API_BASE_URL}/items/solicitud_tasacion`, payload);
  }
}
