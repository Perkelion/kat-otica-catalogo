import { computed, inject, Service, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

@Service()
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly sessao = signal<Session | null>(null);

  readonly usuario = computed(() => this.sessao()?.user ?? null);
  readonly logado = computed(() => this.sessao() !== null);

  constructor() {
    this.supabase.auth.onAuthStateChange((_evento, sessao) => this.sessao.set(sessao));
  }

  async obterSessao(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    this.sessao.set(data.session);
    return data.session;
  }

  async entrar(email: string, senha: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  }

  async sair(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
