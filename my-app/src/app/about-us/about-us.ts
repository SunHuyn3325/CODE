import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about-us',
  imports: [],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const elements = document.querySelectorAll(
      '.animate-left, .animate-right, .animate-up'
    );

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {

          if (entry.isIntersecting) {
            // 👇 Khi vào màn hình → hiện + animate
            entry.target.classList.add('show');
          } else {
            // 👇 Khi ra khỏi màn hình → reset lại để lần sau animate tiếp
            entry.target.classList.remove('show');
          }

        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    elements.forEach((el) => {
      el.classList.add('observed');
      this.observer?.observe(el);
    });
  }

  scrollToContent() {
    if (!isPlatformBrowser(this.platformId)) return;

    const firstHeading = document.querySelector('.about-story .story-text h2') as HTMLElement | null;
    const fallbackSection = document.getElementById('about-content');
    const target = firstHeading ?? fallbackSection;

    if (!target) return;

    const appHeader = document.querySelector('app-header') as HTMLElement | null;
    const headerOffset = appHeader?.offsetHeight ?? 120;
    const extraGap = 20;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset - extraGap;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}