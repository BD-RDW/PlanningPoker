import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Scrum tooling';

  items: MenuItem[] = [
    {label: 'home', routerLink: 'home'},
    {label: 'retro', routerLink: 'retro'},
    {label: 'plan', routerLink: 'plan'},
  ];
  activeItem: MenuItem = this.items[0];

  ngOnInit(): void {
    this.items = [
      {label: 'home', routerLink: 'home', icon: 'pi pi-fw pi-home'},
      {label: 'retro', routerLink: 'retro', icon: 'pi pi-fw pi-bars'},
      {label: 'plan', routerLink: 'plan', icon: 'pi pi-fw pi-chart-line'}
    ];
    this.activeItem = this.items[0];
  }
  onActivate(elementRef): void {
    elementRef.tabSelectedEvent.subscribe(event => {
        console.log(event);
        this.activeItem = this.items[event - 1];
    });
}
}

