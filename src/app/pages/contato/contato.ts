import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  imports: [],
  selector: 'app-contato',
  styleUrl: './contato.css',
  templateUrl: './contato.html',
})
export class Contato {
  protected readonly contato = environment;
  protected readonly linkWhatsapp = `https://wa.me/${environment.whatsapp}`;
}
