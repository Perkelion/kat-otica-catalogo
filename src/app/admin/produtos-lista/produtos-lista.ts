import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Produto } from '../../core/models/produto';
import { ProdutoService } from '../../core/services/produto';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-produtos-lista',
  styleUrl: './produtos-lista.css',
  templateUrl: './produtos-lista.html',
})
export class ProdutosLista {
  private readonly produtoService = inject(ProdutoService);

  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly busca = signal('');

  constructor() {
    this.carregar();
  }

  protected async carregar() {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      this.produtos.set(
        await this.produtoService.listar({ busca: this.busca(), incluirInativos: true }),
      );
    } catch (e) {
      console.error(e);
      this.erro.set('Erro ao carregar produtos.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected async remover(produto: Produto) {
    if (!confirm(`Remover "${produto.nome}" do catálogo?`)) return;
    try {
      await this.produtoService.remover(produto.id);
      this.produtos.update((lista) => lista.filter((p) => p.id !== produto.id));
    } catch (e) {
      console.error(e);
      alert('Não foi possível remover o produto.');
    }
  }
}
