-- =====================================================================
-- Alocca — Storage buckets (fotos de colaboradores e logos de empresa)
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Qualquer usuario autenticado pode ler (buckets publicos), mas apenas
-- membros da mesma empresa (primeiro segmento do path = empresa_id) podem
-- escrever/atualizar/apagar seus proprios arquivos.
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_write_own_empresa" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_empresa_id()::text
  );

create policy "avatars_update_own_empresa" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_empresa_id()::text
  );

create policy "avatars_delete_own_empresa" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_empresa_id()::text
  );

create policy "logos_public_read" on storage.objects
  for select using (bucket_id = 'logos');

create policy "logos_write_own_empresa" on storage.objects
  for insert with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = public.current_empresa_id()::text
  );

create policy "logos_update_own_empresa" on storage.objects
  for update using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = public.current_empresa_id()::text
  );

create policy "logos_delete_own_empresa" on storage.objects
  for delete using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = public.current_empresa_id()::text
  );
