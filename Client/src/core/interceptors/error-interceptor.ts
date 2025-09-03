import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router=inject(Router);

  return next(req).pipe(catchError(error => {
    if (error) {
      switch (error.status) {
        case 400:
          toastService.error(error.error);
          break;
        case 401:
          toastService.error("UnAuthorized");
          break;
        case 404:
          router.navigateByUrl("/not-found");
          // toastService.error("Not Found");
          break;
        case 500:
          toastService.error("Server Error");
          break;

        default:
          toastService.error("Something went Wrong!")
          break;
      }
    }
    throw error;
  }));
};
