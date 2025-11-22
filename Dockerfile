# ===========================
# 1) 依存関係インストール
# ===========================
FROM node:22-alpine AS deps

WORKDIR /app

# package.json と lock ファイルだけ先にコピー
COPY package*.json ./

# 本番ビルドに必要な devDependencies も入れる
RUN npm ci

# ===========================
# 2) ビルド
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

# node_modules を deps からコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js をビルド
RUN npm run build

# ===========================
# 3) 本番ランナー
# ===========================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 必要なファイルだけコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# 本番用に必要なら、ここで本番依存だけに絞ってもOK
# （ビルド時と同じでいいならコメントアウトでOK）
RUN npm ci --omit=dev

EXPOSE 3000

# package.json に "start": "next start -p 3000" がある前提
CMD ["npm", "start"]
