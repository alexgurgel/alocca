export function maiorDeIdade(dataNascimento: string): boolean {
  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return false;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) idade--;

  return idade >= 18;
}
