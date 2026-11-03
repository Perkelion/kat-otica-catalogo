import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../core/models/categoria';
import { Marca } from '../../core/models/marca';
import { Produto } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { MarcaService } from '../../core/services/marca';
import { ProdutoService } from '../../core/services/produto';

// regex na busca
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-produtos-lista',
  styleUrl: './produtos-lista.css',
  templateUrl: './produtos-lista.html',
})
export class ProdutosLista {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly marcaService = inject(MarcaService);

  protected readonly produtos = signal<Produto[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly marcas = signal<Marca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  //filtros
  protected readonly busca = signal('');
  protected readonly categoriaId = signal('');
  protected readonly marcaId = signal('');
  protected readonly destaque = signal<'' | 'sim' | 'nao'>('');
  protected readonly estoque = signal<'' | 'com' | 'sem'>('');

  protected readonly temFiltro = computed(
    () =>
      !!(this.busca() || this.categoriaId() || this.marcaId() || this.destaque() || this.estoque()),
  );

  protected readonly produtosFiltrados = computed(() => {
    const busca = normalizar(this.busca().trim());
    return this.produtos().filter(
      (p) =>
        (!busca ||
          normalizar(`${p.nome} ${p.descricao ?? ''} ${p.marca?.nome ?? ''}`).includes(busca)) &&
        (!this.categoriaId() || p.categoria_id === this.categoriaId()) &&
        (!this.marcaId() || p.marca_id === this.marcaId()) &&
        (!this.destaque() || p.destaque === (this.destaque() === 'sim')) &&
        (!this.estoque() || p.estoque > 0 === (this.estoque() === 'com')),
    );
  });

  constructor() {
    this.carregar();
    this.categoriaService
      .listar()
      .then((c) => this.categorias.set(c))
      .catch((e) => console.error('Erro ao carregar categorias', e));
    this.marcaService
      .listar()
      .then((m) => this.marcas.set(m))
      .catch((e) => console.error('Erro ao carregar marcas', e));
  }

  protected async carregar() {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      this.produtos.set(await this.produtoService.listar());
    } catch (e) {
      console.error(e);
      this.erro.set('Erro ao carregar produtos.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected limparFiltros() {
    this.busca.set('');
    this.categoriaId.set('');
    this.marcaId.set('');
    this.destaque.set('');
    this.estoque.set('');
  }

  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
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
