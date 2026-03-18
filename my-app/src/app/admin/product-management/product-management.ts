import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductApiService } from '../../product-api.service';
import { CommonModule, CurrencyPipe, SlicePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.html',
  styleUrls: ['./product-management.css'],
})
export class ProductManagement implements OnInit {

  products: any[] = [];
  paginatedProducts: any[] = [];
  selectedProducts: string[] = [];

  productForm!: FormGroup;
  images: string[] = [];
  isEditing = false;
  editingProductId: string | null = null;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  canEdit = true; // tạm thời

  constructor(private fb: FormBuilder, private productService: ProductApiService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.productForm = this.fb.group({
      product_name: ['', Validators.required],
      product_dept: ['', Validators.required],
      product_detail: [''],
      unit_price: [0, Validators.required],
      stocked_quantity: [0, Validators.required],
      discount: [0],
      rating: [0]
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data: any[]) => {
      this.products = data;
      this.totalPages = Math.ceil(this.products.length / this.pageSize);
      this.updatePagination();
    });
  }

  updatePagination() {
    const start = (this.currentPage-1)*this.pageSize;
    this.paginatedProducts = this.products.slice(start, start + this.pageSize);
  }

  previousPage() {
    if(this.currentPage>1){ this.currentPage--; this.updatePagination(); }
  }

  nextPage() {
    if(this.currentPage<this.totalPages){ this.currentPage++; this.updatePagination(); }
  }

  createProduct() {
    const data = {...this.productForm.value, images: this.images};
    this.productService.addProduct(data).subscribe({
      next: (res) => { this.products.push(res); this.totalPages = Math.ceil(this.products.length/this.pageSize); this.updatePagination(); this.productForm.reset(); this.images=[]; },
      error: err => console.error(err)
    });
  }

  editProduct(product: any) {
    this.isEditing = true;
    this.editingProductId = product._id;
    this.productForm.patchValue(product);
    this.images = product.images || [];
  }

  updateProduct() {
    if(!this.editingProductId) return;
    const data = {...this.productForm.value, images: this.images};
    this.productService.updateProduct(this.editingProductId, data).subscribe({
      next: (res) => {
        const idx = this.products.findIndex(p=>p._id===this.editingProductId);
        if(idx!==-1) this.products[idx]=res;
        this.cancelEdit();
        this.updatePagination();
      },
      error: err => console.error(err)
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingProductId = null;
    this.productForm.reset();
    this.images=[];
  }

  deleteProduct(id: string) {
    if(!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => { this.products = this.products.filter(p=>p._id!==id); this.updatePagination(); },
      error: err => console.error(err)
    });
  }

  deleteSelectedProducts() {
    if(!confirm("Bạn có chắc muốn xóa các sản phẩm đã chọn?")) return;
    this.selectedProducts.forEach(id=>this.deleteProduct(id));
    this.selectedProducts = [];
  }

  isSelected(id: string) { return this.selectedProducts.includes(id); }

  toggleSelect(id: string) {
    if(this.selectedProducts.includes(id)) this.selectedProducts = this.selectedProducts.filter(x=>x!==id);
    else this.selectedProducts.push(id);
  }

  toggleSelectAll(event: any) {
    if(event.target.checked) this.selectedProducts = this.products.map(p=>p._id!);
    else this.selectedProducts = [];
  }

  onImageChange(event: any, index: number) {
    const file = event.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = e => { this.images[index] = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  clearImage(index: number) {
    this.images[index] = '';
  }
}
