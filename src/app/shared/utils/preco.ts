// regex do preço
export const FORMATO_PRECO = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$|^\d+(\.\d{1,2})?$/;

// converte de string pra um numero
export function lerPreco(texto: string): number {
  const brasileiro = texto.includes(',') || /\.\d{3}/.test(texto);
  return Number(brasileiro ? texto.replace(/\./g, '').replace(',', '.') : texto);
}

// conversão do ponto decimal
export function formatarPreco(preco: number | null): string {
  return preco === null ? '' : preco.toFixed(2).replace('.', ',');
}
