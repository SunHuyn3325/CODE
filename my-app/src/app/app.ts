import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { SacBee } from './sac-bee/sac-bee';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
            CommonModule,
            Header,
            Footer,
            SacBee,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');
  showBackToTop = false;
  private lastScrollY = 0;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;

    if (currentY < 180) {
      this.showBackToTop = false;
      this.lastScrollY = currentY;
      return;
    }

    this.showBackToTop = currentY > this.lastScrollY;
    this.lastScrollY = currentY;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
