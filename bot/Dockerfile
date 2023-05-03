FROM node:20.0.0-alpine3.17
ENV NODE_ENV=production
WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN apk add --no-cache ffmpeg python3 g++ make
RUN npm install --production

COPY . .

CMD ["node", "echo.js"]