import { TransformFnParams } from 'class-transformer';

export function replaceRg(params: TransformFnParams): string {
  const { value } = params;
  return value.replace(/[.-]/g, '');
}
