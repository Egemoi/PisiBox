-- PisiBox username + password auth
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.pisibox_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  password_hash text not null,
  avatar_url text default '',
  session_token uuid,
  created_at timestamptz not null default now()
);

alter table public.pisibox_users enable row level security;
revoke all on public.pisibox_users from anon, authenticated;

create or replace function public.pisibox_register(
  p_username text,
  p_password text,
  p_display_name text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user public.pisibox_users;
  v_username text := lower(trim(p_username));
begin
  if v_username !~ '^[a-z0-9_.-]{3,24}$' then
    raise exception 'Kullanıcı adı 3-24 karakter olmalı; sadece harf, rakam, _, . ve - kullanabilirsin.';
  end if;
  if length(p_password) < 6 then
    raise exception 'Şifre en az 6 karakter olmalı.';
  end if;
  if exists (select 1 from public.pisibox_users where username = v_username) then
    raise exception 'Bu kullanıcı adı zaten alınmış.';
  end if;

  insert into public.pisibox_users(username, display_name, password_hash, session_token)
  values (
    v_username,
    coalesce(nullif(trim(p_display_name), ''), v_username),
    crypt(p_password, gen_salt('bf')),
    gen_random_uuid()
  )
  returning * into v_user;

  return json_build_object(
    'id', v_user.id,
    'username', v_user.username,
    'display_name', v_user.display_name,
    'avatar_url', coalesce(v_user.avatar_url, ''),
    'token', v_user.session_token
  );
end;
$$;

create or replace function public.pisibox_login(
  p_username text,
  p_password text
)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user public.pisibox_users;
begin
  select * into v_user
  from public.pisibox_users
  where username = lower(trim(p_username))
    and password_hash = crypt(p_password, password_hash)
  limit 1;

  if v_user.id is null then
    raise exception 'Kullanıcı adı veya şifre hatalı.';
  end if;

  update public.pisibox_users
  set session_token = gen_random_uuid()
  where id = v_user.id
  returning * into v_user;

  return json_build_object(
    'id', v_user.id,
    'username', v_user.username,
    'display_name', v_user.display_name,
    'avatar_url', coalesce(v_user.avatar_url, ''),
    'token', v_user.session_token
  );
end;
$$;

create or replace function public.pisibox_get_session(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare v_user public.pisibox_users;
begin
  select * into v_user from public.pisibox_users where session_token = p_token limit 1;
  if v_user.id is null then return null; end if;
  return json_build_object(
    'id', v_user.id,
    'username', v_user.username,
    'display_name', v_user.display_name,
    'avatar_url', coalesce(v_user.avatar_url, ''),
    'token', v_user.session_token
  );
end;
$$;

create or replace function public.pisibox_update_profile(
  p_token uuid,
  p_display_name text,
  p_avatar_url text default ''
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare v_user public.pisibox_users;
begin
  update public.pisibox_users
  set display_name = coalesce(nullif(trim(p_display_name), ''), username),
      avatar_url = coalesce(p_avatar_url, '')
  where session_token = p_token
  returning * into v_user;
  if v_user.id is null then raise exception 'Oturum geçersiz.'; end if;
  return json_build_object(
    'id', v_user.id,
    'username', v_user.username,
    'display_name', v_user.display_name,
    'avatar_url', coalesce(v_user.avatar_url, ''),
    'token', v_user.session_token
  );
end;
$$;

create or replace function public.pisibox_logout(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pisibox_users set session_token = null where session_token = p_token;
  return true;
end;
$$;

grant execute on function public.pisibox_register(text,text,text) to anon, authenticated;
grant execute on function public.pisibox_login(text,text) to anon, authenticated;
grant execute on function public.pisibox_get_session(uuid) to anon, authenticated;
grant execute on function public.pisibox_update_profile(uuid,text,text) to anon, authenticated;
grant execute on function public.pisibox_logout(uuid) to anon, authenticated;
