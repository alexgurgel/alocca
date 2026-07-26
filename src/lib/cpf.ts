export function isCpfValido(value: string | null | undefined): boolean {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto >= 10 ? 0 : resto;
  };

  const dv1 = calcularDigito(digits.slice(0, 9), 10);
  if (dv1 !== Number(digits[9])) return false;

  const dv2 = calcularDigito(digits.slice(0, 10), 11);
  return dv2 === Number(digits[10]);
}
