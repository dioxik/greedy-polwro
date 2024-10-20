# Bazowy obraz Node.js
FROM node:slim

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

# Zainstaluj serwer do obsługi statycznych plików
RUN npm install -g serve

# Ustaw zmienną środowiskową dla portu
ENV PORT=3000

# Eksponuj port aplikacji
EXPOSE 3000

# Dodaj etykietę z nazwą obrazu
LABEL image_name="polwro-frontend"

# Uruchom serwer do obsługi statycznych plików
CMD ["serve", "-s", "build", "-l", "3000"]