import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Contact } from './contact/contact';
import { Policy } from './customer-support/policy/policy';
import { HowToBuy } from './customer-support/how-to-buy/how-to-buy';
import { AboutUs } from './about-us/about-us';
import { ProductList } from './product-list/product-list';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { AccountLayout } from './account/account-layout/account-layout';
import { PersonalInformation } from './account/personal-information/personal-information';
import { AddressComponent } from './account/address/address';
import { OrdersComponent } from './account/orders/orders';
import { ReturnManagementComponent } from './account/return-management/return-management';
import { ReviewsComponent } from './account/reviews/reviews';
import { Wishlist } from './account/wishlist/wishlist';
import { ProductDetail } from './product-detail/product-detail';
import { Cart } from './cart/cart';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'contact', component: Contact },
    { path: 'policy', component: Policy },
  { path: 'privacy', component: Policy },
  { path: 'term', component: Policy },
  { path: 'ship', component: Policy },
  { path: 'ship-method', component: Policy },
    { path: 'how-to-buy', component: HowToBuy },
    { path: 'aboutus', component: AboutUs },
    { path:'products', component: ProductList },
    { path:'products/:category', component: ProductList },
    {path:'login',component:Login},
    {path:'signup',component:Signup},
    {
      path:'account',
      component: AccountLayout,
      children: [
        { path: '', redirectTo: 'profile', pathMatch: 'full' },
        { path: 'profile', component: PersonalInformation },
        { path: 'address', component: AddressComponent },
        { path: 'orders', component: OrdersComponent },
        { path: 'returns', component: ReturnManagementComponent },
        { path: 'reviews', component: ReviewsComponent },
        { path: 'wishlist', component: Wishlist },
        { path: '**', redirectTo: 'profile' }
      ]
    },
    {path:'cart',component:Cart},
    {
    path: 'admin',
    loadChildren: () =>
      import('../app/admin/admin-module').then(m => m.AdminModule)
    },
    {path:'product/:id',component:ProductDetail},
];
