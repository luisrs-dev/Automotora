import { Component, PLATFORM_ID, inject, signal, effect, afterNextRender, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isDarkTheme = signal(false);
  scrolled = signal(false);
  menuOpen = signal(false);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      const storedTheme = localStorage.getItem('color-theme');
      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.isDarkTheme.set(true);
      }
    });

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        if (this.isDarkTheme()) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('color-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('color-theme', 'light');
        }
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleTheme() {
    this.isDarkTheme.update(val => !val);
  }

  toggleMenu() {
    this.menuOpen.update(val => !val);
  }
}
