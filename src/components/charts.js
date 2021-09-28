import { EuiFlexGroup, EuiFlexItem, EuiLoadingContent } from '@elastic/eui';
import NetworkChart from './networkChart';
import CpuChart from './cpuChart';
import RequestChart from './requestChart';
import MemoryChart from './memoryChart';
import React from 'react';
import useSWR from 'swr';

let oldData = {
  memory: [],
  cpu: [],
  network: [],
  requests: [],
};

const fetcher = (url, data) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: data }),
  }).then(res => res.json());

export const Charts = () => {
  let { data, error } = useSWR(
    [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/fetch/chart-data`],
    fetcher,
    { refreshInterval: 1000 }
  );

  if (data) {
    console.log(data);
    oldData.memory.push(data.memory);
    oldData.cpu.push(data.cpu);
    oldData.requests.push(data.requests);
    oldData.network.push(data.network);
  }

  return oldData?.memory?.length < 2 ? (
    <EuiLoadingContent lines={3} />
  ) : (
    <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          <NetworkChart data={oldData?.network?.slice(-10)} />
        </EuiFlexItem>
        <EuiFlexItem>
          <CpuChart data={oldData?.cpu?.slice(-10)} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <RequestChart data={oldData?.requests?.slice(-10)} />
        </EuiFlexItem>
        <EuiFlexItem>
          <MemoryChart data={oldData?.memory?.slice(-10)} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
