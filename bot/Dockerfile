FROM --platform=linux/amd64 node:20.0.0-alpine3.17

WORKDIR /app/echo/bot

COPY ["package.json", "package-lock.json*", "./"]

RUN apk add --no-cache ffmpeg python3 g++ make
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "--no-warnings", "echo.js"]