FROM node:lts-alpine
ENV NODE_ENV=production

RUN npm install -g pnpm

WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN pnpm install --prod

COPY . .

CMD ["node", "index.js"]
