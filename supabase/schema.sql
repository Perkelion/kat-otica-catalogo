-- Limpeza  ------------
drop table if exists public.caracteristicas_produto cascade;
drop table if exists public.imagens_produto cascade;
drop table if exists public.produtos cascade;
drop table if exists public.marcas cascade;
drop table if exists public.categorias cascade;

drop policy if exists "Imagens visíveis para todos" on storage.objects;
drop policy if exists "Ótica lista imagens" on storage.objects;
drop policy if exists "Ótica envia imagens" on storage.objects;
drop policy if exists "Ótica remove imagens" on storage.objects;

-- Categorias ---------------------------------------------------
create table public.categorias (
  id          uuid primary key default gen_random_uuid(),
  nome        varchar(100) not null unique,
  created_at  timestamptz not null default now()
);

-- Marcas -------------------------------------------------------
create table public.marcas (
  id          uuid primary key default gen_random_uuid(),
  nome        varchar(100) not null unique,
  logo_url    varchar(255),
  created_at  timestamptz not null default now()
);

-- Produtos -----------------------------------------------------
create table public.produtos (
  id            uuid primary key default gen_random_uuid(),
  nome          varchar(100) not null,
  descricao     text constraint produtos_descricao_tamanho check (char_length(descricao) <= 1000),
  preco         decimal(10, 2) check (preco >= 0),
  estoque       integer not null default 0 check (estoque >= 0),
  destaque      boolean not null default false,
  categoria_id  uuid references public.categorias (id) on delete set null,
  marca_id      uuid references public.marcas (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index produtos_categoria_idx on public.produtos (categoria_id);
create index produtos_marca_idx on public.produtos (marca_id);

create table public.imagens_produto (
  id          uuid primary key default gen_random_uuid(),
  produto_id  uuid not null references public.produtos (id) on delete cascade,
  url         varchar(255) not null,
  ordem       integer not null default 0,
  created_at  timestamptz not null default now()
);

create index imagens_produto_produto_idx on public.imagens_produto (produto_id);

create table public.caracteristicas_produto (
  id          uuid primary key default gen_random_uuid(),
  produto_id  uuid not null references public.produtos (id) on delete cascade,
  nome        varchar(100) not null,
  valor       varchar(100) not null,
  created_at  timestamptz not null default now()
);

create index caracteristicas_produto_produto_idx on public.caracteristicas_produto (produto_id);

-- Visitantes só leem; usuários autenticados podem gerenciar.
alter table public.categorias              enable row level security;
alter table public.marcas                  enable row level security;
alter table public.produtos                enable row level security;
alter table public.imagens_produto         enable row level security;
alter table public.caracteristicas_produto enable row level security;

create policy "Leitura pública" on public.categorias for select using (true);
create policy "Ótica gerencia" on public.categorias for all to authenticated using (true) with check (true);

create policy "Leitura pública" on public.marcas for select using (true);
create policy "Ótica gerencia" on public.marcas for all to authenticated using (true) with check (true);

create policy "Leitura pública" on public.produtos for select using (true);
create policy "Ótica gerencia" on public.produtos for all to authenticated using (true) with check (true);

create policy "Leitura pública" on public.imagens_produto for select using (true);
create policy "Ótica gerencia" on public.imagens_produto for all to authenticated using (true) with check (true);

create policy "Leitura pública" on public.caracteristicas_produto for select using (true);
create policy "Ótica gerencia" on public.caracteristicas_produto for all to authenticated using (true) with check (true);

-- Storage--
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do nothing;

-- bucket é público então as imagens já abrem pela URL sem policy de leitura.
-- O SELECT só vale para os arquivos do próprio usuário.
create policy "Ótica lista imagens"
  on storage.objects for select to authenticated
  using (bucket_id = 'produtos' and owner_id = (select auth.uid())::text);

create policy "Ótica envia imagens"
  on storage.objects for insert to authenticated with check (bucket_id = 'produtos');

create policy "Ótica remove imagens"
  on storage.objects for delete to authenticated using (bucket_id = 'produtos');

-- Dados iniciais -----------------------------------------------
insert into public.categorias (nome) values
  ('Óculos de grau'),
  ('Óculos de sol'),
  ('Armações'),
  ('Lentes'),
  ('Acessórios');
