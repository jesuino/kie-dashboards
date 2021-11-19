import { Sla, ProcessStatus } from "@kie-dashboards/process-model";

export interface ProcessInstanceSummary {
  processInstanceId: number;
  type: number;
  status: ProcessStatus;
  slaCompliance: Sla;
  startDate: string;
  userIdentity: string;
}
