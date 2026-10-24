import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FiltrosProduto, Produto, ProdutoInput } from '../models/produto';
import { SupabaseService } from './supabase';

@Service()
export class ProdutoService {
  private readonly supabase = inject(SupabaseService).client;

  async listar(filtros: FiltrosProduto = {}): Promise<Produto[]> {
    const join = filtros.categoriaSlug
      ? 'categoria:categorias!inner(*)'
      : 'categoria:categorias(*)';
    let query = this.supabase.from('produtos').select(`*, ${join}`);

    if (!filtros.incluirInativos) query = query.eq('ativo', true);
    if (filtros.categoriaSlug) query = query.eq('categoria.slug', filtros.categoriaSlug);
    if (filtros.somenteDestaques) query = query.eq('destaque', true);
    if (filtros.genero) query = query.eq('genero', filtros.genero);
    if (filtros.material) query = query.eq('material', filtros.material);
    if (filtros.formato) query = query.eq('formato', filtros.formato);
    if (filtros.marca) query = query.ilike('marca', `%${filtros.marca}%`);

    const busca = filtros.busca?.replace(/[,()%]/g, ' ').trim();
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,marca.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }

    const { data, error } = await query.order('criado_em', { ascending: false });
    if (error) throw error;
    return data as Produto[];
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const { data, error } = await this.supabase
      .from('produtos')
      .select('*, categoria:categorias(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Produto | null;
  }

  async criar(produto: ProdutoInput): Promise<Produto> {
    const { data, error } = await this.supabase.from('produtos').insert(produto).select().single();
    if (error) throw error;
    return data as Produto;
  }

  async atualizar(id: string, produto: Partial<ProdutoInput>): Promise<Produto> {
    const { data, error } = await this.supabase
      .from('produtos')
      .update(produto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Produto;
  }

  async remover(id: string): Promise<void> {
    const { error } = await this.supabase.from('produtos').delete().eq('id', id);
    if (error) throw error;
  }

  async enviarImagem(arquivo: File): Promise<string> {
    const extensao = arquivo.name.split('.').pop();
    const caminho = `${crypto.randomUUID()}.${extensao}`;
    const storage = this.supabase.storage.from(environment.storageBucket);

    const { error } = await storage.upload(caminho, arquivo);
    if (error) throw error;
    return storage.getPublicUrl(caminho).data.publicUrl;
  }
}
