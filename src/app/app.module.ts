import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TabViewModule } from 'primeng/tabview';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { PrimeIcons } from 'primeng/api';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { AppRoutingModule } from './app-routing-module';
import { RetroSessionComponent } from './components/retro-session/retro-session.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RetroSessionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    TabViewModule,
    ScrollPanelModule,
    BrowserAnimationsModule,
    ButtonModule,
    ChartModule
  ],
  providers: [PrimeIcons],
  bootstrap: [AppComponent]
})
export class AppModule { }
