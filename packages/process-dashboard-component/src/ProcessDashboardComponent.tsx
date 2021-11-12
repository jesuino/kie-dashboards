/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { Column, ColumnType, ComponentController, DataSet, FilterRequest } from "@dashbuilder-js/component-api";
import { useState, useEffect } from "react";
import { PfCard } from "@kie-dashboards/pfcard-base/src/PfCard";
import {
  Alert,
  DataListText,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Text,
  TextContent
} from "@patternfly/react-core";
import { VictoryChart } from "@kie-dashboards/victory-chart-base";
import { listenerCount } from "process";

const DEFAULT_BG_COLOR = "#EEEEEE";

interface ProcessStatus {
  code: number;
  name: string;
}

interface Sla {
  code: number;
  name: string;
}

const STATUS_ACTIVE = { code: 1, name: "Active" };
const STATUS_COMPLETED = { code: 2, name: "Completed" };
const STATUS_ABORTED = { code: 3, name: "Aborted" };

const PROCESS_STATUSES: ProcessStatus[] = [
  { code: 0, name: "Pending" },
  STATUS_ACTIVE,
  STATUS_COMPLETED,
  STATUS_ABORTED,
  { code: 4, name: "Suspended" }
];

const SLA_VIOLATED = { code: 3, name: "Violated" };

const SLAS: Sla[] = [
  { code: 0, name: "NA" },
  { code: 1, name: "Pending" },
  { code: 2, name: "MET" },
  SLA_VIOLATED,
  { code: 4, name: "Aborted" }
];

interface Props {
  controller: ComponentController;
}

interface ProcessInstanceSummary {
  processInstanceId: number;
  type: number;
  status: ProcessStatus;
  slaCompliance: Sla;
  startDate: string;
  userIdentity: string;
}

interface ProcessDashboardState {
  // dashboard style
  backgroundColor: string;

  // main dataset
  processInstancesSummary?: ProcessInstanceSummary[];

  // cards information
  activeProcesses?: number;
  completedProcesses?: number;
  abortedProcesses?: number;
  slaViolatedProcesses?: number;

  // charts datasets
  processesByStatus?: DataSet;
  processesByStartDate?: DataSet;
  processesByUser?: DataSet;
}

const DEFAULT_DATASET: DataSet = {
  columns: [
    {
      name: "Country",
      type: ColumnType.LABEL,
      settings: {
        columnId: "Country",
        columnName: "Country",
        valueExpression: "value",
        emptyTemplate: "---",
        valuePattern: ""
      }
    },
    {
      name: "GDP 2010",
      type: ColumnType.NUMBER,
      settings: {
        columnId: "GDP 2010",
        columnName: "GDP 2010",
        valueExpression: "value",
        emptyTemplate: "---",
        valuePattern: "#,"
      }
    },
    {
      name: "GDP 2015",
      type: ColumnType.NUMBER,
      settings: {
        columnId: "GDP 2015",
        columnName: "GDP 2015",
        valueExpression: "value",
        emptyTemplate: "---",
        valuePattern: "#,##0.00"
      }
    }
  ],
  data: [
    ["United States", "14964400", "18036650"],
    ["China", "5812464", "11226186"],
    ["Japan", "5793455", "4382420"],
    ["Germany", "3309668", "3365293"],
    ["United Kingdom", "2246079", "2863304"],
    ["France", "2560002", "2420163"],
    ["Brazil", "2087889", "1801482"],
    ["Italy", "2051412", "1825820"],
    ["India", "1729010", "2088155"],
    ["Russia", "1638463", "1356700"],
    ["Canada", "1504900", "1552808"]
  ]
};

const validate = (dataSet: DataSet): string | undefined => {
  const columns = dataSet.columns;
  if (
    columns.length < 6 ||
    columns[0].type !== ColumnType.NUMBER ||
    columns[1].type !== ColumnType.NUMBER ||
    columns[2].type !== ColumnType.NUMBER ||
    columns[3].type !== ColumnType.NUMBER ||
    columns[4].type !== ColumnType.DATE ||
    columns[5].type !== ColumnType.LABEL
  ) {
    return `
    Invalid dataset. Expected 6 columns with the types NUMBER, NUMBER, NUMBER, DATE and LABEL. 
    These columns should be process instance id, type, status, sla compliance, start date and user identity.
    `;
  }

  return undefined;
};

