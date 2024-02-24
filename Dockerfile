FROM node:20 AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run type

FROM node:20 AS publish
COPY --from=build package.json package-lock.json ./
COPY --from=build node_modules ./node_modules
COPY --from=build out-tsc ./out-tsc
CMD ["npm", "prod:serve"]

