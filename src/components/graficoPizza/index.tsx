import React from 'react';
import { PieChart, Pie, Sector, Cell, Tooltip } from 'recharts';

type DataType = {
  name: string;
  value: number;
};

type CustomActiveShapePieChartProps = {
  data: DataType[];
};

const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28'];

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text
        x={cx}
        y={cy + outerRadius + 20}
        textAnchor="middle"
        fill="#fff"
        fontWeight={500}
        fontSize={12}
        fontFamily='Roboto'
      >
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#fff">
        {`${(percent * 100).toFixed(1)}% (${value})`}
      </text>
    </g>
  );
};

const CustomActiveShapePieChart: React.FC<CustomActiveShapePieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <PieChart width={300} height={300}>
      <Pie
        activeIndex={activeIndex}
        activeShape={renderActiveShape}
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        onMouseEnter={onPieEnter}
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export default CustomActiveShapePieChart;
