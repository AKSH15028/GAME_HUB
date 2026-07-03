import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, Header],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {}
