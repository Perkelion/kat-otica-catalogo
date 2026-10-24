import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Produto } from '../../core/models/produto';
import { ProdutoService } from '../../core/services/produto';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-produto-detalhe',
  styleUrl: './produto-detalhe.css',
  templateUrl: './produto-detalhe.html',
})
export class ProdutoDetalhe {
  private readonly produtoService = inject(ProdutoService);

  // Parâmetro :id da rota
  readonly id = input.required<string>();

  protected readonly produto = signal<Produto | null>(null);
  protected readonly carregando = signal(true);
  protected readonly imagemAtual = signal(0);

  protected readonly linkWhatsapp = computed(() => {
    const p = this.produto();
    const mensagem = `Olá! Tenho interesse no produto "${p?.nome}" que vi no catálogo.`;
    return `https://wa.me/${environment.whatsapp}?text=${encodeURIComponent(mensagem)}`;
  });

  constructor() {
    effect(() => this.carregar(this.id()));
  }

  private async carregar(id: string) {
    this.carregando.set(true);
    this.imagemAtual.set(0);
    try {
      this.produto.set(await this.produtoService.buscarPorId(id));
    } catch (e) {
      console.error(e);
      this.produto.set(null);
    } finally {
      this.carregando.set(false);
    }
  }
}
