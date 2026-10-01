import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  imports: [RouterOutlet, ToastContainerComponent, NavbarComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
