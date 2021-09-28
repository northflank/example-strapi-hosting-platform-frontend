import React from 'react';
import moment from 'moment';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory';
import { EuiTitle } from '@elastic/eui';

const RequestChart = ({ data }) => {
  return (
    <>
      <EuiTitle size="xxs">
        <h1>Request Duration</h1>
      </EuiTitle>
      <div style={{ background: '#f3f3f3' }}>
        <VictoryChart minDomain={{ y: 0 }} maxDomain={{ y: 3 }} height={300}>
          <VictoryAxis
            dependentAxis
            tickFormat={x => `${x} ms`}
            style={{
              tickLabels: { fontSize: 15 },
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
              data: { stroke: '#005605' },
            }}
          />
        </VictoryChart>
      </div>
    </>
  );
};

export default RequestChart;
