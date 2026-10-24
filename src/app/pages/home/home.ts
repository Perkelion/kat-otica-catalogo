import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../core/models/categoria';
import { Produto } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { ProdutoService } from '../../core/services/produto';
import { ProdutoCard } from '../../shared/components/produto-card/produto-card';

@Component({
  imports: [RouterLink, ProdutoCard],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly destaques = signal<Produto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);

  constructor() {
    this.carregar();
  }

  private async carregar() {
    try {
      const [destaques, categorias] = await Promise.all([
        this.produtoService.listar({ somenteDestaques: true }),
        this.categoriaService.listar(),
      ]);
      this.destaques.set(destaques.slice(0, 8));
      this.categorias.set(categorias);
    } catch (erro) {
      console.error('Erro ao carregar a página inicial', erro);
    }
  }
}
