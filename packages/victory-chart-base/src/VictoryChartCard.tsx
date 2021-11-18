import * as React from "react";
import { Text, TextContent, TextVariants } from "@patternfly/react-core";
import { VictoryChart, VictoryChartProps } from ".";

export const VictoryChartCard = (props: VictoryChartProps) => {
  return (
    <>
      <div
        style={{
          backgroundColor: props.backgroundColor,
          width: props.width + "px",
          height: "auto",
          boxShadow: "1px 5px 10px 0.2px lightgray"
        }}
      >
        {props.title && (
          <TextContent style={{ margin: "10px" }}>
            <Text style={{ fontSize: props.staticTitle ? "" : "3vw" }} component={TextVariants.h3}>
              {props.title}
            </Text>
            {props.description && <Text component={TextVariants.small}>{props.description}</Text>}
          </TextContent>
        )}
        {<VictoryChart {...props} />}
      </div>
    </>
  );
};
