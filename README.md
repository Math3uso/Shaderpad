# shaderpad

Um pequeno laboratório de fragment shaders no navegador.

O `shdrp-web` junta um editor de código com um canvas WebGL2 para testar shaders em tempo real. A ideia é simples: escrever GLSL, compilar, ver o resultado na tela e acompanhar os logs quando algo quebra. Ele funciona como um rascunho visual para estudar padrões, cores, movimento e experimentos gráficos sem precisar montar um pipeline inteiro de renderização.

## O que ele faz

- Abre um editor Monaco com um fragment shader inicial.
- Renderiza o resultado em um canvas WebGL2.
- Recompila o shader manualmente pelo botão **Compilar**.
- Mostra logs de sucesso, erro e mensagens de compilação.
- Expõe uniforms básicos inspirados no fluxo de shader playgrounds:
  - `iResolution`: resolução atual do canvas como `vec3`.
  - `iTime`: tempo em segundos desde o início da renderização.

O vertex shader desenha dois triângulos cobrindo a tela inteira. A parte interessante fica no fragment shader: cada pixel é calculado pelo código editado, então dá para criar gradientes, animações, distorções, ruídos e qualquer outro experimento que caiba em GLSL ES 3.00.


## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Monaco Editor
- WebGL2

## Como rodar

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Depois abra o endereço exibido no terminal, normalmente:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
```

Roda a aplicação em modo de desenvolvimento.

```bash
npm run build
```

Gera a build de produção.

```bash
npm run start
```

Serve a build de produção gerada pelo Next.js.

```bash
npm run lint
```

Executa o ESLint.

## Escrevendo shaders

O fragment shader precisa usar GLSL ES 3.00:

```glsl
#version 300 es
precision highp float;

out vec4 FragColor;

uniform vec3 iResolution;
uniform float iTime;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  FragColor = vec4(uv.x, abs(sin(iTime)), uv.y, 1.0);
}
```

Alguns pontos importantes:

- O shader deve declarar `out vec4 FragColor;`.
- `gl_FragCoord.xy` traz a posição do pixel atual.
- `iResolution.xy` ajuda a normalizar coordenadas para o intervalo `0.0` a `1.0`.
- `iTime` permite animar cores, formas e movimentos ao longo do tempo.

Quando a compilação falha, o programa antigo continua renderizando e o erro aparece no painel de logs.

## Estrutura principal

```text
src/app/page.tsx                 Interface principal: editor, painel inferior e canvas
src/components/context-gl.tsx    Inicialização do WebGL2, render loop e recompilação
src/context/gl-context-code.tsx  Estado compartilhado de compilação e logs
src/utils/shaders.ts             Vertex shader e fragment shader padrão
src/app/globals.css              Estilos globais e Tailwind
```

## Ideias para evoluir

- Salvar presets de shaders.
- Adicionar captura de imagem do canvas.
- Incluir mais uniforms, como mouse, frame count e delta time.
- Criar uma galeria local de experimentos.
- Melhorar o mapeamento de erros para destacar linhas no editor.

## Requisitos do navegador

É necessário um navegador com suporte a WebGL2. Se o contexto WebGL2 não estiver disponível, a aplicação registra o problema no painel de logs.
