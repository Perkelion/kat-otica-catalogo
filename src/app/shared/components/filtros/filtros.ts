import { Component, input, output, signal } from '@angular/core';
import { Categoria } from '../../../core/models/categoria';
import { FiltrosProduto, Genero } from '../../../core/models/produto';

@Component({
  imports: [],
  selector: 'app-filtros',
  styleUrl: './filtros.css',
  templateUrl: './filtros.html',
})
export class Filtros {
  readonly categorias = input<Categoria[]>([]);
  readonly categoriaSelecionada = input<string | undefined>();
  readonly buscaInicial = input<string | undefined>();

  readonly filtrosChange = output<FiltrosProduto>();
  readonly categoriaChange = output<string | undefined>();

  protected readonly generos: { valor: Genero; rotulo: string }[] = [
    { valor: 'feminino', rotulo: 'Feminino' },
    { valor: 'masculino', rotulo: 'Masculino' },
    { valor: 'unissex', rotulo: 'Unissex' },
    { valor: 'infantil', rotulo: 'Infantil' },
  ];
  protected readonly materiais = ['Acetato', 'Metal', 'TR90', 'Titânio'];
  protected readonly formatos = ['Redondo', 'Quadrado', 'Retangular', 'Gatinho', 'Aviador'];

  private readonly filtros = signal<FiltrosProduto>({});

  protected atualizar(campo: keyof FiltrosProduto, evento: Event) {
    const valor = (evento.target as HTMLInputElement | HTMLSelectElement).value;
    this.filtros.update((f) => ({ ...f, [campo]: valor || undefined }));
    this.filtrosChange.emit(this.filtros());
  }

  protected selecionarCategoria(evento: Event) {
    const slug = (evento.target as HTMLSelectElement).value;
    this.categoriaChange.emit(slug || undefined);
  }
}
