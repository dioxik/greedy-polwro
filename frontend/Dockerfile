# Bazowy obraz Node.js
FROM node:16

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm install

# Skopiuj resztę plików aplikacji
COPY . .

# Zbuduj aplikację React
RUN npm run build


# Ustaw zmienną środowiskową dla portu
ENV PORT 3000
