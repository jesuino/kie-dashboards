import * as React from "react";
import { BaseChart, XYChartSeries, XYChartDataLine, XYChartData } from "./BaseChart";
import { Chart, ChartAxis, ChartGroup } from "@patternfly/react-charts";
var numeral = require("numeral");

export type ChartGroupType = typeof ChartGroup;

export abstract class XYChart extends BaseChart {
  render() {
    const { width, height, themeColor, themeVariant } = this.props;
    return (
      <Chart
        ariaDesc={this.props.ariaDescription}
        ariaTitle={this.props.ariaTitle}
        containerComponent={this.containerComponent}
        domainPadding={{ x: [30, 25] }}
        legendData={this.legendData}
        legendOrientation={this.legendOrientation}
        legendPosition={this.props.legendPosition}
        width={width}
        height={height}
        animate={this.animationProp}
        padding={this.props.padding}
        themeColor={themeColor}
        themeVariant={themeVariant}
      >
        <ChartAxis showGrid={this.props.grid.y} fixLabelOverlap={this.props.fixLabelsOverlap} />
        <ChartAxis
          dependentAxis
          showGrid={this.props.grid.x}
          tickFormat={t => numeral(t).format(this.pattern())}
          fixLabelOverlap={this.props.fixLabelsOverlap}
        />
        {this.buildChartGroup()}
      </Chart>
    );
  }

  abstract buildChartGroup(): ChartGroupType;

  categories() {
    return this.props.dataSet.columns.slice(1).map(column => column.settings["columnName"]);
  }

  pattern() {
    const pattern = this.props.dataSet.columns.slice(1).map(column => column.settings.valuePattern)[0];
    return pattern?.replace(/#/g, "0");
  }

  dataSetToXYData(): XYChartSeries[] {
    let groupedLines: Map<string, XYChartData[]> = new Map();
    const categories = this.categories();
    const ds = this.props.dataSet;
    const rows = ds.data.length;
    const cols = ds.columns.length;
    let getcolumnExpression = this.props.dataSet.columns.slice(0).map(column => column.settings["valueExpression"]);
    let getcolumn1Expression = Object.values(getcolumnExpression)[0].toString();
    let getExpression = this.props.dataSet.columns.slice(1).map(column => column.settings["valueExpression"]);
    let expression = Object.values(getExpression)[0].toString();
    let exp = expression.replace("value", "1");
    const series: XYChartSeries[] = [];

    categories.forEach(name => groupedLines.set(name, []));

    for (let i = 0; i < rows; i++) {
      const name = ds.data[i][0];
      for (let j = 1; j < cols; j++) {
        const cat = categories[j - 1];
        groupedLines.get(cat)?.push({
          x: eval(getcolumn1Expression.replace("value", '"' + name + '"')),
          y: numeral(+ds.data[i][j] * eval(exp)).format(this.pattern())
        });
      }
    }
    groupedLines.forEach((lines, name) => series.push({ name: name, data: lines }));
    return series;
  }

  seriesLines(series: XYChartSeries): XYChartDataLine[] {
    return series.data.map(d => {
      return { name: series.name, x: d.x, y: d.y, yVal: numeral(d.y).value() };
    });
  }
}
