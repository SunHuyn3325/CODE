import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface BlogItem {
  _id: string;
  title: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
})
export class BlogDetail implements OnInit {

  blog: BlogItem | null = null;
  relatedBlogs: BlogItem[] = [];
  loading = true;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.errorMsg = 'Không tìm thấy bài viết';
        this.loading = false;
        return;
      }

      this.loadBlog(id);
    });
  }

  loadBlog(id: string): void {
    this.loading = true;
    this.errorMsg = '';

    this.http.get<BlogItem>(`http://localhost:3000/blogs/${id}`).subscribe({
      next: (data) => {
        this.blog = data;
        this.loading = false;
        this.loadRelatedBlogs(id);
      },
      error: () => {
        this.blog = null;
        this.loading = false;
        this.errorMsg = 'Không tải được nội dung bài viết';
      }
    });
  }

  loadRelatedBlogs(currentId: string): void {
    this.http.get<BlogItem[]>('http://localhost:3000/blogs?status=published').subscribe({
      next: (data) => {
        this.relatedBlogs = (data || [])
          .filter((item) => item._id !== currentId)
          .slice(0, 4);
      },
      error: () => {
        this.relatedBlogs = [];
      }
    });
  }

  getImageSrc(src?: string): string {
    if (!src) return 'https://via.placeholder.com/1200x680?text=Blog';
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) return src;
    return `/assets/${src}`;
  }

  getExcerpt(item: BlogItem): string {
    if (item.excerpt?.trim()) return item.excerpt;
    const plain = (item.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.slice(0, 120) + (plain.length > 120 ? '...' : '');
  }

  getReadTime(content?: string): string {
    const text = (content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    const minutes = Math.max(1, Math.ceil(words / 220));
    return `${minutes} phút đọc`;
  }

}
