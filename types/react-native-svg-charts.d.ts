declare module 'react-native-svg-charts' {
  import { ComponentType, ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  export interface PieChartProps {
    style?: ViewStyle;
    data: any[];
    innerRadius?: string | number;
    outerRadius?: string | number;
    labelRadius?: string | number;
    padAngle?: number;
    sort?: (a: any, b: any) => number;
    valueAccessor?: (item: any) => number;
    children?: ReactNode;
  }

  export const PieChart: ComponentType<PieChartProps>;
  export const BarChart: ComponentType<any>;
  export const LineChart: ComponentType<any>;
  export const AreaChart: ComponentType<any>;
  export const StackedBarChart: ComponentType<any>;
  export const StackedAreaChart: ComponentType<any>;
  export const ProgressCircle: ComponentType<any>;
}
