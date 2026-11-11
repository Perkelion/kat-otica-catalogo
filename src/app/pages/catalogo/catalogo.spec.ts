import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FiltrosProduto, Produto } from '../../core/models/produto';
import { CategoriaService } from '../../core/services/categoria';
import { MarcaService } from '../../core/services/marca';
import { ProdutoService } from '../../core/services/produto';
import { produtoFake } from '../../../testing/produto-fake';
import { Catalogo } from './catalogo';

const PRODUTOS: Produto[] = Array.from({ length: 30 }, (_, i) =>
  produtoFake({ nome: `Produto ${i + 1}` }),
);

describe('Catalogo', () => {
  let component: Catalogo;
  let fixture: ComponentFixture<Catalogo>;
  let listar: ReturnType<typeof vi.fn>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tela = () => component as unknown as Record<string, any>;

  beforeEach(async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    listar = vi.fn((filtros: FiltrosProduto) =>
      Promise.resolve(filtros.busca ? PRODUTOS.slice(0, 3) : PRODUTOS),
    );

    await TestBed.configureTestingModule({
      imports: [Catalogo],
      providers: [
        provideRouter([]),
        { provide: ProdutoService, useValue: { listar } },
        { provide: CategoriaService, useValue: { listar: () => Promise.resolve([]) } },
        { provide: MarcaService, useValue: { listar: () => Promise.resolve([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Catalogo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('divide os produtos em páginas de 12', () => {
    expect(tela()['totalPaginas']()).toBe(3);
    expect(tela()['paginas']()).toEqual([1, 2, 3]);
    expect(tela()['produtosDaPagina']()).toHaveLength(12);
    expect(tela()['produtosDaPagina']()[0].nome).toBe('Produto 1');
  });

  it('mostra o restante na última página', () => {
    tela()['irParaPagina'](3);
    expect(tela()['pagina']()).toBe(3);
    const nomes = (tela()['produtosDaPagina']() as Produto[]).map((p) => p.nome);
    expect(nomes).toEqual(PRODUTOS.slice(24).map((p) => p.nome));
  });

  it('ignora páginas fora do intervalo', () => {
    tela()['irParaPagina'](0);
    tela()['irParaPagina'](4);
    expect(tela()['pagina']()).toBe(1);
  });

  it('volta ao topo da tela ao trocar de página', () => {
    tela()['irParaPagina'](2);
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('volta para a página 1 quando os filtros mudam', async () => {
    tela()['irParaPagina'](3);
    tela()['filtros'].set({ busca: 'produto' });
    await fixture.whenStable();

    expect(tela()['pagina']()).toBe(1);
    expect(tela()['totalPaginas']()).toBe(1);
    expect(tela()['produtosDaPagina']()).toHaveLength(3);
  });

  it('tem sempre pelo menos 1 página, mesmo sem produtos', async () => {
    listar.mockResolvedValue([]);
    tela()['filtros'].set({ busca: 'nada' });
    await fixture.whenStable();

    expect(tela()['totalPaginas']()).toBe(1);
    expect(tela()['produtosDaPagina']()).toEqual([]);
  });
});
