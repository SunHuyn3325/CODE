import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Contact } from './contact/contact';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
            Header,
            Footer,
            Contact,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');
}
