export function usePermissions() {
  const checkPermission = (action: string) => true; // base implementation
  return { checkPermission };
}
