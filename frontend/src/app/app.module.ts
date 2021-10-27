import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { PrimeIcons } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { MenuModule } from 'primeng/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { AppRoutingModule } from './app-routing-module';
import { RetroSessionComponent } from './components/retro-session/retro-session.component';
import { StatusComponent } from './components/status/status.component';
import { RetrospectiveColumnComponent } from './components/retrospective-column/retrospective-column.component';
import { RetrospectiveMessageComponent } from './components/retrospective-message/retrospective-message.component';
import { CardsViewComponent } from './components/cards-view/cards-view.component';
import { ResultViewComponent } from './components/result-view/result-view.component';
import { PlanningSessionComponent } from './components/planning-session/planning-session.component';
import { MessagesViewComponent } from './components/messages-view/messages-view.component';

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
    ResultViewComponent,
    MessagesViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    TabMenuModule,
    ScrollPanelModule,
    BrowserAnimationsModule,
    ButtonModule,
    ChartModule,
    DialogModule,
    ToastModule,
    MenuModule,
    FontAwesomeModule
  ],
  providers: [PrimeIcons,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    CookieService,
    MessageService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
