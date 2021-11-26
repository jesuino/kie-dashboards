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
import { Flex, FlexItem, TextContent, Text, Alert, Page, PageSection, Divider } from "@patternfly/react-core";
import { PfCard } from "@kie-dashboards/card-base";
import {
  Sla,
  ProcessStatus,
  PROCESS_STATUSES,
  SLA_VIOLATED,
  ALL_SLAS,
  STATUS_ABORTED,
  STATUS_ACTIVE,
  STATUS_COMPLETED,
  SLA_MET,
  SLA_PENDING
} from "@kie-dashboards/process-model";
import { Alert as TableAlert, FilteredTable } from "@kie-dashboards/filtered-table-base";

const DEFAULT_BG_COLOR = "#EEEEEE";

interface Props {
  controller: ComponentController;
}

const ALERTS = new Map<number, TableAlert>();
// Status Alert
ALERTS.set(2, { danger: STATUS_ABORTED.name, good: STATUS_ACTIVE.name, great: STATUS_COMPLETED.name });
// SLA Alert
ALERTS.set(5, { danger: SLA_VIOLATED.name, good: SLA_PENDING.name, great: SLA_MET.name });

interface ProcessListState {
  backgroundColor: string;
  tableData: string[][];
  columns: string[];
  totalActive?: number;
  totalCompleted?: number;
  totalAborted?: number;
  totalSlaOverdue?: number;
}

const validate = (dataSet: DataSet): string | undefined => {
  const columns = dataSet.columns;
  if (
    columns.length < 7 ||
    columns[0].type !== ColumnType.NUMBER ||
    (columns[1].type !== ColumnType.LABEL && columns[1].type !== ColumnType.TEXT) ||
    columns[2].type !== ColumnType.NUMBER ||
    columns[3].type !== ColumnType.DATE ||
    columns[4].type !== ColumnType.DATE ||
    columns[5].type !== ColumnType.NUMBER ||
    (columns[6].type !== ColumnType.LABEL && columns[6].type !== ColumnType.TEXT)
  ) {
    return `
    Invalid dataset. Expected 7 columns with the types NUMBER, LABEL/TEXT, NUMBER, DATE, DATE, NUMBER and LABEL/TEXT. 
    These columns should be process instance id, process name, status, start date, end date, sla compliance and user identity.
    `;
  }

  return undefined;
};

export function ProcessListComponent(props: Props) {
  const [processListState, setProcessListState] = useState<ProcessListState>({
    backgroundColor: DEFAULT_BG_COLOR,
    columns: ["Instance Id", "Process Name", "Status", "Start Date", "End Date", "SLA", "Initiated by"],
    totalActive: 0,
    totalCompleted: 0,
    totalAborted: 0,
    totalSlaOverdue: 0,
    tableData: []
  });

  useEffect(() => {
    props.controller.setOnInit((params: Map<string, any>) => {
      setProcessListState((dashboarState: ProcessListState) => {
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
      const statusCount = new Map<ProcessStatus, number>();
      const slaCount = new Map<Sla, number>();
      _dataset.data.forEach(line => {
        const status = PROCESS_STATUSES.find(s => s.code === +line[2]);
        const sla = ALL_SLAS.find(s => s.code === +line[5]);

        if (status) {
          const totalStatus = statusCount.get(status) || 0;
          statusCount.set(status, totalStatus + 1);
        }

        if (sla) {
          const totalSla = slaCount.get(sla) || 0;
          slaCount.set(sla, totalSla + 1);
        }

        tableData.push([
          line[0],
          line[1] || "",
          status ? status.name : "Unknown",
          line[3] || "",
          line[4] || "",
          sla ? sla.name : "Unknown",
          line[6] || ""
        ]);
      });

      setProcessListState(s => {
        return {
          ...s,
          tableData: tableData,
          totalAborted: statusCount.get(STATUS_ABORTED) || 0,
          totalActive: statusCount.get(STATUS_ACTIVE) || 0,
          totalCompleted: statusCount.get(STATUS_COMPLETED) || 0,
          totalSlaOverdue: slaCount.get(SLA_VIOLATED) || 0
        };
      });
    });
  }, [props.controller]);

  return (
    <>
      <Page >
        {processListState.tableData.length > 0 ? (
          <>
            <PageSection padding={{ default: "noPadding" }} variant={"light"}>
              <Flex spaceItems={{ default: "spaceItemsXl" }} style={{ margin: "16px" }} justifyContent={{default: "justifyContentSpaceBetween"}}>
                <FlexItem>
                  <PfCard
                    value={`${processListState.totalActive}`}
                    color="blue"
                    title="Active"
                    subtitle=""
                    width={300}
                    valueFontSize={"45px"}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${processListState.totalCompleted}`}
                    color="green"
                    title="Completed"
                    subtitle=""
                    width={300}
                    valueFontSize={"45px"}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${processListState.totalAborted}`}
                    color="orange"
                    title="Aborted"
                    subtitle=""
                    width={300}
                    valueFontSize={"45px"}
                  />
                </FlexItem>
                <FlexItem>
                  <PfCard
                    value={`${processListState.totalSlaOverdue}`}
                    color="red"
                    title="SLA Violated"
                    subtitle=""
                    width={300}
                    valueFontSize={"45px"}
                  />
                </FlexItem>
              </Flex>
            </PageSection>
            <Divider />
            <PageSection hasOverflowScroll={true}>
              <FilteredTable rows={processListState.tableData} columns={processListState.columns} alerts={ALERTS} />
            </PageSection>
          </>
        ) : (
          <Alert title={"No Data"}>{"No data has been supplied to build the process list."}</Alert>
        )}
      </Page>
    </>
  );
}
