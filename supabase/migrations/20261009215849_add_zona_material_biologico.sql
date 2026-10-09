alter table public.material_biologico_reports add column if not exists zona text;
notify pgrst, 'reload schema';
