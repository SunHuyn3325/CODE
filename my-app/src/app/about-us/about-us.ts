import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about-us',
  imports: [],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs implements AfterViewInit {
  private observer?: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

ngAfterViewInit() {
  if (!isPlatformBrowser(this.platformId)) return;

  const elements = document.querySelectorAll(
    '.animate-left, .animate-right, .animate-up'
  );

  this.observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if(entry.isIntersecting){
        entry.target.classList.add('show');
        // Animate once to avoid flicker while scrolling around threshold.
        this.observer?.unobserve(entry.target);
      }

    });

  },{
    threshold: 0.2,
    rootMargin: '0px 0px -8% 0px'
  });

  elements.forEach(el => {
    el.classList.add('observed');
    this.observer?.observe(el);
  });

    }

  scrollToContent() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.getElementById('about-content')?.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  }

