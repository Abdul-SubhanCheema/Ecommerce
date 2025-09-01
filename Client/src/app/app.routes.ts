import { Routes } from '@angular/router';
import { About } from '../core/about/about';
import { Login } from '../layout/login/login';
import { Adminhome } from '../core/adminhome/adminhome';
import { authGuard } from '../core/guards/auth-guard';
import { Notfound } from '../core/notfound/notfound';
import { Products } from '../core/products/products';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path:'login',component:Login},
    {path:"about",component: About },
    {path:"Products-list",component:Products},
    {path:"adminhome",component:Adminhome, canActivate:[authGuard]},
    {path:'**',component:Notfound},

];
