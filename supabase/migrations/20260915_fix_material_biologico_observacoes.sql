-- Mantém as observações do formulário biológico e os registros existentes.
alter table public.material_biologico_reports
  add column if not exists informacoes_complementares text;

notify pgrst, 'reload schema';
