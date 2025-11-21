import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarSmartComponent } from './core/component/navbar/navbar.smart.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarSmartComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('apex-planner');
}
