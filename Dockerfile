FROM mcr.microsoft.com/playwright:v1.53.0-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# RUN npx playwright install

EXPOSE 10000

CMD ["node", "src/backend/server.js"]
