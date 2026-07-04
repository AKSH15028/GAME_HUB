import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Homepage } from './homepage/homepage';
import { accessGuard } from './access-guard';
import { Game } from './game/game';
import { Setting } from './setting/setting';
import { Profile } from './profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'home', component: Homepage },
  { path: 'game', component: Game , canActivate: [accessGuard] }, // use access guard, canActivate: [accessGuard]
  { path: 'settings', component: Setting },
  { path: 'profile', component: Profile }
];