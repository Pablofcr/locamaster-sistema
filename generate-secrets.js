#!/usr/bin/env node

console.log('🔐 GERADOR DE SECRETS PARA PRODUÇÃO\n');

const crypto = require('crypto');

// Gerar NEXTAUTH_SECRET
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

// Gerar chave de API aleatória
const apiSecret = crypto.randomUUID();

// Gerar JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('📋 COPIE ESTAS VARIÁVEIS PARA O VERCEL:\n');
console.log('NEXTAUTH_SECRET=' + nextAuthSecret);
console.log('API_SECRET=' + apiSecret);  
console.log('JWT_SECRET=' + jwtSecret);
console.log('');

console.log('🌐 LEMBRE-SE DE CONFIGURAR TAMBÉM:');
console.log('NEXTAUTH_URL=https://SEU-APP.vercel.app');
console.log('NEXT_PUBLIC_APP_URL=https://SEU-APP.vercel.app');
console.log('');

console.log('✅ Secrets gerados com sucesso!');
console.log('🚀 Configure no Vercel → Settings → Environment Variables');
