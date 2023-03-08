import { TransformFnParams } from 'class-transformer';
export function replaceCpfCnpj(params: TransformFnParams): string {
  const { value } = params;
  return value.replace(/\D/g, '');
}
