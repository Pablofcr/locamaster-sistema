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

-- 11. COLUNAS DE ENDEREÇO DETALHADO (clientes)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS logradouro TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS numero TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS complemento TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS bairro TEXT;

-- 12. COLUNAS DE AQUISIÇÃO (histórico do equipamento)
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS data_aquisicao DATE;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS fornecedor_id BIGINT REFERENCES fornecedores(id);
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS numero_nota_fiscal TEXT;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS valor_aquisicao_unitario NUMERIC(10,2) DEFAULT 0;

-- 12b. COLUNAS DE FORMA DE PAGAMENTO DA AQUISIÇÃO
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS forma_pagamento_aquisicao TEXT; -- 'a_vista' ou 'parcelado'
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS parcelas_aquisicao INTEGER;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS data_vencimento_primeira_parcela DATE;

-- 13. COLUNAS DE CONTROLE POR QUANTIDADE (equipamentos quantificáveis)
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS controle_quantidade BOOLEAN DEFAULT false;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS quantidade_total INTEGER DEFAULT 1;
ALTER TABLE equipamentos ADD COLUMN IF NOT EXISTS quantidade_disponivel INTEGER DEFAULT 1;

-- 14. COLUNA DE QUANTIDADE NA LOCAÇÃO
ALTER TABLE locacoes ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

-- =============================================
-- SISTEMA DE FATURAMENTO COMPLETO
-- =============================================

-- 15. NOVAS COLUNAS NA TABELA FATURAS
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS parcela_numero INTEGER;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS parcela_total INTEGER;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS fatura_pai_id BIGINT REFERENCES faturas(id);
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'avulsa';
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS periodo_referencia TEXT;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS gerada_automaticamente BOOLEAN DEFAULT false;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS valor_original NUMERIC(10,2) DEFAULT 0;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(10,2) DEFAULT 0;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS valor_desconto NUMERIC(10,2) DEFAULT 0;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS valor_juros NUMERIC(10,2) DEFAULT 0;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS valor_multa NUMERIC(10,2) DEFAULT 0;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS cliente_telefone TEXT;
ALTER TABLE faturas ADD COLUMN IF NOT EXISTS cliente_email TEXT;

-- Atualizar CHECK constraint do status para incluir 'parcial'
ALTER TABLE faturas DROP CONSTRAINT IF EXISTS faturas_status_check;
ALTER TABLE faturas ADD CONSTRAINT faturas_status_check
  CHECK (status IN ('emitido', 'pendente', 'pago', 'parcial', 'vencido', 'cancelado'));

-- 16. NOVAS COLUNAS NA TABELA LOCACOES
ALTER TABLE locacoes ADD COLUMN IF NOT EXISTS dia_faturamento INTEGER DEFAULT 1;
ALTER TABLE locacoes ADD COLUMN IF NOT EXISTS faturamento_automatico BOOLEAN DEFAULT false;
ALTER TABLE locacoes ADD COLUMN IF NOT EXISTS ultimo_faturamento DATE;
ALTER TABLE locacoes ADD COLUMN IF NOT EXISTS proximo_faturamento DATE;

-- 17. TABELA PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id BIGSERIAL PRIMARY KEY,
  fatura_id BIGINT NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento TEXT,
  comprovante TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TABELA REGUA DE COBRANCA
