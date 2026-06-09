import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MensajeContacto {
  nombre: string;
  correo: string;
  celular: string;
  asunto: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactoService {
  private readonly API_BASE_URL = 'http://31.97.9.216:8055';
  private http = inject(HttpClient);

  enviarMensaje(data: MensajeContacto): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/items/mensaje_contacto`, data);
  }
}
