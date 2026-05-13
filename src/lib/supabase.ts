import { createClient } from '@supabase/supabase-js';

// Default credentials specified by the user
const DEFAULT_URL = 'sb_publishable_-BdydmncZmbTxB2iTkEcdw_vsAGlGSk';
const DEFAULT_ANON_KEY = '25582d76-c5c2-4513-8686-5680e5dc1571';

// Normalise URL function
export function normalizeSupabaseUrl(url: string): string {
  const cleaned = url.trim();
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  // Check if it looks like a project ref
  return `https://${cleaned}.supabase.co`;
}

// Retrieve from localStorage or environment or default fallback
export function getSupabaseCredentials() {
  const savedUrl = localStorage.getItem('supabase_url');
  const savedKey = localStorage.getItem('supabase_anon_key');

  const url = savedUrl || (import.meta as any).env.VITE_SUPABASE_URL || DEFAULT_URL;
  const key = savedKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  return {
    rawUrl: url,
    normalizedUrl: normalizeSupabaseUrl(url),
    anonKey: key,
    isCustom: !!(savedUrl || savedKey)
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (!url.trim() && !key.trim()) {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
  } else {
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_anon_key', key.trim());
  }
}

// Lazy initializer for supabase client
let cachedClient: any = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient() {
  const { normalizedUrl, anonKey } = getSupabaseCredentials();

  if (!normalizedUrl || !anonKey) return null;

  // Recreate client if url or key changes
  if (!cachedClient || currentUrl !== normalizedUrl || currentKey !== anonKey) {
    try {
      cachedClient = createClient(normalizedUrl, anonKey, {
        auth: {
          persistSession: true // persist session in browser localStorage across reloads
        }
      });
      currentUrl = normalizedUrl;
      currentKey = anonKey;
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

// SQL Script generator for the user
export const SUPABASE_SQL_SETUP = `-- Script SQL para criar e atualizar a tabela no Supabase.
-- Abra o "SQL Editor" no painel do Supabase, cole o código abaixo por completo e depois clique em "Run".

-- 1. Criar a tabela se ainda não existir
create table if not exists plantao_cme (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  data_plantao date unique default current_date not null,
  tasks jsonb default '[]'::jsonb,
  notes text default '',
  links jsonb default '[]'::jsonb,
  insights text default '',
  ciclos jsonb default '{"A1": 0, "A2": 0, "A3": 0, "perox": 0}'::jsonb,
  opme_count integer default 4,
  opticas_count integer default 10,
  alertas_count integer default 1
);

-- 2. Garantir que todas as colunas existem (caso a tabela já existisse de uma versão anterior)
alter table plantao_cme add column if not exists tasks jsonb default '[]'::jsonb;
alter table plantao_cme add column if not exists notes text default '';
alter table plantao_cme add column if not exists links jsonb default '[]'::jsonb;
alter table plantao_cme add column if not exists insights text default '';
alter table plantao_cme add column if not exists ciclos jsonb default '{"A1": 0, "A2": 0, "A3": 0, "perox": 0}'::jsonb;
alter table plantao_cme add column if not exists opme_count integer default 4;
alter table plantao_cme add column if not exists opticas_count integer default 10;
alter table plantao_cme add column if not exists alertas_count integer default 1;

-- 3. Garantir que a coluna 'data_plantao' tem a restrição UNIQUE para permitir UPSERT do app
alter table plantao_cme drop constraint if exists plantao_cme_data_plantao_key;
alter table plantao_cme drop constraint if exists plantao_cme_data_plantao_unique;
alter table plantao_cme add constraint plantao_cme_data_plantao_key unique (data_plantao);

-- 4. Forçar o Supabase (PostgREST) a recarregar o cache de esquemas imediatamente (corrige erro PGRST204)
NOTIFY pgrst, 'reload schema';

-- 5. Ativar RLS (Segurança de Linha) para permitir leitura/escrita pública
alter table plantao_cme enable row level security;

-- 6. Recriar a política com segurança para evitar erros de duplicidade
drop policy if exists "Permitir tudo para anonimos" on plantao_cme;
create policy "Permitir tudo para anonimos" 
on plantao_cme 
for all 
using (true) 
with check (true);
`;
