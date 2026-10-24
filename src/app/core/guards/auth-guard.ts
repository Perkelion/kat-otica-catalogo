import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

//libera a área de admin apenas pra usuários autenticados no Supabase.
export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const sessao = await inject(AuthService).obterSessao();
  return sessao ? true : router.createUrlTree(['/admin/login']);
};
