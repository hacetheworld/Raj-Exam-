create extension if not exists pgcrypto;

create table digests (
  id            uuid primary key default gen_random_uuid(),
  digest_date   date not null unique,
  status        text not null default 'processing'
                check (status in ('processing','ready','failed')),
  title         text,
  script_text   text,
  audio_path    text,
  llm_model     text,
  tts_model     text,
  error_message text,
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);

create table questions (
  id            uuid primary key default gen_random_uuid(),
  digest_id     uuid not null references digests(id) on delete cascade,
  position      smallint not null check (position between 1 and 5),
  question_text text not null,
  options       jsonb not null
                check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  explanation   text not null,
  unique (digest_id, position)
);

create table source_items (
  id            uuid primary key default gen_random_uuid(),
  digest_id     uuid not null references digests(id) on delete cascade,
  source_id     text not null,
  url           text not null,
  url_hash      text not null,
  title         text not null,
  body          text not null,
  published_at  timestamptz,
  fetched_at    timestamptz not null default now(),
  unique (digest_id, url_hash)
);

create index source_items_digest_idx on source_items (digest_id);

create table pipeline_runs (
  id            uuid primary key default gen_random_uuid(),
  digest_date   date not null,
  status        text not null default 'running'
                check (status in ('running','succeeded','failed')),
  step          text not null default 'start',
  error_message text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz
);

create index pipeline_runs_date_idx on pipeline_runs (digest_date, started_at desc);

create table sponsor_banners (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  image_path  text not null,
  link_url    text not null check (link_url ~ '^https?://'),
  is_active   boolean not null default true,
  starts_on   date,
  ends_on     date,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Row Level Security: ON, and no policies. Only the service role (backend) can touch data.
alter table digests         enable row level security;
alter table questions       enable row level security;
alter table source_items    enable row level security;
alter table pipeline_runs   enable row level security;
alter table sponsor_banners enable row level security;

-- Atomic publish: questions + digest update succeed or fail together.
create or replace function publish_digest(
  p_digest_id  uuid,
  p_title      text,
  p_script     text,
  p_llm_model  text,
  p_tts_model  text,
  p_audio_path text,
  p_questions  jsonb
) returns void
language plpgsql
as $$
begin
  delete from questions where digest_id = p_digest_id;

  insert into questions (digest_id, position, question_text, options, correct_index, explanation)
  select p_digest_id,
         (q->>'position')::smallint,
         q->>'question_text',
         q->'options',
         (q->>'correct_index')::smallint,
         q->>'explanation'
  from jsonb_array_elements(p_questions) as q;

  update digests
     set status = 'ready',
         title = p_title,
         script_text = p_script,
         llm_model = p_llm_model,
         tts_model = p_tts_model,
         audio_path = p_audio_path,
         error_message = null,
         published_at = now()
   where id = p_digest_id;
end;
$$;

revoke all on function publish_digest(uuid, text, text, text, text, text, jsonb)
  from public, anon, authenticated;

-- Storage buckets: audio is private, banners are public.
insert into storage.buckets (id, name, public)
values ('audio', 'audio', false), ('banners', 'banners', true)
on conflict (id) do nothing;
