# Deploy para VPS - camilaresende.com

## Resumo do projeto

- Este repositório é um app React/Vite com configuração de Cloudflare Worker/SSR.
- O código não usa banco de dados real: toda a persistência é feita no `localStorage` do navegador.
- Não há tabelas, nem backend de banco de dados no código atual.

## Observações importantes

- O app funciona com dados locais do usuário; se precisar de dados compartilhados entre múltiplos usuários, será necessário adicionar um backend e um banco de dados.
- O deploy em VPS pode ser feito em pasta isolada e porta livre para não afetar outros projetos.
- O domínio `camilaresende.com` deve apontar por DNS para o IP da VPS.

## Estrutura recomendada do deploy

- Pasta isolada: `/var/www/camilaresende` ou `/opt/camilaresende`
- Porta livre: por exemplo, `34567` ou outra porta não usada
- Serviço separado: use systemd para manter o processo isolado
- Proxy reverso: use Nginx para expor o domínio em `80/443`

## Passos básicos

1. Copiar/clone o código para a pasta dedicada:
   ```bash
   mkdir -p /var/www/camilaresende
   cd /var/www/camilaresende
   git clone <repo> .
   ```

2. Instalar Node.js e npm (Node 20+ recomendado):
   ```bash
   apt update
   apt install -y nodejs npm
   ```

3. Instalar dependências:
   ```bash
   npm ci
   ```

4. Gerar build:
   ```bash
   npm run build
   ```

5. Iniciar em porta local livre para teste:
   ```bash
   npm run preview -- --host 127.0.0.1 --port 34567
   ```

6. Configurar Nginx para proxy reverso do domínio para `127.0.0.1:34567`.

7. Ajustar DNS:
   - Registro A para `camilaresende.com` -> IP da VPS
   - Opcional: registro A para `www.camilaresende.com`

## Exemplo de Nginx

```nginx
server {
  listen 80;
  server_name camilaresende.com www.camilaresende.com;

  location / {
    proxy_pass http://127.0.0.1:34567;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Exemplo de systemd

```ini
[Unit]
Description=Camila Resende app
After=network.target

[Service]
WorkingDirectory=/var/www/camilaresende
ExecStart=/usr/bin/env npm run preview -- --host 127.0.0.1 --port 34567
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=34567

[Install]
WantedBy=multi-user.target
```

## Limitações atuais

- O build atual gera uma saída para `dist/server` e um worker de Cloudflare.
- O teste de `npm run preview` relatou falta de `dist/server/server.js`, portanto o projeto não está pronto para servir diretamente como um app Node/VPS sem ajustes.
- Não há `index.html` estático pronto para servir diretamente com Nginx.
- Se quiser manter tudo em VPS com `npm run preview`, precisará adaptar o build para produzir a entrada de servidor correta ou transformar o app em um SPA estático.
- Para um deploy mais limpo e estático, é preciso adaptar o projeto para gerar um SPA estático ou usar um runtime compatível com Cloudflare Workers.

## Uso do script local

Use o script `deploy.sh` para copiar o código do repositório para uma pasta isolada, instalar dependências e executar o build.

```bash
./deploy.sh /var/www/camilaresende 34567
```

O script não altera outros projetos nem usa portas fixas fora das fornecidas.
