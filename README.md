# Kat Ótica — Catálogo Virtual

Catálogo virtual da Kat Ótica, desenvolvido com **Angular** e **Supabase** (banco de dados, autenticação e armazenamento das imagens).

## Funcionalidades

- Página inicial com categorias e produtos em destaque
- Catálogo com busca e filtros (categoria, gênero, material, formato e marca)
- Página de detalhes do produto com galeria de imagens e botão de contato pelo WhatsApp
- Páginas "Sobre" e "Contato"
- Área de gerenciamento (`/admin`) com login e CRUD de produtos e envio de imagens
- Layout responsivo (computador, tablet e smartphone)

## Estrutura

```
src/
├── environments/          # URL/chave do Supabase e dados de contato da ótica
└── app/
    ├── core/
    │   ├── models/        # Interfaces: Produto, Categoria, filtros
    │   ├── services/      # SupabaseService, ProdutoService, CategoriaService, AuthService
    │   └── guards/        # authGuard (protege a área /admin)
    ├── shared/components/ # header, footer, produto-card, filtros
    ├── layouts/           # public-layout (site) e admin-layout (gerenciamento)
    ├── pages/             # home, catalogo, produto-detalhe, sobre, contato, not-found
    └── admin/             # login, produtos-lista, produto-form
supabase/
└── schema.sql             # Tabelas, regras de segurança (RLS), bucket de imagens e categorias iniciais
```

## Configuração do Supabase

1. Crie um projeto em <https://supabase.com>.
2. Em **SQL Editor**, execute o conteúdo de `supabase/schema.sql`.
3. Em **Authentication → Users**, crie o usuário (e-mail e senha) que a ótica usará para entrar no `/admin`.
4. Em **Project Settings → API**, copie a *Project URL* e a *anon public key* para
   `src/environments/environment.ts` e `src/environments/environment.development.ts`.
5. Nos mesmos arquivos, preencha WhatsApp, telefone, e-mail, endereço e Instagram da ótica.

## Comandos

```bash
npm install      # instala as dependências
npm start        # servidor de desenvolvimento em http://localhost:4200
npm run build    # build de produção em dist/
npm test         # testes unitários (Vitest)
```

Para gerar novos componentes: `npx ng generate component caminho/nome`.
