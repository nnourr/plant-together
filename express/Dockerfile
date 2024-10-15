FROM node:slim as builder
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=3000
ENV KEY_PATH = ''
ENV CERT_PATH = ''

EXPOSE $PORT

RUN npm run build

FROM node:slim
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist 

CMD ["node", "dist/index.js"]