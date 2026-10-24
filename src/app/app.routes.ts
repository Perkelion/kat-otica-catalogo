import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        title: 'Kat Ótica',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'catalogo',
        title: 'Catálogo | Kat Ótica',
        loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo),
      },
      {
        path: 'produto/:id',
        title: 'Produto | Kat Ótica',
        loadComponent: () =>
          import('./pages/produto-detalhe/produto-detalhe').then((m) => m.ProdutoDetalhe),
      },
      {
        path: 'sobre',
        title: 'Sobre | Kat Ótica',
        loadComponent: () => import('./pages/sobre/sobre').then((m) => m.Sobre),
      },
      {
        path: 'contato',
        title: 'Contato | Kat Ótica',
        loadComponent: () => import('./pages/contato/contato').then((m) => m.Contato),
      },
    ],
  },

  {
    path: 'admin/login',
    title: 'Entrar | Kat Ótica',
    loadComponent: () => import('./admin/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'produtos' },
      {
        path: 'produtos',
        title: 'Produtos | Admin',
        loadComponent: () =>
          import('./admin/produtos-lista/produtos-lista').then((m) => m.ProdutosLista),
      },
      {
        path: 'produtos/novo',
        title: 'Novo produto | Admin',
        loadComponent: () => import('./admin/produto-form/produto-form').then((m) => m.ProdutoForm),
      },
      {
        path: 'produtos/:id/editar',
        title: 'Editar produto | Admin',
        loadComponent: () => import('./admin/produto-form/produto-form').then((m) => m.ProdutoForm),
      },
    ],
  },

  {
    path: '**',
    title: 'Página não encontrada | Kat Ótica',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
