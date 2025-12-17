# syntax=docker.io/docker/dockerfile:1.7-labs

FROM node:20-alpine AS build
WORKDIR /webclient
COPY client/package.json /webclient/package.json
COPY client/package-lock.json /webclient/package-lock.json
RUN npm i

COPY ./client /webclient
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm i
COPY --from=build /webclient/dist /app/frontend
COPY --exclude=client . /app
# dummy DB URL
ENV DATABASE_URL=file:dummy.db
RUN npm run dbsetup
ENV DATABASE_URL=""

ENV NODE_ENV=production
ENTRYPOINT [ "npm", "run", "start" ]
