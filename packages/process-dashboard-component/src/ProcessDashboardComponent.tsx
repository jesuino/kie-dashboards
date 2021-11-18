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
import { ColumnType, ComponentController, DataSet } from "@dashbuilder-js/component-api";
import { useState, useEffect } from "react";
import { PfCard } from "@kie-dashboards/card-base";
import { Alert, Flex, FlexItem, Text, TextContent } from "@patternfly/react-core";
import { VictoryChart, VictoryChartCard } from "@kie-dashboards/victory-chart-base";
import { byStatus, byUser, byStartDay, toProcessInstanceSummary } from "./DataSetMappers";
import { ProcessInstanceSummary } from "./ProcessInstanceSummary";
import { STATUS_ACTIVE, STATUS_COMPLETED, STATUS_ABORTED } from "./ProcessStatus";
import { SLA_VIOLATED } from "./Sla";

const DEFAULT_BG_COLOR = "#EEEEEE";

interface Props {
  controller: ComponentController;
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
        <Flex
          style={{ backgroundColor: processDashboardState.backgroundColor, paddingLeft: "10px" }}
          direction={{ default: "column" }}
        >
          {processDashboardState.processInstancesSummary && processDashboardState.processInstancesSummary.length > 0 ? (
            <>
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
                    <VictoryChartCard
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
                    <VictoryChartCard
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
                    <VictoryChartCard
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
