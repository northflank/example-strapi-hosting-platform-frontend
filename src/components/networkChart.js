import React from 'react';
import moment from 'moment';
import { VictoryChart, VictoryLine, VictoryLegend, VictoryAxis } from 'victory';
import { EuiTitle } from '@elastic/eui';

const NetworkChart = ({ data }) => {
  return (
    <>
      <EuiTitle size="xxs">
        <h1>Network Usage</h1>
      </EuiTitle>
      <div style={{ background: '#f3f3f3' }}>
        <VictoryChart minDomain={{ y: 0 }} maxDomain={{ y: 3 }} height={300}>
          <VictoryLegend
            x={125}
            y={50}
            orientation="horizontal"
            gutter={20}
            data={[
              { name: 'INGRESS', symbol: { fill: '#00ae84' } },
              { name: 'EGRESS', symbol: { fill: '#0062ff' } },
            ]}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={x => `${x} Mbps`}
            style={{
              tickLabels: { fontSize: 15, padding: 5, angle: 315 },
            }}
          />
          <VictoryAxis
            tickFormat={x => `${moment(x).format('HH:mm:ss')}`}
            style={{
              tickLabels: { fontSize: 15, padding: 20, angle: 315 },
            }}
          />
          <VictoryLine
            interpolation={'natural'}
            data={data}
            animate={{
              duration: 2000,
              onLoad: { duration: 1000 },
            }}
            style={{
              data: { stroke: '#00AE84' },
            }}
          />
          <VictoryLine
            interpolation={'natural'}
            data={data}
            animate={{
              duration: 2000,
              onLoad: { duration: 1000 },
            }}
            y={d => d.y2}
            style={{
              data: { stroke: '#0062ff' },
            }}
          />
        </VictoryChart>
      </div>
    </>
  );
};

export default NetworkChart;
