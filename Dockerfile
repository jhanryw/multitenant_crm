# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app

# Temporary: make next build succeed on EasyPanel (public values only)
ENV NEXT_PUBLIC_SUPABASE_URL="https://crm-supabase.vodct5.easypanel.host"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
# Se seu projeto usa prisma, às vezes precisa disso:
# RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  else npm i; fi

# ---- build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Para builds do Next funcionarem bem em container:
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm build; \
  else yarn build; fi

# ---- run ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copia apenas o necessário
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Se você usa "output: standalone" (recomendado), descomente e ajuste:
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# CMD ["node", "server.js"]

# Se NÃO usa standalone, rode o next start:
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# --- Supabase public defaults (temporary) ---
ARG NEXT_PUBLIC_SUPABASE_URL="https://crm-supabase.vodct5.easypanel.host"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="COLE_AQUI_SUA_ANON_KEY"

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# ------------------------------------------

EXPOSE 3000
CMD ["npm", "run", "start"]
