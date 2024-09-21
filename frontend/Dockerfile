# Użyj oficjalnego obrazu Node.js
FROM node:alpine

RUN apk add --no-cache sqlite sqlite-dev

# Ustaw zmienną środowiskową
ENV NODE_OPTIONS=--openssl-legacy-provider

# Ustaw katalog roboczy w kontenerze
WORKDIR /app

# Skopiuj pliki aplikacji do kontenera
COPY . .

# Instalacja zależności
RUN npm install

# Uruchomienie migracji bazy danych podczas budowania obrazu
RUN npx sequelize-cli db:migrate

# Port, na którym działa aplikacja
EXPOSE 3000

# Komenda uruchamiająca aplikację
CMD ["npm", "start"]
