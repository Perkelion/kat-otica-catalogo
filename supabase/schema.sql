-- Categorias ---------------------------------------------------
create table if not exists public.categorias (
  id    bigint generated always as identity primary key,
  nome  text not null,
  slug  text not null unique
);

-- Produtos -----------------------------------------------------
create table if not exists public.produtos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  descricao     text,
  marca         text,
  categoria_id  bigint references public.categorias (id) on delete set null,
  preco         numeric(10, 2) check (preco >= 0),
  genero        text check (genero in ('masculino', 'feminino', 'unissex', 'infantil')),
  material      text,
  formato       text,
  cor           text,
  imagens       text[] not null default '{}',
  destaque      boolean not null default false,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now()
);

create index if not exists produtos_categoria_idx on public.produtos (categoria_id);

alter table public.categorias enable row level security;
alter table public.produtos   enable row level security;

create policy "Categorias visíveis para todos"
  on public.categorias for select using (true);

create policy "Ótica gerencia categorias"
  on public.categorias for all to authenticated using (true) with check (true);

create policy "Produtos ativos visíveis para todos"
  on public.produtos for select using (ativo or auth.role() = 'authenticated');

create policy "Ótica gerencia produtos"
  on public.produtos for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

create policy "Imagens visíveis para todos"
  on storage.objects for select using (bucket_id = 'produtos');

create policy "Ótica envia imagens"
  on storage.objects for insert to authenticated with check (bucket_id = 'produtos');

create policy "Ótica remove imagens"
  on storage.objects for delete to authenticated using (bucket_id = 'produtos');

-- Dados iniciais -----------------------------------------------
insert into public.categorias (nome, slug) values
  ('Armações de grau', 'armacoes-de-grau'),
  ('Óculos de sol',    'oculos-de-sol'),
  ('Infantil',         'infantil'),
  ('Acessórios',       'acessorios')
on conflict (slug) do nothing;
