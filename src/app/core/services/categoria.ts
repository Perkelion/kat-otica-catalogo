import { inject, Service } from '@angular/core';
import { Categoria } from '../models/categoria';
import { SupabaseService } from './supabase';

@Service()
export class CategoriaService {
  private readonly supabase = inject(SupabaseService).client;

  async listar(): Promise<Categoria[]> {
    const { data, error } = await this.supabase.from('categorias').select('*').order('nome');
    if (error) throw error;
    return data;
  }
}
