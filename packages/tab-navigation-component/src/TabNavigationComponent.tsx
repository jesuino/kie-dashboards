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

import { TabNavigation, TabData, TabNavigationProps } from "@kie-dashboards/tab-navigation-base";

const MAX_TABS = 4;

interface Props {
  controller: ComponentController;
}
const DEFAULT_WIDTH = "1200px";
const DEFAULT_HEIGHT = "900px";
export function TabNavigationComponent(props: Props) {
  const [tabNavigationProps, setTabNavigationProps] = useState<TabNavigationProps>({
    tabs: []    
  });
  console.log(window.parent.location.href);
  useEffect(() => {
    props.controller.setOnInit((params: Map<string, any>) => {
      const tabs: TabData[] = [];
      const width = params.get("width");
      const height = params.get("height");
      const isPage = params.get("isPage") === "true";
      for (let i = 1; i < MAX_TABS + 1; i++) {
        const tabTitleParam = `tab${i}Title`;
        const tabTargetParam = `tab${i}Target`;
        const tabTitle = params.get(tabTitleParam) || "";
        let tabTarget = params.get(tabTargetParam) || "";
        const location = window.parent.location;

        const queryParams = new URLSearchParams(location.search);
        const modelname = queryParams.get("import");
        const address = `${location.protocol}//${location.host}${location.pathname}`;

        if (isPage) {
          tabTarget = `${address}?standalone&perspective=${encodeURIComponent(tabTarget)}${
            modelname !== null ? "&import=" + modelname : ""
          }`;
        }

        if (tabTitle !== "" && tabTarget !== "") {
          tabs.push({ title: tabTitle, target: tabTarget });
        }
      }
      setTabNavigationProps({
        tabs: tabs,
        width: width,
        height: height
      });
    });

    props.controller.setOnDataSet((_dataset: DataSet) => {});
  }, [props.controller]);

  return (
    <>
      <TabNavigation {...tabNavigationProps} />
    </>
  );
}
