export interface ProcessStatus {
  code: number;
  name: string;
}

export const STATUS_ACTIVE = { code: 1, name: "Active" };
export const STATUS_COMPLETED = { code: 2, name: "Completed" };
export const STATUS_ABORTED = { code: 3, name: "Aborted" };
export const STATUS_SUSPENDED = { code: 4, name: "Suspended" };
export const STATUS_PENDING = { code: 0, name: "Pending" };

export const PROCESS_STATUSES: ProcessStatus[] = [
    STATUS_PENDING,
    STATUS_ACTIVE,
    STATUS_COMPLETED,
    STATUS_ABORTED,
    STATUS_SUSPENDED
  ];