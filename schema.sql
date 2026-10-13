-- Préparation Supabase, indépendante de ClubPulse. Le frontend reste local.
create table public.meetings (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 name text not null, political_group text, location text, scheduled_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.interventions (
 id uuid primary key default gen_random_uuid(), meeting_id uuid not null references public.meetings(id) on delete cascade,
 speaker_name text not null, political_group text, mode text not null default 'countdown' check(mode in ('countdown','countup')), allowed_ms bigint, check((mode='countdown' and allowed_ms>0) or (mode='countup' and allowed_ms is null)),
 used_ms bigint not null check(used_ms>=0), started_at timestamptz, ended_at timestamptz
);
alter table public.meetings enable row level security;
alter table public.interventions enable row level security;
create policy meeting_owner on public.meetings for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy intervention_owner on public.interventions for all to authenticated
 using(exists(select 1 from public.meetings m where m.id=meeting_id and m.owner_id=auth.uid()))
 with check(exists(select 1 from public.meetings m where m.id=meeting_id and m.owner_id=auth.uid()));
