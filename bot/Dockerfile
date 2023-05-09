FROM node:20.0.0-alpine3.17
ENV NODE_ENV=production
WORKDIR /app/echo/bot

COPY ["package.json", "./"]

RUN apk add --no-cache ffmpeg python3 g++ make
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "--no-warnings", "echo.js"]