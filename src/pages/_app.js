import Head from 'next/head';
import React from 'react';
import { EuiErrorBoundary } from '@elastic/eui';

import './app.scss';

import Chrome from '../components/chrome';

const MyApp = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Strapi Hosting Platform</title>
      <link rel="shortcut icon" href="/favicon.ico" />
    </Head>
    <Chrome>
      <EuiErrorBoundary>
        <Component {...pageProps} />
      </EuiErrorBoundary>
    </Chrome>
  </>
);

export default MyApp;
