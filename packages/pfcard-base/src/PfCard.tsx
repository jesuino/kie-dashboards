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
import {
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  TextVariants,
  Text,
  Divider,
  TextContent,
  Bullseye
} from "@patternfly/react-core";
import * as React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";

interface Props {
  title: string;
  subtitle: string;
  value: string;
  color: string;
}

export const PfCard = (props: Props) => {
  return (
    <>
      <Card isHoverable={true} isCompact={true} isRounded={true}>
        <CardBody>
          <Flex style={{ alignItems: "center", margin: "5px" }}>
            <FlexItem spacer={{ default: "spacerSm" }}>
              <TextContent>
                <Text style={{ color: props.color }} component={TextVariants.h2}>
                  {props.value}
                </Text>
              </TextContent>
            </FlexItem>
            {(props.title !== "" || props.subtitle !== "") && <Divider isVertical={true} />}
            <FlexItem>
              <TextContent>
                {props.title !== "" && <Text component={TextVariants.h3}>{props.title}</Text>}
                {props.subtitle !== "" && <Text component={TextVariants.small}>{props.subtitle}</Text>}
              </TextContent>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    </>
  );
};
