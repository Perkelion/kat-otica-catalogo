import { FORMATO_PRECO, formatarPreco, lerPreco } from './preco';

describe('preço', () => {
  describe('FORMATO_PRECO', () => {
    it.each(['159,99', '159.99', '1.599,90', '1599', '0,5', '12.000', '12.000,50'])(
      'aceita "%s"',
      (texto) => expect(FORMATO_PRECO.test(texto)).toBe(true),
    );

    it.each(['abc', '-5', '159,999', '1,599.90', '12,', ''])('rejeita "%s"', (texto) =>
      expect(FORMATO_PRECO.test(texto)).toBe(false),
    );
  });

  describe('lerPreco', () => {
    it.each([
      ['159,99', 159.99],
      ['159.99', 159.99],
      ['1.599,90', 1599.9],
      ['1599', 1599],
      ['0,5', 0.5],
      ['12.000', 12000],
      ['12.000,50', 12000.5],
    ])('converte "%s" em %d', (texto, esperado) => expect(lerPreco(texto)).toBe(esperado));
  });

  describe('formatarPreco', () => {
    it('usa vírgula e sempre 2 casas decimais', () => {
      expect(formatarPreco(159.9)).toBe('159,90');
      expect(formatarPreco(1599)).toBe('1599,00');
    });

    it('devolve texto vazio quando não há preço', () => {
      expect(formatarPreco(null)).toBe('');
    });

    it('volta ao mesmo número quando lido de novo', () => {
      expect(lerPreco(formatarPreco(799.9))).toBe(799.9);
    });
  });
});
