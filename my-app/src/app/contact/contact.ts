import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FeedbackApiService } from '../feedback-api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  activeTab: 'contact' | 'team' | 'tech' = 'contact';

  constructor(private FeedbackApiService: FeedbackApiService) {}

  switchTab(tab: 'contact' | 'team' | 'tech') {
    this.activeTab = tab;
    // Re-observe after Angular renders the new tab content
    setTimeout(() => this.setupObserver(), 50);
  }

  ngAfterViewInit() {
    this.setupObserver();
  }

  private setupObserver() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Disconnect previous observer
    this.observer?.disconnect();

    const elements = document.querySelectorAll(
      '.animate-left, .animate-right, .animate-up'
    );

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('observed');
            entry.target.classList.add('show');
          } else {
            entry.target.classList.remove('show');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
    );

    elements.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const fullName = (form.elements.namedItem('firstName') as HTMLInputElement)?.value;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value;

    const data = {
      fullName: fullName,
      email: email,
      phone: phone,
      message: message
    };
    console.log("DATA SEND:", data);

    this.FeedbackApiService.sendFeedback(data).subscribe({
      next: (res) => {
        console.log("SUCCESS:", res);
        alert('Cảm ơn bạn đã gửi phản hồi!');
        form.reset();
      },
      error: (err) => {
        console.error("ERROR:", err);
        alert('Gửi phản hồi thất bại. Vui lòng thử lại.');
      }
    });
  }
}