-- LocaMaster Sistema - Schema SQL para Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  documento TEXT,
  contato TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS equipamentos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  numero_patrimonio TEXT,
  categoria TEXT,
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'locado', 'manutencao', 'inativo')),
  ativo BOOLEAN DEFAULT true,
  preco_unitario_dia NUMERIC(10,2) DEFAULT 0,
  preco_dia NUMERIC(10,2) DEFAULT 0,
  preco_mensal NUMERIC(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORCAMENTOS
CREATE TABLE IF NOT EXISTS orcamentos (
  id BIGSERIAL PRIMARY KEY,
  numero_orcamento TEXT,
  cliente_id BIGINT REFERENCES clientes(id),
  cliente_nome TEXT,
  cliente_contato TEXT,
  cliente_telefone TEXT,
  cliente_email TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'recusado', 'cancelado')),
  data_orcamento DATE DEFAULT CURRENT_DATE,
  data_validade DATE,
  modalidade_locacao TEXT DEFAULT 'mensal',
  data_inicio_locacao DATE,
  data_fim_locacao DATE,
  dias_locacao INTEGER DEFAULT 30,
  subtotal NUMERIC(10,2) DEFAULT 0,
  desconto_valor NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) DEFAULT 0,
  observacoes TEXT,
  frete_responsavel TEXT DEFAULT 'cliente',
  valor_frete NUMERIC(10,2) DEFAULT 0,
  inclui_frete BOOLEAN DEFAULT false,
  itens JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LOCACOES
CREATE TABLE IF NOT EXISTS locacoes (
  id BIGSERIAL PRIMARY KEY,
  numero TEXT,
  cliente_id BIGINT REFERENCES clientes(id),
  cliente_nome TEXT,
  equipamento_id BIGINT REFERENCES equipamentos(id),
  equipamento_nome TEXT,
  data_inicio DATE,
  data_fim DATE,
  dias_total INTEGER DEFAULT 0,
  valor_dia NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'finalizado', 'vencido', 'cancelado')),
  local_entrega TEXT,
  observacoes TEXT,
  orcamento_id BIGINT REFERENCES orcamentos(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FATURAS
CREATE TABLE IF NOT EXISTS faturas (
  id BIGSERIAL PRIMARY KEY,
  numero TEXT,
  cliente_id BIGINT REFERENCES clientes(id),
  cliente_nome TEXT,
  locacao_id BIGINT REFERENCES locacoes(id),
  locacao_numero TEXT,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  data_pagamento DATE,
  valor NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'emitido' CHECK (status IN ('emitido', 'pendente', 'pago', 'vencido', 'cancelado')),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MANUTENCOES
CREATE TABLE IF NOT EXISTS manutencoes (
  id BIGSERIAL PRIMARY KEY,
  equipamento_id BIGINT REFERENCES equipamentos(id),
  equipamento_nome TEXT,
  equipamento_codigo TEXT,
  tipo TEXT DEFAULT 'preventiva' CHECK (tipo IN ('preventiva', 'corretiva')),
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'vencida', 'cancelada')),
  data_agendada DATE,
  data_realizada DATE,
  tecnico TEXT,
  descricao TEXT,
  custo NUMERIC(10,2) DEFAULT 0,
  proxima_manutencao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FORNECEDORES
CREATE TABLE IF NOT EXISTS fornecedores (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  contato TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  categoria TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS (Row Level Security) com políticas permissivas para desenvolvimento
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (permitir tudo para anon e authenticated)
CREATE POLICY "Acesso total clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total equipamentos" ON equipamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total orcamentos" ON orcamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total locacoes" ON locacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total faturas" ON faturas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total manutencoes" ON manutencoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total fornecedores" ON fornecedores FOR ALL USING (true) WITH CHECK (true);
