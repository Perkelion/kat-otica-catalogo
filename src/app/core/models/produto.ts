import { Categoria } from './categoria';

export type Genero = 'masculino' | 'feminino' | 'unissex' | 'infantil';

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  marca: string | null;
  categoria_id: number | null;
  categoria?: Categoria | null;
  preco: number | null;
  genero: Genero | null;
  material: string | null;
  formato: string | null;
  cor: string | null;
  imagens: string[];
  destaque: boolean;
  ativo: boolean;
  criado_em: string;
}

export type ProdutoInput = Omit<Produto, 'id' | 'criado_em' | 'categoria'>;

export interface FiltrosProduto {
  busca?: string;
  categoriaSlug?: string;
  marca?: string;
  genero?: Genero | '';
  material?: string;
  formato?: string;
  somenteDestaques?: boolean;
  incluirInativos?: boolean;
}
