FROM node:10.17-alpine3.10
ARG cpu_cores
WORKDIR /usr/src/app
COPY package*.json ./
COPY lerna.json ./
RUN apk add git python make g++ bash && npm install
COPY ./packages/bitcore-build/package.json ./packages/bitcore-build/package.json
COPY ./packages/bitcore-mnemonic/package.json ./packages/bitcore-mnemonic/package.json
COPY ./packages/bitcore-lib/package.json ./packages/bitcore-lib/package.json
COPY ./packages/bitcore-lib-cash/package.json ./packages/bitcore-lib-cash/package.json
COPY ./packages/bitcore-p2p/package.json ./packages/bitcore-p2p/package.json
COPY ./packages/bitcore-p2p-cash/package.json ./packages/bitcore-p2p-cash/package.json
COPY ./packages/bitcore-p2p-dfi/package.json ./packages/bitcore-p2p-dfi/package.json
COPY ./packages/bitcore-wallet-client/package.json ./packages/bitcore-wallet-client/package.json
COPY ./packages/bitcore-client/package.json ./packages/bitcore-client/package.json
COPY ./packages/bitcore-wallet/package.json ./packages/bitcore-wallet/package.json
COPY ./packages/bitcore-wallet-client/package.json ./packages/bitcore-wallet-client/package.json
COPY ./packages/bitcore-wallet-service/package.json ./packages/bitcore-wallet-service/package.json
COPY ./packages/bitcore-node/package.json ./packages/bitcore-node/package.json
COPY ./packages/insight-previous/package.json ./packages/insight-previous/package.json
RUN ./node_modules/.bin/lerna bootstrap --concurrency=$cpu_cores
COPY . .
RUN apk del git python make g++ && rm -rf /var/cache/apk/* /root/.npm /root/.cache /tmp/*
