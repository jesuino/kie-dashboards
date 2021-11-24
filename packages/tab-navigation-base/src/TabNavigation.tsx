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
import { Tabs, Tab, TabTitleText, Flex } from "@patternfly/react-core";
import * as React from "react";
import { useState } from "react";

export interface TabData {
  title: string;
  target: string;
}

export interface TabNavigationProps {
  tabs: TabData[];
  width: string;
  height: string;
}

export const TabNavigation = (props: TabNavigationProps) => {
  const [activeTabKey, setActiveTabKey] = useState(0);  
  const handleTabClick = (event: any, tabIndex: number) => setActiveTabKey(tabIndex);

  return (
    <>
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} style={{ width: props.width }}>
        {props.tabs.map((td, i) => (
          <Tab key={i} eventKey={i} title={<TabTitleText>{td.title}</TabTitleText>} style={{ overflow: "none", paddingTop: "20px" }}>
            <iframe
              src={td.target}
              style={{ border: "none", width: props.width, height: props.height, overflow: "none" }}
            ></iframe>
          </Tab>
        ))}
      </Tabs>
    </>
  );
};
