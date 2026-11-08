import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../core/models/categoria';
import { Marca } from '../../core/models/marca';
import { Produto } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { MarcaService } from '../../core/services/marca';
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
  private readonly marcaService = inject(MarcaService);

  protected readonly destaques = signal<Produto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly marcas = signal<Marca[]>([]);

  constructor() {
    this.carregar();
  }

  private async carregar() {
    try {
      const [destaques, categorias, marcas] = await Promise.all([
        this.produtoService.listar({ somenteDestaques: true }),
        this.categoriaService.listar(),
        this.marcaService.listar(),
      ]);
      this.destaques.set(destaques.slice(0, 8));
      this.categorias.set(categorias);
      this.marcas.set(marcas);
    } catch (erro) {
      console.error('Erro ao carregar a página inicial', erro);
    }
  }
}
