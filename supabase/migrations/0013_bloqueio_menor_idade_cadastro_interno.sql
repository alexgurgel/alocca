-- =====================================================================
-- Alocca — Bloqueia menor de idade tambem no cadastro interno de
-- freelancers ("Novo Colaborador"), nao so na candidatura publica
-- (que ja foi coberta na migration 0012). Reforco em nivel de banco:
-- mesmo que o formulario seja contornado via chamada direta a API
-- autenticada, a constraint impede a gravacao.
--
-- NOT VALID: nao revalida retroativamente registros ja existentes
-- (podem ja existir cadastros antigos sem data de nascimento, ou o
-- caso do freelancer menor de idade que motivou esta correcao — esse
-- precisa ser revisado manualmente). A constraint passa a valer para
-- todo INSERT/UPDATE novo a partir de agora.
-- =====================================================================

alter table public.funcionarios
  add constraint funcionarios_maior_idade
  check (data_nascimento is null or data_nascimento <= (current_date - interval '18 years')::date)
  not valid;
