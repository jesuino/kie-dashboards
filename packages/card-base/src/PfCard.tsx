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
  Flex,
  FlexItem,
  TextVariants,
  Text,
  Divider,
  TextContent,
} from "@patternfly/react-core";
import * as React from "react";

interface Props {
  title: string;
  subtitle: string;
  value: string;
  color: string;
  valueFontSize?: string;
  width?: number;
  height?: number;
}

export const PfCard = (props: Props) => {
  return (
    <>
      <Card
        isHoverable={true}
        isCompact={true}
        isRounded={true}
        style={{
          width: props.width ? props.width + "px" : undefined,
          height: props.height ? props.height + "px" : undefined
        }}
      >
        <CardBody>
          <Flex style={{ alignItems: "center", margin: "5px" }}>
            <FlexItem spacer={{ default: "spacerSm" }}>
              <TextContent>
                <Text
                  style={{ color: props.color, fontSize: props.valueFontSize, marginRight: "15px" }}
                  component={TextVariants.h1}
                >
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
