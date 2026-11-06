import { Component, input, output, signal } from '@angular/core';
import { Categoria } from '../../../core/models/categoria';
import { Marca } from '../../../core/models/marca';
import { FiltrosProduto } from '../../../core/models/produto';

@Component({
  imports: [],
  selector: 'app-filtros',
  styleUrl: './filtros.css',
  templateUrl: './filtros.html',
})
export class Filtros {
  readonly categorias = input<Categoria[]>([]);
  readonly marcas = input<Marca[]>([]);
  readonly categoriaSelecionada = input<string | undefined>();
  readonly marcaSelecionada = input<string | undefined>();
  readonly buscaInicial = input<string | undefined>();

  readonly filtrosChange = output<FiltrosProduto>();
  readonly categoriaChange = output<string | undefined>();
  readonly marcaChange = output<string | undefined>();

  private readonly filtros = signal<FiltrosProduto>({});

  protected atualizar(campo: keyof FiltrosProduto, evento: Event) {
    const valor = (evento.target as HTMLInputElement | HTMLSelectElement).value;
    this.filtros.update((f) => ({ ...f, [campo]: valor || undefined }));
    this.filtrosChange.emit(this.filtros());
  }

  protected selecionarCategoria(evento: Event) {
    const id = (evento.target as HTMLSelectElement).value;
    this.categoriaChange.emit(id || undefined);
  }

  protected selecionarMarca(evento: Event) {
    const id = (evento.target as HTMLSelectElement).value;
    this.marcaChange.emit(id || undefined);
  }
}
