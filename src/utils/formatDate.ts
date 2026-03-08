export const formatDate = (date: Date | string): string => {
  // simple formatter as skeleton
  return new Date(date).toLocaleDateString('pt-BR');
};
