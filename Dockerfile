# Usar una imagen ligera de Node
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de la API
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]