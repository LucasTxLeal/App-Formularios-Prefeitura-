-- Código destinado às demonstrações de uso da página.
insert into public.access_codes (code, unidade_nome, active)
values ('1111', 'Teste', true)
on conflict (code) do update
set unidade_nome = excluded.unidade_nome, active = excluded.active;
