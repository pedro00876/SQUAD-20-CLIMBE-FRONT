export function usePermissions() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkPermission = (_action: string) => true; // base implementation
  return { checkPermission };
}
