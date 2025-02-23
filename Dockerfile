FROM node:22-alpine

WORKDIR /usr/src/app

# Install build dependencies required for native modules (like bcrypt)
RUN apk add --no-cache python3 make g++ 

COPY package.json package-lock.json* ./

RUN  npm ci

# Rebuild bcrypt for Alpine
RUN npm rebuild bcrypt --build-from-source

COPY . .

# Generate Prisma Client
RUN npx prisma generate

CMD ["npm", "run", "start:dev"]
