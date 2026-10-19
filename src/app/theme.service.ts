import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.readTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  private setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem('hardware-counter-theme', theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }

  private readTheme(): Theme {
    if (typeof localStorage === 'undefined') {
      return 'light';
    }
    return localStorage.getItem('hardware-counter-theme') === 'dark' ? 'dark' : 'light';
  }
}
