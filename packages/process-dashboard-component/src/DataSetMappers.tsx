import { ColumnType, DataSet } from "@dashbuilder-js/component-api";
import { ProcessInstanceSummary } from "./ProcessInstanceSummary";
import { PROCESS_STATUSES, ALL_SLAS, ProcessStatus } from "@kie-dashboards/process-model";

export const byStartDay = (instances: ProcessInstanceSummary[]): DataSet => {
  const data: string[][] = [];
  const summedByDay = new Map<string, number>();

  instances.sort((p1, p2) => new Date(p1.startDate).getTime() - new Date(p2.startDate).getTime());

  instances.forEach(i => {
    const day = new Date(i.startDate).toDateString();
    const totalByDay = summedByDay.get(day) || 0;
    summedByDay.set(day, totalByDay + 1);
  });

  summedByDay.forEach((v, k) => {
    data.push([k, `${v}`]);
  });

  return {
    columns: [
      {
        name: "Start Day",
        type: ColumnType.LABEL,
        settings: {
          columnId: "startDay",
          columnName: "Start Day",
          emptyTemplate: "",
          valueExpression: "value",
          valuePattern: ""
        }
      },
      {
        name: "Total",
        type: ColumnType.NUMBER,
        settings: {
          columnId: "sum",
          columnName: "Total",
          emptyTemplate: "",
          valueExpression: "value",
          valuePattern: "#"
        }
      }
    ],
    data: data
  };
};

export const byUser = (instances: ProcessInstanceSummary[]): DataSet => {
  const data: string[][] = [];
  const summedByUser = new Map<string, number>();
  instances.forEach(i => {
    const totalByUser = summedByUser.get(i.userIdentity) || 0;
    summedByUser.set(i.userIdentity, totalByUser + 1);
  });

  summedByUser.forEach((v, k) => {
    data.push([k, `${v}`]);
  });
  return {
    columns: [
      {
        name: "User",
        type: ColumnType.LABEL,
        settings: {
          columnId: "user",
          columnName: "User",
          emptyTemplate: "",
          valueExpression: "value",
          valuePattern: ""
        }
      },
      {
        name: "Total",
        type: ColumnType.NUMBER,
        settings: {
          columnId: "sum",
          columnName: "Total",
          emptyTemplate: "",
          valueExpression: "value",
          valuePattern: "#"
        }
      }
    ],
    data: data
  };
};

export const byStatus = (instances: ProcessInstanceSummary[]): DataSet => {
  const data: string[][] = [];
  const summedByStatus = new Map<ProcessStatus, number>();
  instances.forEach(i => {
    const totalByStatus = summedByStatus.get(i.status) || 0;
    summedByStatus.set(i.status, totalByStatus + 1);
  });

  summedByStatus.forEach((v, k) => {
    data.push([k.name, `${v}`]);
  });
  return {
    columns: [
      {
        name: "Status",
        type: ColumnType.LABEL,
        settings: {
          columnId: "status",
          columnName: "Status",
          emptyTemplate: "",
          valueExpression: "value",
          valuePattern: ""
        }
      },
      {
        name: "Total",
        type: ColumnType.NUMBER,
        settings: {
          columnId: "sum",
          columnName: "Total",
          emptyTemplate: "",
          valueExpression: "value",
          valuePattern: "#"
        }
      }
    ],
    data: data
  };
};

export const toProcessInstanceSummary = (dataSet: DataSet): ProcessInstanceSummary[] => {
  const list: ProcessInstanceSummary[] = [];

  dataSet.data.forEach(line => {
    list.push({
      processInstanceId: +line[0],
      status: PROCESS_STATUSES.filter(s => s.code === +line[1])[0],
      slaCompliance: ALL_SLAS.filter(s => s.code == +line[2])[0],
      startDate: line[3] || "",
      userIdentity: line[4]
    });
  });
  return list;
};
