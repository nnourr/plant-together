FROM node:20-alpine

COPY . .

RUN npm install

RUN npm run build

CMD ["npm", "run", "preview:network"]
