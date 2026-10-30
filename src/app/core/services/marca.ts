import { inject, Service } from '@angular/core';
import { Marca, MarcaInput } from '../models/marca';
import { SupabaseService } from './supabase';

@Service()
export class MarcaService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase = this.supabaseService.client;

  async listar(): Promise<Marca[]> {
    const { data, error } = await this.supabase.from('marcas').select('*').order('nome');
    if (error) throw error;
    return data;
  }

  async criar(marca: MarcaInput): Promise<Marca> {
    const { data, error } = await this.supabase.from('marcas').insert(marca).select().single();
    if (error) throw error;
    return data as Marca;
  }

  async remover(marca: Marca): Promise<void> {
    // Produtos da marca ficam sem marca
    const { error } = await this.supabase.from('marcas').delete().eq('id', marca.id);
    if (error) throw error;
    if (marca.logo_url) await this.supabaseService.removerImagens([marca.logo_url]);
  }

  enviarLogo(arquivo: File): Promise<string> {
    return this.supabaseService.enviarImagem(arquivo);
  }
}
