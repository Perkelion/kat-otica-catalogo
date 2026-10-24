import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Categoria } from '../../core/models/categoria';
import { Genero, ProdutoInput } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { ProdutoService } from '../../core/services/produto';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-produto-form',
  styleUrl: './produto-form.css',
  templateUrl: './produto-form.html',
})
export class ProdutoForm {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly imagens = signal<string[]>([]);
  protected readonly salvando = signal(false);
  protected readonly enviandoImagem = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    descricao: [''],
    marca: [''],
    categoria_id: [null as number | null],
    preco: [null as number | null, Validators.min(0)],
    genero: ['' as Genero | ''],
    material: [''],
    formato: [''],
    cor: [''],
    destaque: [false],
    ativo: [true],
  });

  constructor() {
    this.categoriaService
      .listar()
      .then((c) => this.categorias.set(c))
      .catch((e) => console.error('Erro ao carregar categorias', e));

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
    this.form.patchValue({ ...produto, genero: produto.genero ?? '' });
    this.imagens.set(produto.imagens ?? []);
  }

  protected async adicionarImagens(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    const arquivos = Array.from(campo.files ?? []);
    if (!arquivos.length) return;

    this.enviandoImagem.set(true);
    try {
      for (const arquivo of arquivos) {
        const url = await this.produtoService.enviarImagem(arquivo);
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
  }

  protected async salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const vazioParaNull = (v: string | null) => (v?.trim() ? v.trim() : null);
    const produto: ProdutoInput = {
      nome: valores.nome!.trim(),
      descricao: vazioParaNull(valores.descricao),
      marca: vazioParaNull(valores.marca),
      categoria_id: valores.categoria_id ? Number(valores.categoria_id) : null,
      preco: valores.preco ?? null,
      genero: valores.genero || null,
      material: vazioParaNull(valores.material),
      formato: vazioParaNull(valores.formato),
      cor: vazioParaNull(valores.cor),
      destaque: !!valores.destaque,
      ativo: !!valores.ativo,
      imagens: this.imagens(),
    };

    this.salvando.set(true);
    this.erro.set(null);
    try {
      const id = this.id();
      if (id) {
        await this.produtoService.atualizar(id, produto);
      } else {
        await this.produtoService.criar(produto);
      }
      await this.router.navigate(['/admin/produtos']);
    } catch (e) {
      console.error(e);
      this.erro.set('Não foi possível salvar o produto.');
    } finally {
      this.salvando.set(false);
    }
  }
}
