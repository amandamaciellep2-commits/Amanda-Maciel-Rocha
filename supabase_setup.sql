-- =========================================================================
--             SCRIPT DE SETUP SUPABASE - MINHA CME (SISTEMA DE PLANTÃO)
-- =========================================================================
-- Desenvolvido para: amandamaciellep2@gmail.com
-- Data de Criação: 12 de Maio de 2026
--
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse o seu painel do Supabase (https://supabase.com).
-- 2. Selecione o seu projeto correspondente.
-- 3. No menu lateral esquerdo, clique em "SQL Editor" (ícone de terminal '>_').
-- 4. Clique em "New Query" (+).
-- 5. Copie e cole todo o conteúdo deste arquivo.
-- 6. Escolha uma das duas opções abaixo para executar (removendo ou mantendo os blocos correspondentes).
-- 7. Clique em "Run" (no canto inferior direito).
-- =========================================================================

-- =========================================================================
-- OPÇÃO A: ARQUITETURA SEMIPLANA (RECOMENDADA & MAIS FÁCIL PARA O REACT)
-- Esta arquitetura armazena os dados complexos (Tarefas, Ciclos e Links)
-- utilizando o formato JSONB nativo do PostgreSQL. É ideal porque reflete 1:1
-- os estados do React no seu frontend, evitando queries e JOINs complexos.
-- =========================================================================

-- 1. Criar a tabela principal do plantão
CREATE TABLE IF NOT EXISTS public.plantao_cme (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data_plantao DATE UNIQUE DEFAULT current_date NOT NULL,
    
    -- Notas/Ocorrências do turno
    notes TEXT DEFAULT '' NOT NULL,
    
    -- Contadores rápidos
    opme_count INTEGER DEFAULT 4 NOT NULL,
    opticas_count INTEGER DEFAULT 10 NOT NULL,
    alertas_count INTEGER DEFAULT 1 NOT NULL,
    
    -- Ciclos de autoclave (Guardados de forma estruturada em JSONB)
    -- Exemplo: {"A1": 0, "A2": 5, "A3": 2, "peroxido": 1}
    ciclos JSONB DEFAULT '{"A1": 0, "A2": 0, "A3": 0, "perox": 0}'::jsonb NOT NULL,
    
    -- Checklist interativo geral (Lista de "Comece por aqui" do Dashboard)
    -- Exemplo: [{"id": 1, "title": "Rounds", "metadata": "Visita Técnica", "checked": false}, ...]
    tasks JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Links úteis cadastrados para o plantão
    -- Exemplo: [{"id": "1", "label": "Planilha", "url": "https://..."}]
    links JSONB DEFAULT '[]'::jsonb NOT NULL
);

-- Comentários para documentar as colunas
COMMENT ON TABLE public.plantao_cme IS 'Tabela consolidada de controle de plantão CME utilizando JSONB';
COMMENT ON COLUMN public.plantao_cme.ciclos IS 'Registra os ciclos das autoclaves A1, A2, A3 e Peróxido de Hidrogênio';
COMMENT ON COLUMN public.plantao_cme.tasks IS 'Armazena o checklist dinâmico e o seu estado de conclusão (Comece por aqui)';
COMMENT ON COLUMN public.plantao_cme.links IS 'Armazena os links externos importantes que a enfermaria adicionou durante o plantão';

-- 2. Habilitar a segurança de linha (Row Level Security - RLS)
ALTER TABLE public.plantao_cme ENABLE ROW LEVEL SECURITY;

-- 3. Criar uma política de acesso público total (Permitir que usuários façam operações CRUD sem barreira de login)
--    Perfeito para o ambiente de protótipo rápido com a chave anon do Supabase.
CREATE POLICY "Permitir leitura geral para anonimos" 
    ON public.plantao_cme FOR SELECT 
    USING (true);

CREATE POLICY "Permitir insercao livre para anonimos" 
    ON public.plantao_cme FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Permitir atualizacao livre para anonimos" 
    ON public.plantao_cme FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir delecao livre para anonimos" 
    ON public.plantao_cme FOR DELETE 
    USING (true);


-- 4. Inserir dados de teste iniciais (Caso queira carregar o app com conteúdo de exemplo)
INSERT INTO public.plantao_cme (data_plantao, notes, opme_count, opticas_count, alertas_count, ciclos, tasks, links)
VALUES (
    CURRENT_DATE,
    'Manutenção preventiva da Autoclave 2 iniciará às 14h. Priorize cargas ortopédicas.',
    4,
    10,
    1,
    '{"A1": 3, "A2": 5, "A3": 2, "perox": 1}'::jsonb,
    '[
        {"id": 1, "title": "Rounds", "metadata": "Visita Técnica", "checked": false},
        {"id": 2, "title": "Iniciar ocorrências", "metadata": "Abertura de Chamados", "checked": true},
        {"id": 3, "title": "Visualizar mapa cirúrgico", "metadata": "Planejamento do Dia", "checked": false},
        {"id": 4, "title": "Avaliação de temperatura", "metadata": "Controle de Ambiente", "checked": false},
        {"id": 5, "title": "Teste de limpeza", "metadata": "Qualidade Visual", "checked": false},
        {"id": 6, "title": "Preenchimento da planilha", "metadata": "Fechamento/Rotina", "checked": false},
        {"id": 7, "title": "Organização da ocorrência", "metadata": "Triagem & Fluxo", "checked": false},
        {"id": 8, "title": "Fechar ocorrência", "metadata": "Resolução de Desvios", "checked": false}
    ]'::jsonb,
    '[
        {"id": "1", "label": "Estatísticas de Temperatura", "url": "https://docs.google.com"},
        {"id": "2", "label": "Mapa Cirúrgico Central", "url": "https://docs.google.com"}
    ]'::jsonb
) ON CONFLICT (data_plantao) DO NOTHING;


