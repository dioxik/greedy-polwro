# Użyj oficjalnego obrazu Node.js
FROM node:alpine

# Ustaw zmienną środowiskową
ENV NODE_OPTIONS=--openssl-legacy-provider

# Ustaw katalog roboczy w kontenerze
WORKDIR /app

# Skopiuj pliki aplikacji do kontenera
COPY . .

# Instalacja zależności
RUN npm install

# Port, na którym działa aplikacja
EXPOSE 3000

# Komenda uruchamiająca aplikację
CMD ["npm", "start"]
