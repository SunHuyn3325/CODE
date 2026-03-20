import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { SacBee } from './sac-bee/sac-bee';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
            Header,
            Footer,
            SacBee,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');
}
