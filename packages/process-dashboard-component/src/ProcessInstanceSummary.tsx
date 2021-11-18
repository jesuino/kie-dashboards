import { Sla } from "./Sla";
import { ProcessStatus } from "./ProcessStatus";


export interface ProcessInstanceSummary {
  processInstanceId: number;
  type: number;
  status: ProcessStatus;
  slaCompliance: Sla;
  startDate: string;
  userIdentity: string;
}