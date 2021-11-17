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
import { useState, useEffect, useCallback } from "react";
import { CardFilter, CardInfo } from "@kie-dashboards/card-filter-base";

const WRAP_PROP = "wrap";
const CARD_WIDTH_PROP = "cardWidth";
const CARD_HEIGHT_PROP = "cardHeight";
const DEFAULT_CARD_WIDTH = "200px";
const DEFAULT_CARD_HEIGHT = "120px";

interface CardFilterState {
  data: CardInfo[];
  cardWidth: string;
  cardHeight: string;
  wrap: boolean;
}

interface Props {
  controller: ComponentController;
}
export function CardFilterComponent(props: Props) {
  const [cardFilterState, setCardFilterState] = useState<CardFilterState>({
    data: [],
    cardWidth: DEFAULT_CARD_WIDTH,
    cardHeight: DEFAULT_CARD_HEIGHT,
    wrap: false
  });

  const onCardSelected = useCallback(
    (i: number) => {
      if (i !== -1) {
        // for now only single selection is supported
        props.controller.filter({ column: 0, row: 0, reset: true });
        props.controller.filter({ column: 0, row: i, reset: false });
      } else {
        props.controller.filter({ column: 0, row: 0, reset: true });
      }
    },
    [props.controller]
  );

  useEffect(() => {
    props.controller.setOnInit((params: Map<string, any>) => {
      setCardFilterState(cardFilterState => {
        return {
          ...cardFilterState,
          wrap: params.get(WRAP_PROP) === "true",
          cardWitdh: params.get(CARD_WIDTH_PROP) || DEFAULT_CARD_WIDTH,
          cardHeight: params.get(CARD_HEIGHT_PROP) || DEFAULT_CARD_HEIGHT
        };
      });
    });

    props.controller.setOnDataSet((_dataset: DataSet) => {
      setCardFilterState(cardFilterState => {
        return {
          ...cardFilterState,
          data: _dataset.data.map(line => {
            return { title: line[0], body: line[1], footer: line[2] };
          })
        };
      });
    });
  }, [props.controller]);

  return (
    <>
      <CardFilter
        wrap={cardFilterState.wrap}
        cardWidth={cardFilterState.cardWidth}
        cardHeight={cardFilterState.cardHeight}
        onCardSelected={onCardSelected}
        cardsInfos={cardFilterState.data}
      />
    </>
  );
}
