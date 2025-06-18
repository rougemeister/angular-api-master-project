import { Component } from '@angular/core';

import { Homepage } from "./components/homepage/homepage";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App  {
 
}
