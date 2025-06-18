import { Component } from '@angular/core';

import { Homepage } from "./components/homepage/homepage";

@Component({
  selector: 'app-root',
  imports: [Homepage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App  {
 
}