-- =========================================================================
-- OPÇÃO B: ARQUITETURA TOTALMENTE RELACIONAL (RECOMENDADA PARA SISTEMAS ROBUSTOS)
-- Se você planeja realizar consultas com filtros SQL detalhados, relatórios
-- em BI (como Metabase/Looker Studio) ou se deseja normalizar os dados, 
-- execute esta seção. Ela dividirá os dados do seu CME em tabelas separadas.
-- =========================================================================

-- 1. TABELA DE PLANTÕES DIÁRIOS
CREATE TABLE IF NOT EXISTS public.plantao_diario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_plantao DATE UNIQUE DEFAULT CURRENT_DATE NOT NULL,
    turno VARCHAR(20) DEFAULT 'Diurno' NOT NULL, -- Diurno / Noturno
    notes TEXT DEFAULT '',
    opme_count INT DEFAULT 4 NOT NULL,
    opticas_count INT DEFAULT 10 NOT NULL,
    alertas_count INT DEFAULT 1 NOT NULL,
    ciclo_a1 INT DEFAULT 0 NOT NULL,
    ciclo_a2 INT DEFAULT 0 NOT NULL,
    ciclo_a3 INT DEFAULT 0 NOT NULL,
    ciclo_peroxido INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE TAREFAS DOS CHECKLISTS (Com suporte a múltiplos setores/categorias)
