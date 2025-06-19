import { Routes } from '@angular/router';
import { Posts } from './components/posts/posts';
import { DetailPost } from './components/detail-post/detail-post';
import { EditPost } from './components/edit-post/edit-post';
import { CreatePost } from './components/create-post/create-post';
import { Login } from './components/login/login';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/homepage/homepage').then(m => m.Homepage)
    },
    {
        path: 'create',
        component: CreatePost
    },
    {
        path: 'posts/:id',
        component: DetailPost
    }, 
    {
        path: 'edit/:id',
        component: EditPost
    }, {
        path: 'login',
        component: Login
    },
    {
        path: '**',
        redirectTo: ''
    }
];
