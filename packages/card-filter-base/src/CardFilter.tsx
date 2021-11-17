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
import { Card, CardBody, CardTitle, Flex, FlexItem, CardFooter, Alert } from "@patternfly/react-core";
import * as React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";

export interface CardInfo {
  title: string;
  body?: string;
  footer?: string;
}

interface Props {
  backgroundColor?: string;
  selectedIndex?: number;
  cardsInfos: CardInfo[];
  cardWidth?: string;
  cardHeight?: string;
  wrap?: boolean;
  onCardSelected: (i: number) => void;
}

export const CardFilter = (props: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(
    props.selectedIndex === undefined ? -1 : props.selectedIndex
  );
  const [index, setIndex] = useState<number>();

  const select = (i: number) => {
    let newIndex = i;
    if (i === selectedIndex) {
      newIndex = -1;
    }
    props.onCardSelected(newIndex);
    setSelectedIndex(newIndex);
  };

  if (props.selectedIndex && props.selectedIndex != selectedIndex) {
    select(selectedIndex);
  }

  return (
    <>
      {props.cardsInfos.length === 0 ? (
        <Alert title="No data!" />
      ) : (
        <Flex
          spaceItems={{ default: "spaceItemsXl" }}
          style={{
            flexWrap: props.wrap ? "wrap" : "nowrap",
            overflow: "auto",
            height: "auto",
            backgroundColor: props.backgroundColor || "white"
          }}
        >
          {props.cardsInfos.map((card, i) => {
            return (
              <FlexItem key={i}>
                <Card
                  onMouseEnter={e => setIndex(i)}
                  onMouseLeave={e => setIndex(-1)}
                  onClick={e => select(i)}
                  isHoverable={true}
                  isCompact={true}
                  isRounded={true}
                  isPlain={true}
                  isSelectable={true}
                  isSelected={i === selectedIndex}
                  style={{
                    opacity: i === index || i === selectedIndex ? 1 : 0.6,
                    //backgroundColor: i === selectedIndex ? "#EFEFEF" : "",
                    cursor: "pointer",
                    width: props.cardWidth,
                    height: props.cardHeight,
                    overflow: "hidden",
                    marginBottom: "10px"
                    //   boxShadow: i === selectedIndex ? "1px 5px 10px 0.2px lightgray" : undefined
                  }}
                >
                  <CardTitle>{card.title}</CardTitle>
                  {card.body && <CardBody>{card.body}</CardBody>}
                  {card.footer && <CardFooter>{card.footer}</CardFooter>}
                </Card>
              </FlexItem>
            );
          })}
        </Flex>
      )}
    </>
  );
};
