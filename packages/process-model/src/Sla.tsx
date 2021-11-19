
export interface Sla {
  code: number;
  name: string;
}
export const SLA_NA = { code: 0, name: "NA" };
export const SLA_PENDING = { code: 1, name: "Pending" };
export const SLA_MET = { code: 2, name: "MET" };
export const SLA_VIOLATED = { code: 3, name: "Violated" };
export const SLA_ABORTED = { code: 4, name: "Aborted" };

export const ALL_SLAS: Sla[] = [
    SLA_NA,
    SLA_PENDING,
    SLA_MET,
    SLA_VIOLATED,
    SLA_ABORTED
  ];
