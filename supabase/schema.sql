
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Etapas Table
create table public.etapas (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  nome_etapa text not null,
  descricao text,
  status text default 'pendente', -- pendente, em_andamento, concluida, atrasada
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

-- Solicitacoes de Material Table
create table public.solicitacoes_materiais (
  id uuid default uuid_generate_v4() primary key,
  obra_id uuid references public.obras(id) on delete cascade not null,
  item_solicitado text not null,
  quantidade numeric not null,
  unidade text,
  solicitante text,
  status text default 'pendente', -- pendente, aprovado, comprado, entregue, cancelado
  urgencia text default 'media', -- baixa, media, alta, urgente
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
  status text default 'ativo', -- ativo, inativo, afastado
  valor_diaria numeric default 0,
  especialidades text[], -- Array of strings
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
  status text default 'pendente', -- pendente, pague
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.obras enable row level security;
alter table public.etapas enable row level security;
alter table public.solicitacoes_materiais enable row level security;
alter table public.funcionarios enable row level security;
alter table public.diarias enable row level security;

-- Create policies (For simplicity in this initial version, we allow public access if authenticated, 
-- but in a real SaaS you would check for user_id ownership)
-- You typically need a middleware or 'profiles' table to link auth.users to data.
-- For now, we will create a policy that allows any authenticated user to do anything.
create policy "Enable all access for authenticated users" on public.obras for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.etapas for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.solicitacoes_materiais for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.funcionarios for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.diarias for all using (auth.role() = 'authenticated');
