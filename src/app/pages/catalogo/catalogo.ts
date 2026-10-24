import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { Categoria } from '../../core/models/categoria';
import { FiltrosProduto, Produto } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { ProdutoService } from '../../core/services/produto';
import { Filtros } from '../../shared/components/filtros/filtros';
import { ProdutoCard } from '../../shared/components/produto-card/produto-card';

@Component({
  imports: [Filtros, ProdutoCard],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  readonly categoria = input<string>();
  readonly busca = input<string>();

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly filtros = signal<FiltrosProduto>({});

  private ultimaRequisicao = 0;

  constructor() {
    this.categoriaService
      .listar()
      .then((c) => this.categorias.set(c))
      .catch((e) => console.error('Erro ao carregar categorias', e));

    effect(() => {
      const filtros: FiltrosProduto = {
        busca: this.busca(),
        ...this.filtros(),
        categoriaSlug: this.categoria(),
      };
      untracked(() => this.carregar(filtros));
    });
  }

  protected selecionarCategoria(slug: string | undefined) {
    this.router.navigate([], { queryParams: { categoria: slug }, queryParamsHandling: 'merge' });
  }

  private async carregar(filtros: FiltrosProduto) {
    const requisicao = ++this.ultimaRequisicao;
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const produtos = await this.produtoService.listar(filtros);
      if (requisicao === this.ultimaRequisicao) this.produtos.set(produtos);
    } catch (e) {
      console.error(e);
      if (requisicao === this.ultimaRequisicao) {
        this.erro.set('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      }
    } finally {
      if (requisicao === this.ultimaRequisicao) this.carregando.set(false);
    }
  }
}
