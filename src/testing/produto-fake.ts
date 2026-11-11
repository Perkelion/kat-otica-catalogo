import { Produto } from '../app/core/models/produto';

export function produtoFake(campos: Partial<Produto> = {}): Produto {
  return {
    id: crypto.randomUUID(),
    nome: 'Produto',
    descricao: null,
    preco: 100,
    estoque: 1,
    destaque: false,
    categoria_id: null,
    marca_id: null,
    created_at: '2026-01-01T00:00:00Z',
    categoria: null,
    marca: null,
    imagens: [],
    caracteristicas: [],
    ...campos,
  };
}
