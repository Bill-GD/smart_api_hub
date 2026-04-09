FROM node:20.18.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm i

COPY . .
# CMD ["npm", "run", "dev"]

RUN npm run build

FROM node:20.18.0-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm i --omit=dev

COPY --from=builder /app/dist ./dist
COPY schema.json .

# Use user `node` for security instead of `root` user
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]
