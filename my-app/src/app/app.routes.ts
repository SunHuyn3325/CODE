import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Contact } from './contact/contact';
import { Policy } from './customer-support/policy/policy';
import { Privacy } from './customer-support/privacy/privacy';
import { Term } from './customer-support/term/term';
import { Ship } from './customer-support/ship/ship';
import { ShipMethod } from './customer-support/ship-method/ship-method';
import { HowToBuy } from './customer-support/how-to-buy/how-to-buy';
import { AboutUs } from './about-us/about-us';
import { ProductList } from './product-list/product-list';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Account } from './account/account';
import { ProductDetail } from './product-detail/product-detail';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'contact', component: Contact },
    { path: 'policy', component: Policy },
    { path: 'privacy', component: Privacy },
    { path: 'term', component: Term },
    { path: 'ship', component: Ship },
    { path: 'ship-method', component: ShipMethod },
    { path: 'how-to-buy', component: HowToBuy },
    { path: 'aboutus', component: AboutUs },
    { path:'products', component: ProductList },
    { path:'products/:category', component: ProductList },
    {path:'login',component:Login},
    {path:'signup',component:Signup},
    {path:'account',component:Account},
    {
    path: 'admin',
    loadChildren: () =>
      import('../app/admin/admin-module').then(m => m.AdminModule)
    },
    {path:'product/:id',component:ProductDetail},
];