const toProcessInstanceSummary = (dataSet: DataSet): ProcessInstanceSummary[] => {
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

const byStatus = (instances: ProcessInstanceSummary[]): DataSet => {
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


const byStartDay = (instances: ProcessInstanceSummary[]): DataSet => {
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


  data.sort((l1, l2) => l1[0].localeCompare(l2[0]))
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

const byUser = (instances: ProcessInstanceSummary[]): DataSet => {
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

export function ProcessDashboardComponent(props: Props) {
  const [processDashboardState, setProcessDashboardState] = useState<ProcessDashboardState>({
    backgroundColor: DEFAULT_BG_COLOR
  });

  useEffect(() => {
    props.controller.setOnInit((params: Map<string, any>) => {
      setProcessDashboardState((dashboarState: ProcessDashboardState) => {
        return {
          ...dashboarState,
          backgroundColor: params.get("backgroundColor") || DEFAULT_BG_COLOR
        };
      });
    });

    props.controller.setOnDataSet((_dataset: DataSet) => {
      const validationMessage = validate(_dataset);

      if (validationMessage) {
        props.controller.requireConfigurationFix(validationMessage);
        return;
      }
      props.controller.configurationOk();

      const processInstancesSummaries = toProcessInstanceSummary(_dataset);

      setProcessDashboardState((dashboarState: ProcessDashboardState) => {
        return {
          ...dashboarState,
          activeProcesses: processInstancesSummaries.filter(p => p.status === STATUS_ACTIVE).length,
          completedProcesses: processInstancesSummaries.filter(p => p.status === STATUS_COMPLETED).length,
          abortedProcesses: processInstancesSummaries.filter(p => p.status === STATUS_ABORTED).length,
          slaViolatedProcesses: processInstancesSummaries.filter(p => p.slaCompliance === SLA_VIOLATED).length,
          processInstancesSummary: processInstancesSummaries,
          processesByStartDate: byStartDay(processInstancesSummaries),
          processesByStatus: byStatus(processInstancesSummaries),
          processesByUser: byUser(processInstancesSummaries)

        };
      });
    });
  }, [props.controller]);

  return (
    <>
      <div>
        <Flex style={{ backgroundColor: processDashboardState.backgroundColor, paddingLeft: "10px" }} direction={{ default: "column" }}>
          {processDashboardState.processInstancesSummary && processDashboardState.processInstancesSummary.length > 0 ? (
            <>
              <FlexItem>
                <TextContent>
                  <Text component={"h3"}>Filters</Text>
                </TextContent>
              </FlexItem>

              <FlexItem>
                <Flex spaceItems={{ default: "spaceItemsXl" }} grow={{ default: "grow" }}>
                  <FlexItem>
                    <PfCard
                      value={`${processDashboardState.activeProcesses || 0}`}
                      color="red"
                      title="Active"
                      subtitle="Process Instances"
                      width={300}
                      valueFontSize={"45px"}
                    />
                  </FlexItem>
                  <FlexItem>
                    <PfCard
                      value={`${processDashboardState.completedProcesses || 0}`}
                      color="green"
                      title="Completed"
                      subtitle="Process Instances"
                      width={300}
                      valueFontSize={"45px"}
                    />
                  </FlexItem>
                  <FlexItem>
                    <PfCard
                      value={`${processDashboardState.abortedProcesses || 0}`}
                      color="orange"
                      title="Aborted"
                      subtitle="Process Instances"
                      width={300}
                      valueFontSize={"45px"}
                    />
                  </FlexItem>
                  <FlexItem>
                    <PfCard
                      value={`${processDashboardState.slaViolatedProcesses || 0}`}
                      color="red"
                      title="SLA Overdue"
                      subtitle="Process Instances"
                      width={300}
                      valueFontSize={"45px"}
                    />
                  </FlexItem>
                </Flex>
              </FlexItem>

              <FlexItem>
                {" "}
                <TextContent>
                  <Text component={"h3"}>Charts</Text>
                </TextContent>
              </FlexItem>

              <FlexItem>
                <Flex spaceItems={{ default: "spaceItems2xl" }}>
                  <FlexItem>
                    <VictoryChart
                      type="pie"
                      title="Processes by Status"
                      backgroundColor="white"
                      onValidationSuccess={() => {}}
                      onValidationError={(message: string) => {}}
                      width={400}
                      height={250}
                      themeColor="multi"
                      themeVariant="light"
                      staticTitle={true}
                      dataSet={processDashboardState.processesByStatus}
                      paddingBottom={50}                      
                      legendPosition="bottom"
                    />
                  </FlexItem>
                  <FlexItem>
                    <VictoryChart
                      type="line"
                      title="Start day"
                      backgroundColor="white"
                      onValidationSuccess={() => {}}
                      onValidationError={(message: string) => {}}
                      width={400}
                      height={250}
                      themeColor="multi"
                      themeVariant="light"
                      dataSet={processDashboardState.processesByStartDate}
                      staticTitle={true}
                      paddingTop={10}
                      paddingRight={10}
                      paddingLeft={50}
                      paddingBottom={40}
                      gridY={true}
                    />
                  </FlexItem>
                  <FlexItem style={{ marginBottom: "20px" }}>
                    <VictoryChart
                      type="bar"
                      title="Processes Started by User"
                      backgroundColor="white"
                      onValidationSuccess={() => {}}
                      onValidationError={(message: string) => {}}
                      width={400}
                      height={250}
                      themeColor="multi"
                      themeVariant="light"
                      dataSet={processDashboardState.processesByUser}
                      staticTitle={true}
                      horizontalBars={true}
                      paddingLeft={100}
                      paddingRight={40}
                      paddingBottom={0}
                      gridX={true}
                    />
                  </FlexItem>
                </Flex>
              </FlexItem>
            </>
          ) : (
            <Alert title={"No Data"}>
              {"No data has been supplied to build the process dashboard or the provided dataset is invalid."}
            </Alert>
          )}
        </Flex>
      </div>
    </>
  );
}
