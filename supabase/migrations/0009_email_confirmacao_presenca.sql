--
-- Alocca - Controle de envio de e-mail de confirmacao de presenca
--

alter table public.candidaturas_evento
  add column if not exists email_confirmacao_enviado_em timestamptz,
  add column if not exists email_confirmacao_destino text,
  add column if not exists email_confirmacao_erro text;
