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
import { ComponentController, DataSet } from "@dashbuilder-js/component-api";
import { useState, useEffect } from "react";
import { PfCard } from "./PfCard";

const DEFAULT_COLOR = "black";
const COLOR_PROP = "color";
const TITLE_PROP = "title";
const SUBTITLE_PROP = "subtitle";

interface Props {
  controller: ComponentController;
}
export function CardComponent(props: Props) {
  const [value, setValue] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    props.controller.setOnInit((params: Map<string, any>) => {
      const _c = params.get(COLOR_PROP) || DEFAULT_COLOR;
      const _title = params.get(TITLE_PROP) || "";
      const _subtitle = params.get(SUBTITLE_PROP) || "";
      
      setColor(_c);
      setTitle(_title);
      setSubtitle(_subtitle);
    });
    props.controller.setOnDataSet((_dataset: DataSet) => {
      if (_dataset.columns.length < 1) {
        props.controller.requireConfigurationFix("You need to provide at least one column!");
        return;
      }
      if (_dataset.data.length < 1) {
        props.controller.requireConfigurationFix("You need to provide one data row");
        return;
      }
      props.controller.configurationOk();
      setValue(_dataset.data[0][0] || _dataset.columns[0].settings.emptyTemplate);
    });
  }, [props.controller]);

  return (
    <>
      <PfCard color={color} title={title} subtitle={subtitle} value={value} />
    </>
  );
}
