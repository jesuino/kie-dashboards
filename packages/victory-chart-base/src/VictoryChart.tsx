import * as React from "react";
import { useState, useEffect } from "react";
import { AreaChart } from "./charts/AreaChart";
import { BarChart } from "./charts/BarChart";
import { LineChart } from "./charts/LineChart";
import { DonutChart } from "./charts/DonutChart";
import { PieChart } from "./charts/PieChart";
import { StackChart } from "./charts/StackChart";
import { PaddingProps } from "victory-core";
import {
  ThemeColorType,
  ChartType,
  LegendPosition,
  AnimationEasingType,
  ThemeVariantType,
  ChartProps
} from "./charts/BaseChart";
import { validateDataSetForChart } from "./charts/PropsValidation";
import { UtilizationDonut } from "./charts/UtilizationDonut";
import { DataSet } from "@dashbuilder-js/component-api";
import { Text, TextContent, TextVariants } from "@patternfly/react-core";

export interface VictoryChartProps {
  dataSet?: DataSet;

  width: number;
  height: number;

  type: ChartType;
  themeColor: ThemeColorType;
  themeVariant: ThemeVariantType;
  legendPosition?: LegendPosition;

  animate?: boolean;
  animationDuration?: number;
  animationEasing?: AnimationEasingType;

  paddingTop?: number;
  paddingLeft?: number;
  paddingBottom?: number;
  paddingRight?: number;

  title?: string;
  description?: string;

  zoom?: boolean;
  gridX?: boolean;
  gridY?: boolean;

  donutTitle?: string;
  donutSubTitle?: string;

  backgroundColor?: string;
  staticTitle?: boolean;

  horizontalBars?: boolean;

  onValidationError?: (message: string) => void;
  onValidationSuccess?: () => void;
}

const EMPTY_DATASET: DataSet = {
  columns: [],
  data: []
};

export const VictoryChart = (props: VictoryChartProps) => {
  const [chartState] = useState<ChartProps>({
    width: props.width || 600,
    height: props.height || 400,
    themeColor: props.themeColor,
    themeVariant: props.themeVariant,
    dataSet: props.dataSet || EMPTY_DATASET,
    legendPosition: props.legendPosition || "bottom",
    animation: {
      easing: props.animationEasing,
      duration: props.animationDuration,
      enabled: props.animate!
    },
    ariaTitle: props.title || "",
    ariaDescription: props.description || "",
    padding: {
      bottom: props.paddingBottom || 0,
      left: props.paddingLeft || 0,
      top: props.paddingTop || 0,
      right: props.paddingRight || 0
    },
    zoom: props.zoom!,
    grid: {
      x: props.gridX!,
      y: props.gridY!
    },
    donutTitle: props.donutTitle,
    donutSubTitle: props.donutSubTitle,
    horizontalBars: props.horizontalBars
  });

  useEffect(() => {
    const validation = validateDataSetForChart(props.type, props.dataSet || EMPTY_DATASET);
    if (validation.isValid && props.onValidationSuccess) {
      props.onValidationSuccess!();
    } else {
      props.onValidationError!(validation.message!);
    }
  }, [props, props.dataSet, props.onValidationSuccess, props.onValidationError]);

  const selectChart = (type: ChartType) => {
    switch (type) {
      case "area":
        return <AreaChart {...chartState} />;
      case "bar":
        return <BarChart {...chartState} />;
      case "line":
        return <LineChart {...chartState} />;
      case "donut":
        return <DonutChart {...chartState} />;
      case "pie":
        return <PieChart {...chartState} />;
      case "stack":
        return <StackChart {...chartState} />;
      case "utilization-donut":
        return <UtilizationDonut {...chartState} />;
    }
  };
  return (
    <>
      <div
        style={{
          backgroundColor: props.backgroundColor,
          minWidth: chartState.width + "px",
          minHeight: chartState.height + "px",
          boxShadow: "1px 5px 10px 0.2px lightgray"
        }}
      >
        {chartState.ariaTitle && (
          <TextContent style={{ margin: "10px" }}>
            <Text style={{ fontSize: props.staticTitle ? "" : "3vw" }} component={TextVariants.h3}>
              {chartState.ariaTitle}
            </Text>
            {chartState.ariaDescription && <Text component={TextVariants.small}>{chartState.ariaDescription}</Text>}
          </TextContent>
        )}
        {selectChart(props.type)}
      </div>
    </>
  );
};
