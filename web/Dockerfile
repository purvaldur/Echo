FROM node:20.0.0-alpine3.17

# ENV NODE_ENV=production
ENV WSS_SERVER=192.168.64.6
ENV WSS_PORT=3001

WORKDIR /app/echo/web

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]