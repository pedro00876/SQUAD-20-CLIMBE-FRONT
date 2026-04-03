export interface Reuniao {
  id?: string;
  titulo: string;
  dataHorario: string;
  local?: string;
  descricao?: string;
  participantes?: string[];
}

export interface ReuniaoFormValues {
  titulo: string;
  dataHorario: string;
  local: string;
  descricao: string;
  participantes: string;
}
