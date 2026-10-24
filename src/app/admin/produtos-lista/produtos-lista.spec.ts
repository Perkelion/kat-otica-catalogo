import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProdutosLista } from './produtos-lista';

describe('ProdutosLista', () => {
  let component: ProdutosLista;
  let fixture: ComponentFixture<ProdutosLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutosLista],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProdutosLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
