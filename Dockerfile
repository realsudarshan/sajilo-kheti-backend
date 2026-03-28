FROM node:20-alpine

WORKDIR /app

# 1. Copy package files and prisma
COPY package*.json ./
COPY prisma ./prisma/ 

# 2. Install everything (including tsx/ts-node)
RUN npm install

# 3. Copy the rest of the code
COPY . .

# 4. Generate Prisma Client
RUN npx prisma generate

# 5. Skip 'npm run build' and just expose the port
EXPOSE 8000

# 6. Run directly using your dev/start command
# Change 'npm run dev' to whatever command you use to start your server locally
CMD ["npm", "run", "dev"]