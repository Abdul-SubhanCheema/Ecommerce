import { Routes } from '@angular/router';
import { About } from '../core/about/about';
import { Login } from '../layout/login/login';
import { Adminhome } from '../core/adminhome/adminhome';
import { authGuard } from '../core/guards/auth-guard';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path:'login',component:Login},
    {path:"about",component: About,canActivate:[authGuard] },
    {path:"adminhome",component:Adminhome, canActivate:[authGuard]}

];
