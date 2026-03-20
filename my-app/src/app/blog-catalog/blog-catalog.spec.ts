import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogCatalog } from './blog-catalog';

describe('BlogCatalog', () => {
  let component: BlogCatalog;
  let fixture: ComponentFixture<BlogCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCatalog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
