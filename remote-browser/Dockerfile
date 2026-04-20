FROM mcr.microsoft.com/playwright:v1.57.0-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY server.js ./

ENV HOST=0.0.0.0
ENV PORT=8787
EXPOSE 8787

CMD ["npm", "start"]
