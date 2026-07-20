# Raio-X do Instagram · Ana Tex ✦

Porta de entrada do funil da Sala Secreta: a especialista envia o print do próprio perfil do
Instagram, a Inteligência Artificial analisa pelos critérios da Ana e devolve um relatório
personalizado — diagnóstico em 4 eixos, bio pronta pra copiar, virada de categoria, 3 ideias de
conteúdo e o convite pra Sala Secreta.

## Rodar agora (modo demonstração)

```bash
npm install
npm run dev
```

Sem nenhuma configuração, o app roda em **modo demonstração**: nada de backend, nada de gasto com
análise. Tudo funciona com dados de exemplo:

| Página | O que testar |
|---|---|
| `/` | Landing completa |
| `/raio-x` | Formulário + tela "analisando…" (gera relatório de exemplo com o nome digitado) |
| `/relatorio/exemplo` | O relatório completo da persona de exemplo (Dra. Camila, nutricionista) |
| `/admin` | Painel com leads de exemplo — senha: `salasecreta` |

## Ligar o modo real (Supabase + Claude)

1. **Banco**: cole `supabase/migrations/0001_init.sql` no SQL Editor do seu projeto Supabase
   (cria tabelas, bucket `prints`, RLS e funções).
2. **Edge Functions**: publique as duas funções:
   ```bash
   supabase functions deploy analisar-raio-x
   supabase functions deploy admin-api
   ```
3. **Secrets**:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   supabase secrets set ADMIN_SENHA=uma-senha-forte
   ```
4. **Frontend**: copie `.env.example` pra `.env` e preencha `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY`. Rode `npm run build` e publique a pasta `dist` onde preferir
   (Vercel, Netlify, Lovable…). Com as variáveis preenchidas, o modo demonstração desliga sozinho.

## Como funciona por dentro

- **Análise**: uma chamada só ao Claude (modelo `claude-haiku-4-5`, com visão) por raio-x —
  custo baixo por análise. A saída é validada por esquema (structured outputs), então o relatório
  sempre chega no formato certo. Print ilegível → resposta carinhosa pedindo reenvio.
- **Privacidade**: bucket de prints privado; relatório acessível só pelo link com uuid
  não-sequencial (sem listagem); nenhuma senha do Instagram é pedida; nada de raspagem.
- **Admin**: todas as operações passam pela Edge Function `admin-api` com senha verificada no
  servidor (secret `ADMIN_SENHA`) — a senha nunca vai no bundle do site.
- **Funil**: cliques no botão da Sala Secreta e no "receber no WhatsApp" viram eventos que
  alimentam o mini-dashboard.

## Regras do relatório (codificadas no prompt)

- Tom sempre acolhedor — reconhece o ativo primeiro; humilhar é proibido.
- "Inteligência Artificial" sempre por extenso, nunca "IA".
- Analisa só o visível no print — nunca inventa seguidores ou engajamento.
- Parte 2 entrega direção real, mas o COMO profundo fica pra Sala Secreta e pra mentoria.
