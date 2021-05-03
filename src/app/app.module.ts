import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TabViewModule } from 'primeng/tabview';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { AppComponent } from './app.component';
import { PlanningSessionComponent } from './components/planning-session/planning-session.component';
import { HomeComponent } from './components/home/home.component';
import { AppRoutingModule } from './app-routing-module';
import { CardsViewComponent } from './components/cards-view/cards-view.component';

@NgModule({
  declarations: [
    AppComponent,
    PlanningSessionComponent,
    HomeComponent,
    CardsViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    TabViewModule,
    ScrollPanelModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
