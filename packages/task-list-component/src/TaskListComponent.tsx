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
import { Column, ColumnType, ComponentController, DataSet } from "@dashbuilder-js/component-api";
import { useState, useEffect } from "react";
import { Flex, FlexItem, Alert, Page, PageSection, Divider } from "@patternfly/react-core";
import { PfCard } from "@kie-dashboards/card-base";
import { TaskStatus, STATUS_COMPLETED } from "@kie-dashboards/process-model";
import { Alert as TableAlert, FilteredTable } from "@kie-dashboards/filtered-table-base";

const DEFAULT_BG_COLOR = "#EEEEEE";
const CARDS_FONT_SIZE = "30px";
const CARDS_WIDTH = 250;

interface Props {
  controller: ComponentController;
}

const ALERTS = new Map<number, TableAlert>();
// Status Alert
ALERTS.set(6, { danger: TaskStatus.Exited, good: TaskStatus.InProgress, great: STATUS_COMPLETED.name });

interface TaskListState {
  backgroundColor: string;
  tableData: string[][];
  columns: string[];

  totalCreated?: number;
  totalReady?: number;
  totalReserved?: number;
  totalInProgress?: number;
  totalSuspended?: number;
  totalCompleted?: number;
  totalFailed?: number;
  totalError?: number;
  totalExited?: number;
  totalObsolete?: number;
}

const isText = (column: Column) => {
  return column.type === ColumnType.LABEL || column.type === ColumnType.TEXT;
};

const validate = (dataSet: DataSet): string | undefined => {
  const columns = dataSet.columns;
  if (
    columns.length < 7 ||
    !isText(columns[0]) || // processId
    columns[1].type !== ColumnType.NUMBER || // processInstanceId
    !isText(columns[2]) || // name
    columns[3].type !== ColumnType.NUMBER || // taskId
    columns[4].type !== ColumnType.DATE || // createdOn    
    !isText(columns[5]) || // actualOwner
    !isText(columns[6]) // status
  ) {
    return `
    Invalid dataset. Expected 7 columns with the types LABEL/TEXT, NUMBER, LABEL/TEXT, NUMBER, DATE, LABEL/TEXT, LABEL/TEXT. 
    These columns should be process id, process instance id, name, taskId, createdOn, actualOwner and status.
    `;
  }

  return undefined;
};

export function TaskListComponent(props: Props) {
  const [taskListState, setTaskListState] = useState<TaskListState>({
    backgroundColor: DEFAULT_BG_COLOR,
    columns: [
      "Process",
      "Process Instance",
      "Name",
      "Task ID",
      "Created On",
      "Actual Owner",
      "Status"
    ],
    totalCreated: 0,
    totalReady: 0,
    totalReserved: 0,
    totalInProgress: 0,
    totalSuspended: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalError: 0,
    totalExited: 0,
    totalObsolete: 0,
    tableData: []
  });

  useEffect(() => {
    props.controller.setOnInit((params: Map<string, any>) => {
      setTaskListState((dashboarState: TaskListState) => {
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
      // grab dataset

      const tableData: string[][] = [];
      // process instance id, process name, status, start date, end date, sla compliance and user identity.
      const statusCount = new Map<TaskStatus, number>();
      _dataset.data.forEach(line => {
        const status = line[6] as TaskStatus;

        if (status) {
          const totalStatus = statusCount.get(status) || 0;
          statusCount.set(status, totalStatus + 1);
        }

        // process id, process instance id, name, taskId, createdOn, actualOwner and status.
        tableData.push([line[0], line[1], line[2], line[3], line[4], line[5], status]);
      });

      setTaskListState(s => {
        return {
          ...s,
          tableData: tableData,
          totalCreated: statusCount.get(TaskStatus.Created) || 0,
          totalReady: statusCount.get(TaskStatus.Ready) || 0,
          totalReserved: statusCount.get(TaskStatus.Reserved) || 0,
          totalInProgress: statusCount.get(TaskStatus.InProgress) || 0,
          totalSuspended: statusCount.get(TaskStatus.Suspended) || 0,
          totalCompleted: statusCount.get(TaskStatus.Completed) || 0,
          totalFailed: statusCount.get(TaskStatus.Failed) || 0,
          totalError: statusCount.get(TaskStatus.Error) || 0,
          totalExited: statusCount.get(TaskStatus.Exited) || 0,
          totalObsolete: statusCount.get(TaskStatus.Obsolete) || 0
        };
      });
    });
  }, [props.controller]);

  return (
    <>
      <Page>
        {taskListState.tableData.length > 0 ? (
          <>
            <PageSection padding={{ default: "noPadding" }} variant={"light"}>
              <Flex style={{ margin: "16px" }} justifyContent={{ default: "justifyContentSpaceBetween" }}>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalCreated}`}
                    color="blue"
                    title="Created"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalReady}`}
                    color="blue"
                    title="Ready"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalReserved}`}
                    color="blue"
                    title="Reserved"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalInProgress}`}
                    color="blue"
                    title="In Progress"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalCompleted}`}
                    color="green"
                    title="Completed"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
              </Flex>
              <Flex style={{ margin: "16px" }} justifyContent={{ default: "justifyContentSpaceBetween" }}>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalSuspended}`}
                    color="orange"
                    title="Suspended"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalExited}`}
                    color="orange"
                    title="Exited"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalObsolete}`}
                    color="orange"
                    title="Obsolete"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalFailed}`}
                    color="red"
                    title="Failed"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${taskListState.totalError}`}
                    color="red"
                    title="Error"
                    subtitle=""
                    width={CARDS_WIDTH}
                    valueFontSize={CARDS_FONT_SIZE}
                  />
                </FlexItem>
              </Flex>
            </PageSection>
            <Divider />
            <PageSection hasOverflowScroll={true} variant={"light"}>
              <FilteredTable rows={taskListState.tableData} columns={taskListState.columns} alerts={ALERTS} />
            </PageSection>
          </>
        ) : (
          <Alert title={"No Data"}>{"No data has been supplied to build the process list."}</Alert>
        )}
      </Page>
    </>
  );
}
