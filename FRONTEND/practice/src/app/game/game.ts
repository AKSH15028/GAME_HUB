import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-game',
  imports: [RouterLink],
  templateUrl:'./game.html',
  styleUrl: './game.css',
})
export class Game {}
