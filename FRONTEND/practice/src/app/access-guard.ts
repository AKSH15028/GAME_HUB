import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';

export const accessGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isLoggedIn = localStorage.getItem('user') !== null;

  if (isLoggedIn) {
    return true;
  }

  return router.createUrlTree(['/login']);
};