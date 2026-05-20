# Estrutura de Páginas e Dependências - Climbe Investimentos

Este documento resume a arquitetura de páginas (rotas) e as principais bibliotecas que dão suporte ao frontend do sistema corporativo **Climbe Investimentos**, baseado nas diretrizes dos agentes do projeto.

---

## 🗺️ Estrutura de Páginas e Rotas

A plataforma utiliza a abordagem de **Feature-Based Architecture**, onde as páginas principais representam os domínios de negócio. Todas as rotas estão centralizadas no roteador principal (`src/app/router.tsx`).

### 1. Rotas Públicas / Autenticação
- **`/login`**: Tela de entrada no sistema. Suporta login padrão (Email/Senha) e integração com Google OAuth (autenticação JWT nas APIs).

### 2. Rotas Privadas Corporativas
> O acesso a estas telas é protegido pelo `AuthContext` (verificação de token) e `PermissionContext` (controle de acesso por Role, ex: CEO, CFO).

- **`/dashboard`**: Tela inicial pós-login. Apresenta o painel de controle com resumos e métricas da operação. *(Nota: a rota raiz `/` redireciona automaticamente para o dashboard).*
- **`/empresas`**: Módulo para gestão do portfólio de empresas e clientes geridos pela Climbe.
- **`/usuarios`**: Gestão de acessos internos, para definição de papéis e limites de acesso dos colaboradores.
- **`/propostas`**: Ambiente para criação, acompanhamento e tramitação de propostas comerciais.
- **`/documentos`**: Cofre digital de arquivos com infraestrutura preparada para integração com o Google Drive.
- **`/reunioes`**: Painel de agenda e marcações, integrado com a API do Google Calendar.
- **`/relatorios`**: Ferramenta de BI interno para extração de dados e análise operacional.
- **`/notificacoes`**: Central de avisos, alertas de sistema e log de atividades.

---

## 📦 Principais Dependências do Projeto (`package.json`)

O projeto utiliza uma stack tecnológica moderna, escalável e tipada, baseada nas seguintes bibliotecas:

### Core e UI
* **`react` & `react-dom` (v18)**: Biblioteca núcleo da interface.
* **`react-router-dom` (v6)**: Gerenciamento de roteamento (SPA) com suporte a layouts aninhados e proteção de rotas.
* **`tailwindcss` (v3.4)**: Framework utilitário CSS, base do Design System da Climbe.
* **`clsx` & `tailwind-merge`**: Utilitários para concatenação dinâmica e segura de classes do Tailwind (essencial para componentes reutilizáveis).
* **`lucide-react`**: Conjunto de ícones SVG limpos e corporativos.

### Requisições e Gerenciamento de Estado
* **`axios`**: Cliente HTTP robusto com suporte a interceptors, utilizado para gerenciar tokens JWT dinamicamente nas chamadas de API.
* **`@tanstack/react-query`**: Biblioteca de gerenciamento de *"Server State"*. Responsável por realizar fetch, cache inteligente, sincronização, tratamento de erros e loading states das entidades e listagens remotas sem inflar o estado local do React.

### Validação e Formulários
* **`react-hook-form`**: Controle de performance extrema para formulários corporativos extensos (ex: modais de propostas), evitando re-renders desnecessários a cada letra digitada.
* **`zod`**: Ferramenta de "schema validation" declarativa (*TypeScript-first*). Garante validação de tipos em tempo de execução para garantir segurança e formatação dos dados preenchidos.
* **`@hookform/resolvers`**: Adaptador que integra nativamente as regras de validação do Zod para dentro do React Hook Form.

### Ferramentas de Build, Organização e TS
* **`vite`**: Ferramenta de frontend (*bundler* e servidor de dev) construída visando extrema velocidade de *Hot Module Replacement (HMR)*.
* **`typescript` & `@types/*`**: Define checagens de tipos obrigatórias estabelecidas na arquitetura (sem uso do tipo `any`), proporcionando inteligência avançada no VS Code e reduzindo bugs.
* **`eslint` & `prettier`**: Ferramentas de Lint e formatação de código preestabelecidas para validar e assegurar convenções arquiteturais, forçando padronização entre os desenvolvedores do projeto.
