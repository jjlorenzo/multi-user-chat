FROM alpine:3.13
 RUN apk add --no-cache npm
 RUN npm -g install npm
COPY package.json /app/
COPY package-lock.json /app/
 RUN cd app && npm install --production
COPY . /app/
 CMD ["node", "/app/src/mqtt.js"]