CREATE TABLE IF NOT EXISTS public.plantao_tarefa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plantao_id UUID REFERENCES public.plantao_diario(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    metadata TEXT,
    checked BOOLEAN DEFAULT false NOT NULL,
    categoria VARCHAR(50) DEFAULT 'comece_por_aqui' NOT NULL, 
    -- Categorias possíveis:
    -- 'comece_por_aqui'  -> Dashboard Inicial
    -- 'expurgo_limpeza'   -> Sub-setor Expurgo (Temperatura, carimbar, rota suja)
    -- 'quimica_rotina'    -> Sub-setor Química (SAMU, entrega, pendência)
    -- 'esterilizacao_carga' -> Sub-setor Esterilização (Biológico, Bowie & Dick, ciclo 3)
    -- 'distribuicao_atual' -> Sub-setor Armazenamento (Kits, Validades)
    -- 'opme_consignado'   -> Controle de OPME consignado
    -- 'intercorrencias_turno' -> Log de Intercorrências
    ordem INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE LINKS ÚTEIS DO DIÁRIO
CREATE TABLE IF NOT EXISTS public.plantao_link (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plantao_id UUID REFERENCES public.plantao_diario(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE GESTÃO DA EQUIPE (DINÂMICA)
-- Permite que você gerencie seus profissionais escalados através do banco!
CREATE TABLE IF NOT EXISTS public.equipe_cme (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    funcao VARCHAR(100) NOT NULL,
    escala VARCHAR(100) NOT NULL, -- Ex: 'Plantão Diurno', 'Horário Comercial'
    ativo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE NÃO CONFORMIDADES (Cadastrado no setor Química)
CREATE TABLE IF NOT EXISTS public.nao_conformidade (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plantao_id UUID REFERENCES public.plantao_diario(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL, -- Ex: Pinça de dissecção com ranhura
    detalhe VARCHAR(100), -- Ex: Caixa 102 - Retirada
    resolvido BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE SOLICITAÇÕES CC (Centro Cirúrgico - Cadastrado no Armazenamento)
CREATE TABLE IF NOT EXISTS public.solicitacao_cc (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plantao_id UUID REFERENCES public.plantao_diario(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE INVENTÁRIO DE FIM DE PLANTÃO (Registrado no Armazenamento)
CREATE TABLE IF NOT EXISTS public.inventario_fim_plantao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plantao_id UUID REFERENCES public.plantao_diario(id) ON DELETE CASCADE UNIQUE,
    opticas_setor INT DEFAULT 0,
    perfuradores_setor INT DEFAULT 0,
    videolapa_entregue INT DEFAULT 0,
    pinos_schanz_entregue INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- SEGURANÇA E RLS DA ARQUITETURA RELACIONAL
-- Habilitando RLS em todas as tabelas e adicionando políticas permissivas.
-- =========================================================================

ALTER TABLE public.plantao_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantao_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantao_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipe_cme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nao_conformidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacao_cc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_fim_plantao ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público em todas as tabelas:
-- Plantão Diário
CREATE POLICY "Acesso completo SELECT plantao_diario" ON public.plantao_diario FOR SELECT USING (true);
CREATE POLICY "Acesso completo INSERT plantao_diario" ON public.plantao_diario FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso completo UPDATE plantao_diario" ON public.plantao_diario FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo DELETE plantao_diario" ON public.plantao_diario FOR DELETE USING (true);

-- Plantão Tarefa
CREATE POLICY "Acesso completo SELECT plantao_tarefa" ON public.plantao_tarefa FOR SELECT USING (true);
CREATE POLICY "Acesso completo INSERT plantao_tarefa" ON public.plantao_tarefa FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso completo UPDATE plantao_tarefa" ON public.plantao_tarefa FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo DELETE plantao_tarefa" ON public.plantao_tarefa FOR DELETE USING (true);

-- Plantão Link
CREATE POLICY "Acesso completo SELECT plantao_link" ON public.plantao_link FOR SELECT USING (true);
CREATE POLICY "Acesso completo INSERT plantao_link" ON public.plantao_link FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso completo UPDATE plantao_link" ON public.plantao_link FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo DELETE plantao_link" ON public.plantao_link FOR DELETE USING (true);

-- Equipe CME
CREATE POLICY "Acesso completo SELECT equipe_cme" ON public.equipe_cme FOR SELECT USING (true);
CREATE POLICY "Acesso completo INSERT equipe_cme" ON public.equipe_cme FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso completo UPDATE equipe_cme" ON public.equipe_cme FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo DELETE equipe_cme" ON public.equipe_cme FOR DELETE USING (true);

-- Não Conformidades
CREATE POLICY "Acesso completo SELECT nao_conformidade" ON public.nao_conformidade FOR SELECT USING (true);
CREATE POLICY "Acesso completo INSERT nao_conformidade" ON public.nao_conformidade FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso completo UPDATE nao_conformidade" ON public.nao_conformidade FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo DELETE nao_conformidade" ON public.nao_conformidade FOR DELETE USING (true);

-- Solicitações CC
CREATE POLICY "Acesso completo SELECT solicitacao_cc" ON public.solicitacao_cc FOR SELECT USING (true);
CREATE POLICY "Acesso completo INSERT solicitacao_cc" ON public.solicitacao_cc FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso completo UPDATE solicitacao_cc" ON public.solicitacao_cc FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo DELETE solicitacao_cc" ON public.solicitacao_cc FOR DELETE USING (true);

-- Inventário Fim de Plantão
CREATE POLICY "Acesso completo SELECT inventario_fim_plantao" ON public.inventario_fim_plantao FOR SELECT USING (true);
CREATE POLICY "Acesso completo INSERT inventario_fim_plantao" ON public.inventario_fim_plantao FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso completo UPDATE inventario_fim_plantao" ON public.inventario_fim_plantao FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Acesso completo DELETE inventario_fim_plantao" ON public.inventario_fim_plantao FOR DELETE USING (true);

-- =========================================================================
-- SEED DE DADOS: EQUIPE CADASTRADA DA CME (Baseada na sua Equipe Real)
-- =========================================================================

INSERT INTO public.equipe_cme (nome, funcao, escala) VALUES
('Amanda Maciel', 'Enfermeira Chefe', 'Plantão Diurno'),
('Higo', 'Técnico CME', 'Plantão Diurno'),
('Renata', 'Técnico CME', 'Plantão Diurno'),
('Laysa', 'Técnica CME', 'Plantão Diurno'),
('Suely', 'Técnico CME', 'Plantão Noturno'),
('Ávila', 'Técnica CME', 'Plantão Noturno'),
('Bia', 'Técnica CME', 'Horário Comercial'),
('Mariana', 'Técnico CME', 'Plantão Noturno'),
('Anízia', 'Técnica CME', 'Horário Comercial'),
('Laísa', 'Auxiliar CME', 'Plantão Diurno');

-- =========================================================================
-- DICA DE INTEGRAÇÃO COM SEU APP REACT:
-- =========================================================================
-- No seu arquivo /src/lib/supabase.ts, você pode utilizar o cliente do
-- Supabase gerado com 'getSupabaseClient()' para fazer chamadas diretas como:
-- 
-- // Exemplo de Leitura do Plantão de Hoje (Opção A):
-- const supabase = getSupabaseClient();
-- const { data, error } = await supabase
--   .from('plantao_cme')
--   .select('*')
--   .eq('data_plantao', new Date().toISOString().split('T')[0])
--   .single();
-- =========================================================================
