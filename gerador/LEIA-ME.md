# Gerador de sites · Site Express

Um arquivo por cliente vira um site completo. Serve para a **prévia grátis** (antes da venda) e para o **site final** (depois do pagamento), com o mesmo arquivo.

Segmentos prontos: `clinica-estetica`, `restaurante`, `oficina`. Cada segmento já traz textos, serviços, perguntas frequentes e ilustrações. O arquivo do cliente só precisa dizer o que muda.

## Fazer uma prévia em 5 minutos

1. Copie `gerador/clientes/_modelo-cliente.json` para `gerador/clientes/nome-do-cliente.json`.
2. Troque nome, cidade, endereço, horários, WhatsApp e cores (pegue as cores do Instagram do cliente).
3. Apague o que não for usar. Tudo que você não preencher vem do segmento.
4. No terminal (na pasta do repositório `modelos`):

   ```
   node gerador/gerar.js gerador/clientes/nome-do-cliente.json
   ```

5. O site sai em `previas/<nome-cidade>/`. Abra o `index.html` no navegador para conferir.
6. Publique (commit + push). O link fica `https://vinriibeiro.github.io/modelos/previas/<nome-cidade>/`.

Para gerar tudo de uma vez: `node gerador/gerar.js --todos` (arquivos que começam com `_` são ignorados).

## Os três modos

| `modo` | Para quê | Botões de WhatsApp | Sai em |
|---|---|---|---|
| `previa` | Mandar para o lead antes da venda | Abrem um aviso "esta é uma prévia" com o botão **Quero este site** (vai para o WhatsApp da Site Express) | `previas/` |
| `modelo` | Catálogo, empresa fictícia | Igual à prévia, com o texto "quero um site assim" | `modelos/` |
| `final` | Site do cliente pago | Abrem o WhatsApp **do cliente** com mensagem pronta | `sites/` |

Depois da venda: troque `"modo": "previa"` por `"modo": "final"`, confira o `whatsapp` e gere de novo. Em `final` o WhatsApp é obrigatório (formato `55` + DDD + número, só dígitos).

## Campos do arquivo do cliente

| Campo | Exemplo | Observação |
|---|---|---|
| `segmento` | `"oficina"` | obrigatório |
| `modo` | `"previa"` | `previa`, `modelo` ou `final` |
| `nome` | `"Studio Bela Pele"` | obrigatório |
| `artigo` | `"da"` ou `"do"` | "Vi o site **da** Studio Bela Pele" / "**do** Torque Auto Center" |
| `complemento` | `"Estética Facial"` | linha pequena abaixo do nome |
| `whatsapp` | `"5514999998888"` | obrigatório no modo `final` |
| `instagram` | `"@studiobelapele"` | aparece no rodapé |
| `cores.fundo`, `cores.destaque` | `"#0F1F1C"`, `"#5FB49C"` | o resto da paleta é calculado; o texto se ajusta para continuar legível |
| `endereco` | `{ "rua", "bairro", "cidade" }` | `cidade` também entra no título "Estética e beleza em ..." |
| `horarios` | `[["Sábado", "9h às 13h"]]` | lista de dias e horários |
| `textos.titulo` | `"Seu carro em dia, com *orçamento antes*."` | o trecho entre `*` fica na cor de destaque |
| `servicos` | `[{ "icone", "nome", "descricao", "preco" }]` | `categoria` opcional (ex.: "Lanches") |
| `fotos.capa` | `"fotos/cliente/capa.jpg"` | sem foto, usa a ilustração do segmento |
| `galeria` | `[{ "titulo", "detalhe", "foto" }]` | até 6; itens sem `foto` usam ilustração |
| `logo` | `"fotos/cliente/logo.png"` | sem logo, usa as iniciais do nome |
| `faq`, `diferenciais`, `passos` | ver `segmentos/*.json` | substituem a lista inteira do segmento |
| `slug` | `"studio-bela-pele-bauru"` | opcional; o padrão é nome + cidade |
| `urlPublica` | `"https://.../previas/studio-bela-pele-bauru/"` | opcional; ativa a imagem de compartilhamento no WhatsApp |

Caminhos de foto são relativos ao arquivo do cliente. Dica: crie `gerador/clientes/fotos/<cliente>/` e coloque lá as fotos do Instagram dele (com autorização).

Ícones disponíveis: rode o gerador com um ícone errado e ele lista todos.

## Capturas e imagem de compartilhamento

```
node gerador/capturar.js previas/<nome-cidade>
```

Gera capturas de computador e celular e o `arte.png` (1200x630) que aparece quando o link é colado no WhatsApp. Precisa do Playwright (`npm i -g playwright` e `npx playwright install chromium`, uma vez).

## Novo segmento

Copie um arquivo de `segmentos/`, ajuste os textos e crie as ilustrações em `lib/ilustracoes.js` (função do segmento + registro em `SEGMENTOS`).
