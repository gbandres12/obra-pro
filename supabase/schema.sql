
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Obras Table
create table public.obras (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  localizacao text,
  tipo_obra text, -- civil, metalica, mista, outro
  area_construida numeric,
  situacao text default 'ativa', -- ativa, finalizada, arquivada
  progresso_geral numeric default 0,
  valor_total_contrato numeric,
  centro_de_custo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Etapas Table
create table public.etapas (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  nome_etapa text not null,
  descricao text,
  status text default 'pendente',
  progresso numeric default 0,
  data_inicio_prevista date,
  data_fim_prevista date,
  data_inicio_real date,
  data_fim_real date,
  observacoes text,
  ordem integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Solicitacoes de Material Table (Legacy named solicitacoes_materiais)
create table public.solicitacoes_materiais (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  item_solicitado text not null,
  quantidade numeric not null,
  unidade text,
  solicitante text,
  status text default 'pendente',
  urgencia text default 'media',
  data_necessaria date,
  data_entrega_real date,
  valor_estimado numeric,
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Funcionarios Table
create table public.funcionarios (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  funcao text,
  telefone text,
  email text,
  status text default 'ativo',
  valor_diaria numeric default 0,
  especialidades text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Diarias Table
create table public.diarias (
  id uuid default uuid_generate_v4() primary key,
  funcionario_id uuid references public.funcionarios(id) on delete set null,
  obra_id uuid references public.obras(id) on delete set null,
  data_trabalho date not null,
  valor_pago numeric default 0,
  status text default 'pendente',
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lancamentos Financeiros Table
create table public.lancamentos_financeiros (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  descricao text not null,
  tipo text not null, -- despesa, receita
  valor numeric default 0,
  data_lancamento date not null,
  categoria text,
  status text default 'confirmado',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tarefas Engenheiro Table
create table public.tarefas_engenheiro (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade,
  titulo text not null,
  descricao text,
  data_hora timestamp with time zone not null,
  status text default 'pendente', -- pendente, concluida
  prioridade text default 'media',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Solicitacoes Gerais Table (SolicitacoesPage)
create table public.solicitacoes (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  tipo_solicitacao text not null,
  descricao text,
  solicitante text,
  setor text, -- engenharia, financeiro, administrativo
  status text default 'aberta', -- aberta, em_analise, concluida, cancelada
  data_solicitacao timestamp with time zone default now(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.obras enable row level security;
alter table public.etapas enable row level security;
alter table public.solicitacoes_materiais enable row level security;
alter table public.funcionarios enable row level security;
alter table public.diarias enable row level security;
alter table public.lancamentos_financeiros enable row level security;
alter table public.tarefas_engenheiro enable row level security;
alter table public.solicitacoes enable row level security;

-- Policies
create policy "Enable all access for authenticated users" on public.obras for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.etapas for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.solicitacoes_materiais for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.funcionarios for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.diarias for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.lancamentos_financeiros for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.tarefas_engenheiro for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.solicitacoes for all using (auth.role() = 'authenticated');

-- Documentos e Vencimentos
create table public.documentos_obra (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  titulo text not null,
  tipo text, -- alvara, licenca, contrato, seguro, outros
  data_vencimento date,
  status text default 'vigente', -- vigente, a_vencer, vencido
  arquivo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.documentos_obra enable row level security;
alter table public.documentos_obra enable row level security;
create policy "Enable all access for authenticated users" on public.documentos_obra for all using (auth.role() = 'authenticated');

-- Profiles Table (SaaS Subscription Management)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive', -- active, trialing, past_due, canceled, inactive
  plan_tier text default 'free', -- free, pro, enterprise
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

