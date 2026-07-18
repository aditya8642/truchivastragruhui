import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  // TODO: swap this for your real Instagram handle/URL
  instagramUrl = 'https://www.instagram.com/truchivastragruh/';
  year = new Date().getFullYear();
}
