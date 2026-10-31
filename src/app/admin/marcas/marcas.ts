import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Marca } from '../../core/models/marca';
import { MarcaService } from '../../core/services/marca';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-marcas',
  styleUrl: './marcas.css',
  templateUrl: './marcas.html',
})
export class Marcas {
  private readonly marcaService = inject(MarcaService);

  protected readonly marcas = signal<Marca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);
  private logo: File | null = null;

  protected readonly form = inject(FormBuilder).group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor() {
    this.carregar();
  }

  private async carregar() {
    this.carregando.set(true);
    try {
      this.marcas.set(await this.marcaService.listar());
    } catch (e) {
      console.error(e);
      this.erro.set('Erro ao carregar marcas.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected selecionarLogo(evento: Event) {
    this.logo = (evento.target as HTMLInputElement).files?.[0] ?? null;
  }

  protected async adicionar(campoLogo: HTMLInputElement) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);
    try {
      const logo_url = this.logo ? await this.marcaService.enviarLogo(this.logo) : null;
      const marca = await this.marcaService.criar({
        nome: this.form.getRawValue().nome!.trim(),
        logo_url,
      });
      this.marcas.update((lista) => [...lista, marca].sort((a, b) => a.nome.localeCompare(b.nome)));
      this.form.reset();
      this.logo = null;
      campoLogo.value = '';
    } catch (e) {
      console.error(e);
      this.erro.set('Não foi possível cadastrar a marca. Verifique se ela já existe.');
    } finally {
      this.salvando.set(false);
    }
  }

  protected async remover(marca: Marca) {
    if (!confirm(`Remover a marca "${marca.nome}"? Os produtos dela ficarão sem marca.`)) return;
    try {
      await this.marcaService.remover(marca);
      this.marcas.update((lista) => lista.filter((m) => m.id !== marca.id));
    } catch (e) {
      console.error(e);
      alert('Não foi possível remover a marca.');
    }
  }
}
