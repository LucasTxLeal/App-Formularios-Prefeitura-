alter table public.y96_reports
  add column if not exists cep text,
  add column if not exists telefone text,
  add column if not exists zona text;
alter table public.material_biologico_reports
  add column if not exists cep text,
  add column if not exists telefone text;
notify pgrst, 'reload schema';