import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  imports: [],
  selector: 'app-sobre',
  styleUrl: './sobre.css',
  templateUrl: './sobre.html',
})
export class Sobre {
  protected readonly contato = environment;
  protected readonly linkWhatsapp = `https://wa.me/${environment.whatsapp}`;
}
