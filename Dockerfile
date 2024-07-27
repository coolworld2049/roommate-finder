FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

CMD npm run start