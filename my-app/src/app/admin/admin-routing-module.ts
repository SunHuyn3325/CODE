import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Mainpage } from './mainpage/mainpage';
import { Admin } from './admin/admin';
import { OrderManagement } from './order-management/order-management';
import { UserManagement } from './user-management/user-management';

const routes: Routes = [
  {
    path: '',
    component: Admin,
    children: [
      { path: 'mainpage', component: Mainpage },
      { path: 'orders', component: OrderManagement },
      { path: 'users', component: UserManagement },

      { path: '', redirectTo: 'mainpage', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
