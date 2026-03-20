import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface BlogItem {
  _id: string;
  title: string;
  excerpt?: string;
  thumbnail?: string;
  content?: string;
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-blog-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-catalog.html',
  styleUrl: './blog-catalog.css',
})
export class BlogCatalog implements OnInit {

  blogs: BlogItem[] = [];
  filteredBlogs: BlogItem[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadBlogs();

    this.route.queryParamMap.subscribe((params) => {
      const keyword = (params.get('q') || '').trim().toLowerCase();
      if (!keyword) {
        this.filteredBlogs = [...this.blogs];
        return;
      }

      this.filteredBlogs = this.blogs.filter((blog) =>
        blog.title?.toLowerCase().includes(keyword)
        || blog.excerpt?.toLowerCase().includes(keyword)
      );
    });
  }

  loadBlogs(): void {
    this.http.get<BlogItem[]>('http://localhost:3000/blogs?status=published').subscribe({
      next: (data) => {
        this.blogs = data || [];
        this.filteredBlogs = [...this.blogs];
      },
      error: () => {
        this.blogs = [];
        this.filteredBlogs = [];
      }
    });
  }

  sortBlogs(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    if (value === 'nameAZ') {
      this.filteredBlogs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    if (value === 'nameZA') {
      this.filteredBlogs.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }

    if (value === 'newest') {
      this.filteredBlogs.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    }

    if (value === 'oldest') {
      this.filteredBlogs.sort((a, b) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
    }
  }

  getImageSrc(blog: BlogItem): string {
    const image = blog?.thumbnail || '';
    if (!image) return 'https://via.placeholder.com/600x420?text=Blog';
    if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/')) return image;
    return `/assets/${image}`;
  }

  getExcerpt(blog: BlogItem): string {
    if (blog.excerpt?.trim()) return blog.excerpt;

    const plain = (blog.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.slice(0, 90) + (plain.length > 90 ? '...' : '');
  }

}