CREATE TABLE IF NOT EXISTS regua_cobranca (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  dias_antes_vencimento INTEGER DEFAULT 0,
  dias_apos_vencimento INTEGER DEFAULT 0,
  tipo_acao TEXT NOT NULL DEFAULT 'whatsapp',
  template_mensagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED: Regras padrão da régua de cobrança
INSERT INTO regua_cobranca (nome, dias_antes_vencimento, dias_apos_vencimento, tipo_acao, template_mensagem) VALUES
  ('Lembrete 3 dias antes', 3, 0, 'whatsapp', 'Olá {{cliente_nome}}, lembramos que a fatura {{numero}} no valor de {{valor}} vence em {{data_vencimento}}. Para evitar juros, efetue o pagamento até a data.'),
  ('Lembrete no dia', 0, 0, 'whatsapp', 'Olá {{cliente_nome}}, a fatura {{numero}} no valor de {{valor}} vence hoje ({{data_vencimento}}). Por favor, efetue o pagamento.'),
  ('1 dia após vencimento', 0, 1, 'whatsapp', 'Olá {{cliente_nome}}, a fatura {{numero}} no valor de {{valor}} venceu ontem. Por favor, regularize o pagamento para evitar encargos.'),
  ('3 dias após vencimento', 0, 3, 'whatsapp', 'Olá {{cliente_nome}}, a fatura {{numero}} no valor de {{valor}} está vencida há 3 dias. Regularize o pagamento para evitar juros e multa.'),
  ('7 dias após vencimento', 0, 7, 'whatsapp', 'Olá {{cliente_nome}}, a fatura {{numero}} no valor de {{valor}} está vencida há 7 dias. Entre em contato conosco para negociar o pagamento.'),
  ('15 dias após vencimento', 0, 15, 'whatsapp', 'Olá {{cliente_nome}}, a fatura {{numero}} está vencida há 15 dias. Valor atualizado: {{valor_atualizado}}. Entre em contato urgente para regularização.')
ON CONFLICT DO NOTHING;

-- 19. TABELA LOG DE COBRANCA
CREATE TABLE IF NOT EXISTS cobranca_log (
  id BIGSERIAL PRIMARY KEY,
  fatura_id BIGINT NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  regra_id BIGINT REFERENCES regua_cobranca(id),
  tipo_acao TEXT NOT NULL,
  mensagem TEXT,
  destinatario TEXT,
  status TEXT DEFAULT 'enviado',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. TABELA NOTAS DE CREDITO/DEBITO
CREATE TABLE IF NOT EXISTS notas_credito_debito (
  id BIGSERIAL PRIMARY KEY,
  fatura_id BIGINT NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('credito', 'debito')),
  valor NUMERIC(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. TABELA CONFIGURACOES DE FATURAMENTO
CREATE TABLE IF NOT EXISTS configuracoes_faturamento (
  id BIGSERIAL PRIMARY KEY,
  dia_faturamento_padrao INTEGER DEFAULT 1,
  dias_para_vencimento INTEGER DEFAULT 10,
  juros_mora NUMERIC(5,2) DEFAULT 2.00,
  multa_atraso NUMERIC(5,2) DEFAULT 2.00,
  pix_chave TEXT,
  pix_tipo TEXT DEFAULT 'cnpj',
  banco_nome TEXT,
  banco_agencia TEXT,
  banco_conta TEXT,
  banco_titular TEXT,
  observacoes_padrao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contas bancarias para receber: a empresa pode receber em mais de um banco.
-- Lista de { nome, agencia, conta, titular }. As colunas banco_* acima ficam
-- com a primeira conta, para configuracoes ja salvas continuarem valendo.
ALTER TABLE configuracoes_faturamento ADD COLUMN IF NOT EXISTS bancos JSONB DEFAULT '[]'::jsonb;

-- RLS e políticas para novas tabelas
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE regua_cobranca ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobranca_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_credito_debito ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_faturamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total pagamentos" ON pagamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total regua_cobranca" ON regua_cobranca FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total cobranca_log" ON cobranca_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total notas_credito_debito" ON notas_credito_debito FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total configuracoes_faturamento" ON configuracoes_faturamento FOR ALL USING (true) WITH CHECK (true);

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

-- =============================================
-- CONTAS A PAGAR
-- =============================================

-- 22. TABELA CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS contas_pagar (
  id BIGSERIAL PRIMARY KEY,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'outros',
  fornecedor_id BIGINT REFERENCES fornecedores(id),
  fornecedor_nome TEXT,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  valor_pago NUMERIC(10,2) DEFAULT 0,
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  forma_pagamento TEXT,
  numero_documento TEXT,
  numero_nota_fiscal TEXT,
  parcela_numero INTEGER DEFAULT 1,
  parcela_total INTEGER DEFAULT 1,
  conta_pai_id BIGINT REFERENCES contas_pagar(id),
  recorrente BOOLEAN DEFAULT false,
  recorrencia_tipo TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'vencido', 'cancelado')),
  observacoes TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total contas_pagar" ON contas_pagar FOR ALL USING (true) WITH CHECK (true);
