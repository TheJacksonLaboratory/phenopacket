import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  items: MenuItem[];

  constructor() {
  }

  ngOnInit() {
    this.items = [
      {label: 'Phenopackets', icon: 'pi pi-fw pi-users', routerLink: '/dashboard'},
      {label: 'Add Phenopacket', icon: 'pi pi-fw pi-plus', routerLink: '/creator', styleClass: 'submenu'}
    ];
  }

}
