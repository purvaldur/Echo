FROM node:20.0.0-alpine3.17
# ENV NODE_ENV=production
WORKDIR /app/echo/web

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]