import Head from 'next/head';
import React from 'react';
import moment from 'moment';

import {
  EuiSpacer,
  EuiTitle,
  EuiStat,
  EuiFlexItem,
  EuiFlexGroup,
  EuiLoadingContent,
} from '@elastic/eui';
import useSWR from 'swr';

const fetcher = url =>
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json());

const Index = () => {
  let { data } = useSWR(
    [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/fetch/strapi-github-repo`],
    fetcher,
    { refreshInterval: 20000 }
  );

  return (
    <>
      <Head>
        <title>Strapi Hosting Platform</title>
      </Head>
      <EuiTitle size="l">
        <h1>Welcome to your Strapi Hosting Platform</h1>
      </EuiTitle>
      <EuiSpacer />
      <EuiSpacer />
      {!data ? (
        <EuiLoadingContent lines={5} />
      ) : (
        <>
          <EuiTitle size="s">
            <h1>{data?.description}</h1>
          </EuiTitle>
          <EuiSpacer />
          <div>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiStat
                  title={`👀 ${data?.subscribers_count
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                  description="Watch"
                  titleSize="l"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat
                  title={`⭐ ${data?.stargazers_count
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                  description="Stars"
                  titleSize="l"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat
                  title={`⑂ ${data?.forks
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                  description="Forks"
                  titleSize="l"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiStat
                  title={data?.open_issues
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  description="Open issues"
                  titleSize="xs"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat
                  title={data?.homepage}
                  description="Homepage"
                  titleSize="xs"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat
                  title={data?.html_url}
                  description="Repository"
                  titleSize="xs"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiStat
                  title={`${moment(
                    data?.lastCommit?.commit?.author?.date
                  ).format('MMMM Do YYYY')} by ${
                    data?.lastCommit?.commit?.author?.name
                  }: ${data?.lastCommit?.commit?.message}`}
                  description="Last commit"
                  titleSize="xs"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </>
      )}
    </>
  );
};

export default Index;
