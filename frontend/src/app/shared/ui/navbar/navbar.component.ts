import { Component, PLATFORM_ID, inject, signal, effect, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isDarkTheme = signal(false);
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

  toggleTheme() {
    this.isDarkTheme.update(val => !val);
  }
}

