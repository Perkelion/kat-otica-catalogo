import { inject, Service } from '@angular/core';
import { FiltrosProduto, Produto, ProdutoCompletoInput } from '../models/produto';
import { SupabaseService } from './supabase';

const RELACOES = `
  categoria:categorias(*),
  marca:marcas(*),
  imagens:imagens_produto(*)`;

@Service()
export class ProdutoService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly supabase = this.supabaseService.client;

  async listar(filtros: FiltrosProduto = {}): Promise<Produto[]> {
    const caracteristicas = filtros.cor
      ? 'caracteristicas:caracteristicas_produto!inner(*)'
      : 'caracteristicas:caracteristicas_produto(*)';
    let query = this.supabase.from('produtos').select(`*, ${RELACOES}, ${caracteristicas}`);

    if (filtros.categoriaId) query = query.eq('categoria_id', filtros.categoriaId);
    if (filtros.marcaId) query = query.eq('marca_id', filtros.marcaId);
    if (filtros.somenteDestaques) query = query.eq('destaque', true);

    const cor = filtros.cor?.replace(/[,()%]/g, ' ').trim();
    if (cor) {
      query = query.ilike('caracteristicas.nome', 'cor').ilike('caracteristicas.valor', `%${cor}%`);
    }

    const busca = filtros.busca?.replace(/[,()%]/g, ' ').trim();
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Produto[]).map(ordenarImagens);
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const { data, error } = await this.supabase
      .from('produtos')
      .select(`*, ${RELACOES}, caracteristicas:caracteristicas_produto(*)`)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? ordenarImagens(data as Produto) : null;
  }

  // Cadastra ou atualiza o produto
  async salvar(id: string | undefined, dados: ProdutoCompletoInput): Promise<string> {
    const imagensAntigas = id ? await this.urlsDasImagens(id) : [];

    const { data, error } = id
      ? await this.supabase
          .from('produtos')
          .update(dados.produto)
          .eq('id', id)
          .select('id')
          .single()
      : await this.supabase.from('produtos').insert(dados.produto).select('id').single();
    if (error) throw error;
    const produtoId: string = data.id;

    await this.substituir(
      'imagens_produto',
      produtoId,
      dados.imagens.map((url, ordem) => ({ produto_id: produtoId, url, ordem })),
    );
    await this.substituir(
      'caracteristicas_produto',
      produtoId,
      dados.caracteristicas.map((c) => ({ produto_id: produtoId, ...c })),
    );

    await this.supabaseService.removerImagens(
      imagensAntigas.filter((url) => !dados.imagens.includes(url)),
    );
    return produtoId;
  }

  async remover(id: string): Promise<void> {
    const imagens = await this.urlsDasImagens(id);
    const { error } = await this.supabase.from('produtos').delete().eq('id', id);
    if (error) throw error;
    await this.supabaseService.removerImagens(imagens);
  }

  enviarImagem(arquivo: File): Promise<string> {
    return this.supabaseService.enviarImagem(arquivo);
  }

  //Apaga do storage as imgs que não foram usadas
  descartarImagens(urls: string[]): Promise<void> {
    return this.supabaseService.removerImagens(urls);
  }

  private async urlsDasImagens(produtoId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('imagens_produto')
      .select('url')
      .eq('produto_id', produtoId);
    if (error) throw error;
    return data.map((i) => i.url as string);
  }

  private async substituir(tabela: string, produtoId: string, linhas: object[]) {
    const { error } = await this.supabase.from(tabela).delete().eq('produto_id', produtoId);
    if (error) throw error;
    if (!linhas.length) return;
    const { error: erroInsert } = await this.supabase.from(tabela).insert(linhas);
    if (erroInsert) throw erroInsert;
  }
}

function ordenarImagens(produto: Produto): Produto {
  return { ...produto, imagens: [...(produto.imagens ?? [])].sort((a, b) => a.ordem - b.ordem) };
}
