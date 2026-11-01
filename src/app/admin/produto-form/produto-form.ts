import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Categoria } from '../../core/models/categoria';
import { Marca } from '../../core/models/marca';
import { ProdutoInput } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { MarcaService } from '../../core/services/marca';
import { ProdutoService } from '../../core/services/produto';
import { FORMATO_PRECO, formatarPreco, lerPreco } from '../../shared/utils/preco';

const LIMITE_DESCRICAO = 1000;

interface Caracteristica {
  nome: string;
  valor: string;
}

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-produto-form',
  styleUrl: './produto-form.css',
  templateUrl: './produto-form.html',
})
export class ProdutoForm {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly marcaService = inject(MarcaService);
  private readonly router = inject(Router);

  // parâmetro :id da rota, vazio durante o cadastro
  readonly id = input<string>();

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly marcas = signal<Marca[]>([]);
  protected readonly imagens = signal<string[]>([]);
  private readonly imagensNovas = new Set<string>();
  protected readonly caracteristicas = signal<Caracteristica[]>([
    { nome: 'Cor', valor: '' },
    { nome: 'Material', valor: '' },
    { nome: 'Tamanho', valor: '' },
  ]);
  protected readonly limiteDescricao = LIMITE_DESCRICAO;
  protected readonly salvando = signal(false);
  protected readonly enviandoImagem = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    descricao: ['', Validators.maxLength(LIMITE_DESCRICAO)],
    categoria_id: [null as string | null],
    marca_id: [null as string | null],
    preco: ['', Validators.pattern(FORMATO_PRECO)],
    estoque: [0, [Validators.required, Validators.min(0)]],
    destaque: [false],
  });

  constructor() {
    this.categoriaService
      .listar()
      .then((c) => this.categorias.set(c))
      .catch((e) => console.error('Erro ao carregar categorias', e));
    this.marcaService
      .listar()
      .then((m) => this.marcas.set(m))
      .catch((e) => console.error('Erro ao carregar marcas', e));

    effect(() => {
      const id = this.id();
      if (id) this.carregar(id);
    });
  }

  private async carregar(id: string) {
    const produto = await this.produtoService.buscarPorId(id);
    if (!produto) {
      this.erro.set('Produto não encontrado.');
      return;
    }
    this.form.patchValue({
      ...produto,
      preco: formatarPreco(produto.preco),
    });
    this.imagens.set(produto.imagens.map((i) => i.url));
    this.caracteristicas.set(produto.caracteristicas.map(({ nome, valor }) => ({ nome, valor })));
  }

  protected async adicionarImagens(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    const arquivos = Array.from(campo.files ?? []);
    if (!arquivos.length) return;

    this.enviandoImagem.set(true);
    try {
      for (const arquivo of arquivos) {
        const url = await this.produtoService.enviarImagem(arquivo);
        this.imagensNovas.add(url);
        this.imagens.update((lista) => [...lista, url]);
      }
    } catch (e) {
      console.error(e);
      this.erro.set('Erro ao enviar imagem.');
    } finally {
      this.enviandoImagem.set(false);
      campo.value = '';
    }
  }

  protected removerImagem(url: string) {
    this.imagens.update((lista) => lista.filter((i) => i !== url));
    if (this.imagensNovas.delete(url)) this.produtoService.descartarImagens([url]);
  }

  protected moverImagem(indice: number, direcao: -1 | 1) {
    this.imagens.update((lista) => {
      const nova = [...lista];
      [nova[indice], nova[indice + direcao]] = [nova[indice + direcao], nova[indice]];
      return nova;
    });
  }

  protected adicionarCaracteristica() {
    this.caracteristicas.update((lista) => [...lista, { nome: '', valor: '' }]);
  }

  protected alterarCaracteristica(indice: number, campo: keyof Caracteristica, evento: Event) {
    const valor = (evento.target as HTMLInputElement).value;
    this.caracteristicas.update((lista) =>
      lista.map((c, i) => (i === indice ? { ...c, [campo]: valor } : c)),
    );
  }

  protected removerCaracteristica(indice: number) {
    this.caracteristicas.update((lista) => lista.filter((_, i) => i !== indice));
  }

  protected async salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const produto: ProdutoInput = {
      nome: valores.nome!.trim(),
      descricao: valores.descricao?.trim() || null,
      categoria_id: valores.categoria_id || null,
      marca_id: valores.marca_id || null,
      preco: valores.preco?.trim() ? lerPreco(valores.preco.trim()) : null,
      estoque: valores.estoque ?? 0,
      destaque: !!valores.destaque,
    };
    // características sem nome ou valor não são gravadas
    const caracteristicas = this.caracteristicas()
      .map((c) => ({ nome: c.nome.trim(), valor: c.valor.trim() }))
      .filter((c) => c.nome && c.valor);

    this.salvando.set(true);
    this.erro.set(null);
    try {
      await this.produtoService.salvar(this.id(), {
        produto,
        imagens: this.imagens(),
        caracteristicas,
      });
      await this.router.navigate(['/admin/produtos']);
    } catch (e) {
      console.error(e);
      this.erro.set('Não foi possível salvar o produto.');
    } finally {
      this.salvando.set(false);
    }
  }
}
