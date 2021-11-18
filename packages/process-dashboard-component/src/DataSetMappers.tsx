import { ColumnType, DataSet } from "@dashbuilder-js/component-api";
import { ProcessStatus, PROCESS_STATUSES } from "./ProcessStatus";
import { ProcessInstanceSummary } from "./ProcessInstanceSummary";
import { ALL_SLAS as SLAS } from "./Sla";

export const byStartDay = (instances: ProcessInstanceSummary[]): DataSet => {
  const data: string[][] = [];
  const summedByDay = new Map<string, number>();
  instances.forEach(i => {
    const startDate = new Date(i.startDate);
    const day = `${startDate.getDay()}/${startDate.getMonth()}/${startDate.getFullYear()}`;
    const totalByDay = summedByDay.get(day) || 0;
    summedByDay.set(day, totalByDay + 1);
  });

  summedByDay.forEach((v, k) => {
    data.push([k, `${v}`]);
  });

  data.sort((l1, l2) => l1[0].localeCompare(l2[0]));
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
      type: +line[1],
      status: PROCESS_STATUSES.filter(s => s.code === +line[2])[0],
      slaCompliance: SLAS.filter(s => s.code == +line[3])[0],
      startDate: line[4] || "",
      userIdentity: line[5]
    });
  });
  return list;
};