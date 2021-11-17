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
import { PfCard } from "@kie-dashboards/card-base";
import { Alert, DataListText, Flex, FlexItem, Text, TextContent } from "@patternfly/react-core";
import { VictoryChart } from "@kie-dashboards/victory-chart-base";
import { CardFilter, CardInfo } from "@kie-dashboards/card-filter-base";
import { byStatus, byUser, byStartDay } from "./DataSetMappers";

const DEFAULT_BG_COLOR = "#EEEEEE";

export interface ProcessStatus {
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

export interface ProcessInstanceSummary {
  processId: string;
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

  // the selected processes is maintained on this component
  selectedProcess?: string;
  selectedProcessIndex?:number;

  // filter
  cardsInfo: CardInfo[];

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

const validate = (dataSet: DataSet): string | undefined => {
  const columns = dataSet.columns;
  if (
    columns.length < 7 ||
    (columns[0].type !== ColumnType.TEXT && columns[0].type !== ColumnType.LABEL) ||
    columns[1].type !== ColumnType.NUMBER ||
    columns[2].type !== ColumnType.NUMBER ||
    columns[3].type !== ColumnType.NUMBER ||
    columns[4].type !== ColumnType.NUMBER ||
    columns[5].type !== ColumnType.DATE ||
    columns[6].type !== ColumnType.LABEL
  ) {
    return `
    Invalid dataset. Expected 7 columns with the types TEXT or LABEL, TEXT or LABEL, NUMBER, NUMBER, NUMBER, DATE and LABEL. 
    These columns should be process id (or name), process instance id, type, status, sla compliance, start date and user identity.
    `;
  }

  return undefined;
};

const toProcessInstanceSummary = (dataSet: DataSet): ProcessInstanceSummary[] => {
  const list: ProcessInstanceSummary[] = [];

  dataSet.data.forEach(line => {
    list.push({
      processId: line[0],
      processInstanceId: +line[1],
      type: +line[2],
      status: PROCESS_STATUSES.filter(s => s.code === +line[3])[0],
      slaCompliance: SLAS.filter(s => s.code == +line[4])[0],
      startDate: line[5] || "",
      userIdentity: line[6]
    });
  });
  return list;
};

const cardsInfo = (instances: ProcessInstanceSummary[]): CardInfo[] => {
  const processIdsMap = new Map<string, CardInfo>();
  instances.forEach(p => processIdsMap.set(p.processId, { title: p.processId }));
  return Array.from(processIdsMap.values());
};

export function ProcessDashboardComponent(props: Props) {
  const [processDashboardState, setProcessDashboardState] = useState<ProcessDashboardState>({
    cardsInfo: [],
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

      const processInstancesSummaries = toProcessInstanceSummary(_dataset).filter(p => p.processId === processDashboardState.selectedProcess);

      const _cardsInfo = cardsInfo(processInstancesSummaries);
      let selectedCardIndex = _cardsInfo.findIndex(c => c.title === processDashboardState.selectedProcess);
      if (selectedCardIndex === -1 && _cardsInfo.length > 0) {
        selectedCardIndex = 0;
      }

      setProcessDashboardState((dashboarState: ProcessDashboardState) => {
        return {
          ...dashboarState,
          selectedProcess: _cardsInfo[selectedCardIndex].title,
          selectedProcessIndex: selectedCardIndex,
          cardsInfo: _cardsInfo,
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
        <Flex
          style={{ backgroundColor: processDashboardState.backgroundColor, paddingLeft: "10px" }}
          direction={{ default: "column" }}
        >
          {processDashboardState.processInstancesSummary && processDashboardState.processInstancesSummary.length > 0 ? (
            <>
              <FlexItem>
                <TextContent>
                  <Text component={"h1"}>Processes</Text>
                </TextContent>
              </FlexItem>
              <FlexItem>
                <CardFilter selectedIndex={processDashboardState.selectedProcessIndex} cardWidth={"300px"} cardsInfos={processDashboardState.cardsInfo} onCardSelected={i => {}} />
              </FlexItem>
              <FlexItem>
                <TextContent>
                  <Text component={"h2"}>Summary</Text>
                </TextContent>
              </FlexItem>

              <FlexItem>
                <Flex spaceItems={{ default: "spaceItemsXl" }} grow={{ default: "grow" }}>
                  <FlexItem>
                    <PfCard
                      value={`${processDashboardState.activeProcesses || 0}`}
                      color="blue"
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
                  <Text component={"h2"}>Charts</Text>
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
