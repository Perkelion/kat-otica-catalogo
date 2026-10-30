import { Service } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Service()
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
  );

  //envia imgs pro bucket e pega a url delas
  async enviarImagem(arquivo: File): Promise<string> {
    const extensao = arquivo.name.split('.').pop();
    const caminho = `${crypto.randomUUID()}.${extensao}`;
    const storage = this.client.storage.from(environment.storageBucket);

    const { error } = await storage.upload(caminho, arquivo);
    if (error) throw error;
    return storage.getPublicUrl(caminho).data.publicUrl;
  }

  //remove imgs do bucket
  async removerImagens(urls: string[]): Promise<void> {
    const storage = this.client.storage.from(environment.storageBucket);
    const prefixo = storage.getPublicUrl('').data.publicUrl;
    const caminhos = urls
      .filter((url) => url.startsWith(prefixo))
      .map((url) => decodeURIComponent(url.slice(prefixo.length)));
    if (!caminhos.length) return;

    const { error } = await storage.remove(caminhos);
    if (error) console.error('Erro ao apagar imagens do Storage', error);
  }
}
