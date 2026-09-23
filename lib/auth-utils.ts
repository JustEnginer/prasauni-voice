export function safeReturnTo(value: string | null | undefined) {
  return value && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) ? value : '/';
}
