# Schema de implementação — Estoque Infraspeak PWA

## Identidade obrigatória
A interface deve ser inspirada no próprio site https://infraspeak.com/pt-br, nunca no KAS One. Aplicar layout claro, azul, hierarquia tipográfica limpa e responsividade. Não copiar marcas oficiais sem autorização.

## Função única
Abrir https://new.infraspeak.com/stock/warehouses por ação explícita do usuário. Não implementar login próprio, API de estoque, dashboard ou armazenamento de credenciais.

## Requisitos
PWA instalável conforme suporte do navegador, cache apenas local, acessibilidade de teclado, adaptação mobile e desktop, links seguros, hospedagem HTTPS e repositório privado.

## Critérios de aceite
O botão abre o endereço correto; a tela inicial não pede credenciais; o manifesto e o service worker respondem; a interface funciona em telas estreitas; o deploy Vercel retorna HTTP 200.
