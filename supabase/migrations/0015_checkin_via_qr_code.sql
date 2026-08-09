-- =====================================================================
-- Alocca — Check-in via QR code. Cada linha de checkins ganha um token
-- opaco e unico (independente do id, para nao expor o id interno em
-- e-mails). O token vai no QR code enviado por e-mail quando a
-- candidatura e aprovada; o staff escaneia na aba de Check-in do app
-- para marcar presenca automaticamente.
--
-- As policies de RLS ja existentes em checkins (select/update por
-- empresa) cobrem a consulta por qr_token sem precisar de uma RPC
-- security definer: o admin so enxerga/atualiza checkins da propria
-- empresa de qualquer forma.
-- =====================================================================

alter table public.checkins
  add column if not exists qr_token uuid not null default gen_random_uuid();

create unique index if not exists checkins_qr_token_key on public.checkins (qr_token);
