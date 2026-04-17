import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';

export interface SliderSlide {
  id: number;
  headline: string;
  subheadline: string;
  tag: string;
  cta: string;
  ctaHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
  gradient: string;
  accentColor: string;
  imageUrl: string;
  stats?: { value: string; label: string }[];
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.css'],
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private intervalId?: ReturnType<typeof setInterval>;

  readonly slides: SliderSlide[] = [
    // ── Slide 1: Comprar un vehículo ─────────────────────────
    {
      id: 0,
      tag: '✦ Usados & Seminuevos · Talca',
      headline: 'Tu Próximo Auto te Espera en Talca',
      subheadline:
        'Stock renovado, inspeccionado y listo para entrega inmediata.',
      cta: 'Ver Catálogo',
      ctaHref: '#catalogo',
      ctaSecondary: 'Escribir por WhatsApp',
      ctaSecondaryHref: 'https://wa.me/56979970545?text=Hola%2C%20me%20interesa%20ver%20el%20cat%C3%A1logo',
      gradient: 'linear-gradient(100deg, #0B1230 0%, #1B2D6B 55%, rgba(11,18,48,0.4) 100%)',
      accentColor: '#3B96C8',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80&auto=format&fit=crop',
      stats: [
        { value: '+20', label: 'Años de experiencia' },
        { value: '2', label: 'Sucursales' },
        { value: '100%', label: 'Inspeccionados' },
      ],
    },

    // ── Slide 2: Vender / parte de pago ──────────────────────
    {
      id: 1,
      tag: '✦ Tasación sin costo · Respuesta inmediata',
      headline: 'Compramos tu Auto o lo Recibimos a Cuenta',
      subheadline:
        'Tasación gratuita y sin compromiso. Te pagamos el mejor precio del mercado.',
      cta: 'Tasar mi Auto',
      ctaHref: 'https://wa.me/56979970545?text=Hola%2C%20quiero%20tasar%20mi%20auto',
      ctaSecondary: 'Saber más',
      ctaSecondaryHref: '#',
      gradient: 'linear-gradient(100deg, #071525 0%, #0e2a4a 55%, rgba(7,21,37,0.35) 100%)',
      accentColor: '#5AAFD8',
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600&q=80&auto=format&fit=crop',
      stats: [
        { value: '24 hrs', label: 'Respuesta' },
        { value: '$0', label: 'Costo tasación' },
        { value: '100%', label: 'Sin compromiso' },
      ],
    },

    // ── Slide 3: Financiamiento ───────────────────────────────
    {
      id: 2,
      tag: '✦ Crédito Tradicional & Express',
      headline: 'Financiamiento Aprobado en 24 Horas',
      subheadline:
        'Solo con tu carnet. Trabajamos con Santander, BancoEstado, Falabella y más.',
      cta: 'Consultar ahora',
      ctaHref: 'https://wa.me/56979970545?text=Hola%2C%20me%20interesa%20un%20cr%C3%A9dito%20para%20veh%C3%ADculo',
      ctaSecondary: 'Ver Catálogo',
      ctaSecondaryHref: '#catalogo',
      gradient: 'linear-gradient(100deg, #060f1e 0%, #122040 55%, rgba(6,15,30,0.35) 100%)',
      accentColor: '#3B96C8',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80&auto=format&fit=crop',
      stats: [
        { value: '24 hrs', label: 'Aprobación' },
        { value: '+5', label: 'Instituciones' },
        { value: '60m', label: 'Plazo máximo' },
      ],
    },
  ];


  currentIndex = signal(0);
  isAnimating = signal(false);
  progress = signal(0);

  private progressInterval?: ReturnType<typeof setInterval>;
  private readonly DURATION = 5000;
  private readonly PROGRESS_TICK = 50;

  get currentSlide(): SliderSlide {
    return this.slides[this.currentIndex()];
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  goTo(index: number): void {
    if (index === this.currentIndex() || this.isAnimating()) return;
    this.isAnimating.set(true);
    this.currentIndex.set(index);
    this.restartProgress();
    setTimeout(() => this.isAnimating.set(false), 700);
  }

  next(): void {
    const next = (this.currentIndex() + 1) % this.slides.length;
    this.goTo(next);
  }

  prev(): void {
    const prev = (this.currentIndex() - 1 + this.slides.length) % this.slides.length;
    this.goTo(prev);
  }

  private startAutoPlay(): void {
    this.restartProgress();
    this.intervalId = setInterval(() => {
      this.next();
    }, this.DURATION);
  }

  private restartProgress(): void {
    clearInterval(this.progressInterval);
    this.progress.set(0);
    this.progressInterval = setInterval(() => {
      const next = this.progress() + (this.PROGRESS_TICK / this.DURATION) * 100;
      this.progress.set(Math.min(next, 100));
    }, this.PROGRESS_TICK);
  }

  private stopAutoPlay(): void {
    clearInterval(this.intervalId);
    clearInterval(this.progressInterval);
  }

  scrollToCatalog(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
