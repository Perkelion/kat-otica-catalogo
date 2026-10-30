export interface Marca {
  id: string;
  nome: string;
  logo_url: string | null;
  created_at: string;
}

// campos que vão pro supabase quando for criado uma marca
export type MarcaInput = Pick<Marca, 'nome' | 'logo_url'>;
