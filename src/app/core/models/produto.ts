import { Categoria } from './categoria';
import { Marca } from './marca';

export interface ImagemProduto {
  id: string;
  produto_id: string;
  url: string;
  ordem: number;
  created_at: string;
}

export interface CaracteristicaProduto {
  id: string;
  produto_id: string;
  nome: string;
  valor: string;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  estoque: number;
  destaque: boolean;
  categoria_id: string | null;
  marca_id: string | null;
  created_at: string;
  categoria?: Categoria | null;
  marca?: Marca | null;
  imagens: ImagemProduto[];
  caracteristicas: CaracteristicaProduto[];
}

// campos que vão pro supabase quando for criado um produto
export type ProdutoInput = Pick<
  Produto,
  'nome' | 'descricao' | 'preco' | 'estoque' | 'destaque' | 'categoria_id' | 'marca_id'
>;

// produto com as imagens e características
export interface ProdutoCompletoInput {
  produto: ProdutoInput;
  imagens: string[];
  caracteristicas: { nome: string; valor: string }[];
}

export interface FiltrosProduto {
  busca?: string;
  categoriaId?: string;
  marcaId?: string;
  cor?: string;
  somenteDestaques?: boolean;
}
