# Kat Ótica — Catálogo Virtual

Catálogo virtual da Kat Ótica, desenvolvido com **Angular** e **Supabase** (banco de dados, autenticação e armazenamento das imagens).

## Funcionalidades

- Página inicial com categorias e produtos em destaque
- Catálogo com busca e filtros (categoria, marca e cor)
- Página de detalhes do produto com galeria de imagens, características, disponibilidade em estoque e botão de contato pelo WhatsApp
- Página "Sobre" com os contatos da ótica (WhatsApp, telefone, e-mail e endereço)
- Área de gerenciamento (`/admin`) com login, CRUD de produtos (imagens e características) e cadastro de marcas
- Layout responsivo (computador, tablet e smartphone)

## Estrutura

```
src/
├── environments/          # environment.example.ts: modelo com URL/chave do Supabase e contatos da ótica
└── app/
    ├── core/
    │   ├── models/        # Interfaces: Produto, Categoria, Marca, imagens, características, filtros
    │   ├── services/      # SupabaseService, ProdutoService, CategoriaService, MarcaService, AuthService
    │   └── guards/        # authGuard (protege a área /admin)
    ├── shared/components/ # header, footer, produto-card, icone
    ├── layouts/           # public-layout (site) e admin-layout (gerenciamento)
    ├── pages/             # home, catalogo (com o componente de filtros), produto-detalhe, sobre, not-found
    └── admin/             # login, produtos-lista, produto-form, marcas
supabase/
└── schema.sql             # Tabelas (categorias, marcas, produtos, imagens_produto, caracteristicas_produto),
                           # regras de segurança (RLS), bucket de imagens e categorias iniciais
```

## Comandos

```bash
npm install      # instala as dependências
npm start        # servidor de desenvolvimento em http://localhost:4200
npm run build    # build de produção em dist/
npm test         # testes unitários (Vitest)
```

Para gerar novos componentes: `npx ng generate component caminho/nome`.
