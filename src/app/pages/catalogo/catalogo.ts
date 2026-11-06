import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { Categoria } from '../../core/models/categoria';
import { Marca } from '../../core/models/marca';
import { FiltrosProduto, Produto } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { MarcaService } from '../../core/services/marca';
import { ProdutoService } from '../../core/services/produto';
import { Filtros } from './filtros/filtros';
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
  private readonly marcaService = inject(MarcaService);
  private readonly router = inject(Router);

  // Query params da URL
  readonly categoria = input<string>();
  readonly marca = input<string>();
  readonly busca = input<string>();

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly marcas = signal<Marca[]>([]);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly filtros = signal<FiltrosProduto>({});

  protected readonly porPagina = 12;
  protected readonly pagina = signal(1);
  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.produtos().length / this.porPagina)),
  );
  protected readonly paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1),
  );
  protected readonly produtosDaPagina = computed(() => {
    const inicio = (this.pagina() - 1) * this.porPagina;
    return this.produtos().slice(inicio, inicio + this.porPagina);
  });

  private ultimaRequisicao = 0;

  constructor() {
    this.categoriaService
      .listar()
      .then((c) => this.categorias.set(c))
      .catch((e) => console.error('Erro ao carregar categorias', e));
    this.marcaService
      .listar()
      .then((m) => this.marcas.set(m))
      .catch((e) => console.error('Erro ao carregar marcas', e));

    // reload quando filtra
    effect(() => {
      const filtros: FiltrosProduto = {
        busca: this.busca(),
        ...this.filtros(),
        categoriaId: this.categoria(),
        marcaId: this.marca(),
      };
      untracked(() => this.carregar(filtros));
    });
  }

  protected selecionarCategoria(id: string | undefined) {
    this.router.navigate([], { queryParams: { categoria: id }, queryParamsHandling: 'merge' });
  }

  protected selecionarMarca(id: string | undefined) {
    this.router.navigate([], { queryParams: { marca: id }, queryParamsHandling: 'merge' });
  }

  protected irParaPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.pagina()) return;
    this.pagina.set(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private async carregar(filtros: FiltrosProduto) {
    const requisicao = ++this.ultimaRequisicao;
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const produtos = await this.produtoService.listar(filtros);
      if (requisicao === this.ultimaRequisicao) {
        this.produtos.set(produtos);
        this.pagina.set(1);
      }
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
