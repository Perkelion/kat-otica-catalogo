import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Produto } from '../../../core/models/produto';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-produto-card',
  styleUrl: './produto-card.css',
  templateUrl: './produto-card.html',
})
export class ProdutoCard {
  readonly produto = input.required<Produto>();
}
