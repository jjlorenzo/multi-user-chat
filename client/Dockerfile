FROM alpine:3.13 AS build
 RUN apk add --no-cache npm
 RUN npm -g install npm
COPY package.json /app/
COPY package-lock.json /app/
 RUN cd app && npm install
COPY . /app/
 RUN cd /app && npm run vite:build

FROM alpine:3.13
 RUN wget -qO - https://git.io/Jtptf | tar xzo -C /usr/local/bin
 ENV SERVER_ASSETS="/app/dist/assets"
 ENV SERVER_PORT="5000"
 ENV SERVER_ROOT="/app/dist/"
COPY --from=build /app/dist /app/dist
 CMD ["static-web-server"]
