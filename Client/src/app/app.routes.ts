import { Routes } from '@angular/router';
import { About } from '../core/about/about';
import { Login } from '../layout/login/login';
import { Adminhome } from '../core/adminhome/adminhome';
import { authGuard } from '../core/guards/auth-guard';
import { Notfound } from '../core/notfound/notfound';
import { Products } from '../core/products/products';
import { Productdetail } from '../core/productdetail/productdetail';
import { Cartdetails } from '../core/cartdetails/cartdetails';
import { Contact } from '../core/contact/contact';
import { Deals } from '../core/deals/deals';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path:'login',component:Login},
    {path:"about",component: About },
    {path:"contact",component: Contact },
    {path:"Products-list",component:Products},
    {path:"productdetail/:id",component:Productdetail},
    {path:"cart",component:Cartdetails},
    {path:"deals",component:Deals},
    {path:"adminhome",component:Adminhome, canActivate:[authGuard]},
    {path:'**',component:Notfound},
];
