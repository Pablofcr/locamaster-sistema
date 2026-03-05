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

-- 8. CLASSES DE EQUIPAMENTOS (hierarquia: Classe > Subclasse > Tipo)
CREATE TABLE IF NOT EXISTS equipment_classes (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(3) NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SUBCLASSES DE EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS equipment_subclasses (
  id BIGSERIAL PRIMARY KEY,
  class_id BIGINT NOT NULL REFERENCES equipment_classes(id) ON DELETE CASCADE,
  codigo VARCHAR(3) NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, codigo)
);

-- 10. TIPOS TÉCNICOS DE EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS equipment_types (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(4) NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas de classificação na tabela equipamentos
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS classe_id BIGINT REFERENCES equipment_classes(id);
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS subclasse_id BIGINT REFERENCES equipment_subclasses(id);
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS tipo_id BIGINT REFERENCES equipment_types(id);
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS numero_ativo INTEGER;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS asset_id TEXT;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS numero_serie TEXT;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS ano_fabricacao INTEGER;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS numero_frota TEXT;

-- SEED: Classes pré-cadastradas
INSERT INTO equipment_classes (codigo, nome, descricao) VALUES
  ('EAR', 'Terraplanagem', 'Equipamentos para movimentação de terra'),
  ('CMP', 'Compactação', 'Rolos compactadores e placas vibratórias'),
  ('ACS', 'Acesso', 'Plataformas elevatórias e equipamentos de acesso'),
  ('SUP', 'Escoramento', 'Escoras, formas e sistemas de escoramento'),
  ('ENE', 'Energia', 'Geradores, compressores e equipamentos de energia'),
  ('CON', 'Concretagem', 'Betoneiras, bombas de concreto e vibradores'),
  ('GUI', 'Guindastes', 'Guindastes, gruas e equipamentos de içamento'),
  ('FER', 'Ferramentas', 'Ferramentas elétricas e pneumáticas'),
  ('VEI', 'Veículos', 'Caminhões, carretas e veículos utilitários'),
  ('SOL', 'Soldagem', 'Máquinas de solda e equipamentos de corte')
ON CONFLICT (codigo) DO NOTHING;

-- SEED: Subclasses pré-cadastradas
INSERT INTO equipment_subclasses (class_id, codigo, nome, descricao)
SELECT c.id, s.codigo, s.nome, s.descricao
FROM equipment_classes c
CROSS JOIN (VALUES
  ('EAR', 'RET', 'Retroescavadeira', 'Retroescavadeiras e carregadeiras'),
  ('EAR', 'ESC', 'Escavadeira', 'Escavadeiras hidráulicas'),
  ('EAR', 'MOT', 'Motoniveladora', 'Motoniveladoras e plainas'),
  ('EAR', 'CAR', 'Carregadeira', 'Pás carregadeiras'),
  ('CMP', 'ROL', 'Rolo Compactador', 'Rolos compactadores vibratórios'),
  ('CMP', 'PLA', 'Placa Vibratória', 'Placas e sapatas vibratórias'),
  ('CMP', 'CPP', 'Compactador Pneu', 'Compactadores de pneus'),
  ('ACS', 'TES', 'Tesoura', 'Plataformas tesoura'),
  ('ACS', 'ART', 'Articulada', 'Plataformas articuladas'),
  ('ACS', 'TEL', 'Telescópica', 'Plataformas telescópicas'),
  ('SUP', 'ESC', 'Escora', 'Escoras metálicas e de madeira'),
  ('SUP', 'FOR', 'Forma', 'Formas metálicas e de madeira'),
  ('SUP', 'AND', 'Andaime', 'Andaimes tubulares e fachadeiros'),
  ('ENE', 'GER', 'Gerador', 'Geradores de energia'),
  ('ENE', 'CPS', 'Compressor', 'Compressores de ar'),
  ('ENE', 'TRF', 'Transformador', 'Transformadores e estabilizadores'),
  ('CON', 'BET', 'Betoneira', 'Betoneiras estacionárias e autocarregáveis'),
  ('CON', 'BMB', 'Bomba', 'Bombas de concreto'),
  ('CON', 'VIB', 'Vibrador', 'Vibradores de concreto'),
  ('GUI', 'GRT', 'Grua Torre', 'Gruas de torre'),
  ('GUI', 'GMO', 'Guindaste Móvel', 'Guindastes sobre rodas e esteiras'),
  ('GUI', 'MUN', 'Munck', 'Caminhões munck'),
  ('FER', 'ELE', 'Elétrica', 'Ferramentas elétricas'),
  ('FER', 'PNE', 'Pneumática', 'Ferramentas pneumáticas'),
  ('FER', 'HID', 'Hidráulica', 'Ferramentas hidráulicas'),
  ('VEI', 'CAM', 'Caminhão', 'Caminhões diversos'),
  ('VEI', 'CAR', 'Carreta', 'Carretas e semi-reboques'),
  ('VEI', 'UTI', 'Utilitário', 'Veículos utilitários'),
  ('SOL', 'MIG', 'MIG/MAG', 'Máquinas de solda MIG/MAG'),
  ('SOL', 'ELT', 'Eletrodo', 'Máquinas de solda por eletrodo'),
  ('SOL', 'TIG', 'TIG', 'Máquinas de solda TIG')
) AS s(class_code, codigo, nome, descricao)
WHERE c.codigo = s.class_code
ON CONFLICT (class_id, codigo) DO NOTHING;

-- SEED: Tipos técnicos pré-cadastrados
INSERT INTO equipment_types (codigo, nome, descricao) VALUES
  ('STD', 'Standard', 'Configuração padrão'),
  ('HD', 'Heavy Duty', 'Configuração reforçada'),
  ('4X4', '4x4', 'Tração nas quatro rodas'),
  ('4X2', '4x2', 'Tração simples'),
  ('ELE', 'Elétrico', 'Motor elétrico'),
  ('DSL', 'Diesel', 'Motor diesel'),
  ('GAS', 'Gasolina', 'Motor gasolina'),
  ('HBR', 'Híbrido', 'Motor híbrido')
ON CONFLICT (codigo) DO NOTHING;

-- 11. COLUNAS DE AQUISIÇÃO (histórico do equipamento)
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS data_aquisicao DATE;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS fornecedor_id BIGINT REFERENCES fornecedores(id);
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS numero_nota_fiscal TEXT;

-- 13. COLUNAS DE CONTROLE POR QUANTIDADE (equipamentos quantificáveis)
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS controle_quantidade BOOLEAN DEFAULT false;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS quantidade_total INTEGER DEFAULT 1;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS quantidade_disponivel INTEGER DEFAULT 1;

-- 14. COLUNA DE QUANTIDADE NA LOCAÇÃO
ALTER TABLE locacoes ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

-- HABILITAR RLS (Row Level Security) com políticas permissivas para desenvolvimento
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE locacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

ALTER TABLE equipment_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_subclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (permitir tudo para anon e authenticated)
CREATE POLICY "Acesso total clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total equipamentos" ON equipamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total orcamentos" ON orcamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total locacoes" ON locacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total faturas" ON faturas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total manutencoes" ON manutencoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total fornecedores" ON fornecedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total equipment_classes" ON equipment_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total equipment_subclasses" ON equipment_subclasses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total equipment_types" ON equipment_types FOR ALL USING (true) WITH CHECK (true);
