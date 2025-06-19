import { Routes } from '@angular/router';
import { DetailPost } from './components/detail-post/detail-post';
import { EditPost } from './components/edit-post/edit-post';
import { CreatePost } from './components/create-post/create-post';
import { Login } from './components/login/login';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/homepage/homepage').then(m => m.Homepage)
  },
  {
    path: 'create',
    component: CreatePost,
    canActivate: [AuthGuard]
  },
  {
    path: 'posts/:id',
    component: DetailPost
  },
  {
    path: 'edit/:id',
    component: EditPost,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '**',
    redirectTo: ''
  }
];
