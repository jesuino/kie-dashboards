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
import { useState, useEffect, useMemo } from "react";
import { Alert, FilteredTable } from "./ProcessTable";

interface Props {
  controller: ComponentController;
}
export function FilteredTableComponent(props: Props) {
  const [dataset, setDataset] = useState<DataSet>();

  useEffect(() => {
    props.controller.setOnInit((params: Map<string, any>) => {
      // init
    });
    props.controller.setOnDataSet((_dataset: DataSet) => {
      setDataset(_dataset);
    });
  }, [props.controller]);

  const rows = useMemo(() => {
    const rows: any[][] = [];
    dataset?.data.forEach((row, i) => {
      const values: any[] = [];
      row.forEach((v, j) => {
        const column = dataset?.columns[j];
        if (!v || v == "") {
          values.push(column.settings.emptyTemplate);
        } else {
          const value = column.type == ColumnType.NUMBER ? +v : v;
          values.push(value);
        }
      });
      rows.push(values);
    });
    return rows;
  }, [dataset]);

  const columns = useMemo(() => {
    return dataset?.columns.map(c => c.settings.columnName) || [];
  }, [dataset]);

  const alerts = new Map<number, Alert>();

  alerts.set(2, {
    danger: "Aborted",
    good: "Active",
    great: "Completed"
  });

  const caption = "Business Process Instances";

  return (
    <>
      <FilteredTable columns={columns} rows={rows} caption={caption} alerts={alerts} />
    </>
  );
}
