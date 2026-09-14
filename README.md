# Portfólio do projeto de estágio

Esta pasta contém um site estático independente, preparado para publicação no GitHub Pages. Ela não faz parte do projeto Django.

## O que precisa ser preenchido

Abra `assets/js/config.js` e preencha apenas os valores entre aspas:

- links públicos dos documentos de requisitos e planejamento;
- links das especificações dos casos de uso;
- links públicos dos documentos de diagramas;
- link público do relatório de estágio em DOCX;
- link ou ID do vídeo do YouTube;
- matrícula do acadêmico;
- nome do professor orientador.

Os links precisam começar com `https://` e estar liberados para acesso público. O vídeo pode usar um endereço comum do YouTube, um endereço curto `youtu.be` ou somente o identificador de 11 caracteres.

## Como visualizar

Abra `index.html` no navegador. Para conferir exatamente como ficará publicado, também é possível servir esta pasta com um servidor local simples.

## Como publicar no GitHub Pages

1. Crie um repositório separado no GitHub para o portfólio.
2. Envie o conteúdo desta pasta para a raiz da branch principal do novo repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch principal e a pasta **/(root)**.
6. Salve e aguarde o endereço público ser exibido.

O GitHub Pages publicará somente o portfólio. A aplicação Django e o banco de dados permanecem separados e precisam de uma hospedagem própria para funcionar online.
