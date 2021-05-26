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
import { StatusComponent } from './components/status/status.component';
import { RetrospectiveColumnComponent } from './components/retrospective-column/retrospective-column.component';
import { RetrospectiveMessageComponent } from './components/retrospective-message/retrospective-message.component';
import { CardsViewComponent } from './components/cards-view/cards-view.component';
import { ResultViewComponent } from './components/result-view/result-view.component';
import { PlanningSessionComponent } from './components/planning-session/planning-session.component'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RetroSessionComponent,
    StatusComponent,
    RetrospectiveColumnComponent,
    RetrospectiveMessageComponent,
    PlanningSessionComponent,
    CardsViewComponent,
    ResultViewComponent
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
export class AppModule {
}
