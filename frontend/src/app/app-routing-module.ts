import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { RetroSessionComponent } from './components/retro-session/retro-session.component';
import { PlanningSessionComponent } from './components/planning-session/planning-session.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'retro', component: RetroSessionComponent },
  { path: 'plan', component: PlanningSessionComponent },
];

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
