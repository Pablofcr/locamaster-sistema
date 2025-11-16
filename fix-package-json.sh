#!/bin/bash

echo "🚨 SCRIPT DE CORREÇÃO - PACKAGE.JSON NÃO ENCONTRADO"
echo "================================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: package.json não encontrado no diretório atual"
    echo "📁 Execute este script dentro da pasta locamaster-pro-v2"
    exit 1
fi

echo "✅ package.json encontrado localmente"

# Verificar git
if [ ! -d ".git" ]; then
    echo "⚠️ Diretório git não encontrado - inicializando..."
    git init
fi

echo "🔄 Limpando histórico git e recriando..."

# Remover git existente e recriar limpo
rm -rf .git
git init

# Adicionar todos os arquivos
echo "📦 Adicionando todos os arquivos..."
git add .

# Forçar adição do package.json
git add package.json
git add package-lock.json

# Verificar se package.json foi adicionado
if git ls-files | grep -q "package.json"; then
    echo "✅ package.json adicionado ao git"
else
    echo "❌ ERRO: package.json não foi adicionado"
    exit 1
fi

# Commit inicial
echo "📝 Fazendo commit inicial..."
git commit -m "🚀 Deploy fix: Clean repository with package.json"

# Configurar branch
git branch -M main

# Solicitar URL do repositório
echo ""
echo "📋 Agora você precisa fornecer a URL do seu repositório GitHub:"
echo "Exemplo: https://github.com/seu-usuario/locamaster-pro-v2.git"
read -p "🔗 Digite a URL completa: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL não fornecida. Execute o script novamente."
    exit 1
fi

# Adicionar remote
echo "🔗 Conectando ao repositório remoto..."
git remote add origin "$REPO_URL"

# Push forçado
echo "📤 Enviando arquivos para GitHub (push forçado)..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCESSO! Repositório atualizado com package.json"
    echo "✅ Próximos passos:"
    echo "1. 🌐 Verifique no GitHub se package.json aparece na raiz"
    echo "2. 🔄 No Vercel, aguarde auto-deploy ou faça redeploy manual"
    echo "3. ⏱️ Deploy deve demorar mais que 16 segundos agora"
    echo ""
    echo "🔗 Verifique seu repositório em: ${REPO_URL%.git}"
else
    echo "❌ ERRO no push. Verifique:"
    echo "1. URL do repositório está correta?"
    echo "2. Você tem permissão para escrever no repositório?"
    echo "3. Repositório existe no GitHub?"
fi
