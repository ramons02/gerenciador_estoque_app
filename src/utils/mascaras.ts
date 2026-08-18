export function mascararTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length === 0) return ''
  if (digitos.length < 3) return `(${digitos}`
  if (digitos.length < 8) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

export function mascararTelefoneSeParecerNumero(valor: string): string {
  if (valor.length > 0 && !/^\d/.test(valor)) return valor
  return mascararTelefone(valor)
}