import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewApiService } from '../../review-api.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class ReviewsComponent implements OnInit {
  reviews: any[] = [];
  loading = false;
  showReviewForm = false;
  expandedReviewId: string | null = null;
  userId: string = '';
  
  reviewForm = {
    orderId: '',
    rating: 5,
    title: '',
    content: ''
  };

  constructor(private reviewApiService: ReviewApiService) {
    this.userId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviews = this.reviewApiService.getReviewsByUser(this.userId);
    this.loading = false;
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (!this.showReviewForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.reviewForm = {
      orderId: '',
      rating: 5,
      title: '',
      content: ''
    };
  }

  submitReview(): void {
    if (!this.reviewForm.orderId || !this.reviewForm.title) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newReview = this.reviewApiService.createReview({
      userId: this.userId,
      ...this.reviewForm
    });

    this.loadReviews();
    this.showReviewForm = false;
    this.resetForm();
  }

  toggleReviewExpand(reviewId: string): void {
    this.expandedReviewId = this.expandedReviewId === reviewId ? null : reviewId;
  }

  deleteReview(reviewId: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      this.reviewApiService.deleteReview(reviewId);
      this.loadReviews();
    }
  }

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0).map((_, i) => i + 1);
  }

  getEmptyStarArray(rating: number): number[] {
    const empty = 5 - rating;
    return empty > 0 ? Array(empty).fill(0).map((_, i) => i + 1) : [];
  }
}