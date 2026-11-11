import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Produto } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { MarcaService } from '../../core/services/marca';
import { ProdutoService } from '../../core/services/produto';
import { produtoFake } from '../../../testing/produto-fake';
import { ProdutosLista } from './produtos-lista';

const PRODUTOS: Produto[] = [
  produtoFake({
    nome: 'Óculos Aviador',
    categoria_id: 'sol',
    marca_id: 'rayban',
    marca: { id: 'rayban', nome: 'Ray-Ban', logo_url: null, created_at: '' },
    destaque: true,
    estoque: 5,
  }),
  produtoFake({ nome: 'Armação Gatinho', categoria_id: 'grau', marca_id: 'vogue', estoque: 0 }),
  produtoFake({
    nome: 'Estojo',
    descricao: 'Estojo rígido com flanela',
    categoria_id: 'acessorios',
    estoque: 10,
  }),
];

describe('ProdutosLista', () => {
  let component: ProdutosLista;
  let fixture: ComponentFixture<ProdutosLista>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tela = () => component as unknown as Record<string, any>;
  const nomesFiltrados = () => (tela()['produtosFiltrados']() as Produto[]).map((p) => p.nome);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosLista],
      providers: [
        provideRouter([]),
        { provide: ProdutoService, useValue: { listar: () => Promise.resolve(PRODUTOS) } },
        { provide: CategoriaService, useValue: { listar: () => Promise.resolve([]) } },
        { provide: MarcaService, useValue: { listar: () => Promise.resolve([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdutosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra todos os produtos sem filtro', () => {
    expect(nomesFiltrados()).toHaveLength(3);
    expect(tela()['temFiltro']()).toBe(false);
  });

  it('busca ignorando acentos e maiúsculas', () => {
    tela()['busca'].set('OCULOS');
    expect(nomesFiltrados()).toEqual(['Óculos Aviador']);
  });

  it('busca também na descrição e na marca', () => {
    tela()['busca'].set('flanela');
    expect(nomesFiltrados()).toEqual(['Estojo']);

    tela()['busca'].set('ray-ban');
    expect(nomesFiltrados()).toEqual(['Óculos Aviador']);
  });

  it('filtra por categoria e por marca', () => {
    tela()['categoriaId'].set('grau');
    expect(nomesFiltrados()).toEqual(['Armação Gatinho']);

    tela()['categoriaId'].set('');
    tela()['marcaId'].set('rayban');
    expect(nomesFiltrados()).toEqual(['Óculos Aviador']);
  });

  it('filtra por destaque', () => {
    tela()['destaque'].set('sim');
    expect(nomesFiltrados()).toEqual(['Óculos Aviador']);

    tela()['destaque'].set('nao');
    expect(nomesFiltrados()).toEqual(['Armação Gatinho', 'Estojo']);
  });

  it('filtra por estoque', () => {
    tela()['estoque'].set('sem');
    expect(nomesFiltrados()).toEqual(['Armação Gatinho']);

    tela()['estoque'].set('com');
    expect(nomesFiltrados()).toEqual(['Óculos Aviador', 'Estojo']);
  });

  it('combina filtros e limpa todos de uma vez', () => {
    tela()['estoque'].set('com');
    tela()['busca'].set('estojo');
    expect(nomesFiltrados()).toEqual(['Estojo']);
    expect(tela()['temFiltro']()).toBe(true);

    tela()['limparFiltros']();
    expect(nomesFiltrados()).toHaveLength(3);
    expect(tela()['temFiltro']()).toBe(false);
  });
});
