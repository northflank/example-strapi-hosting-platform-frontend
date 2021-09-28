import React, { useState } from 'react';
import moment from 'moment';
import useSWR from 'swr';
import Head from 'next/head';

import {
  EuiBasicTable,
  EuiLink,
  EuiHealth,
  EuiTitle,
  EuiButtonIcon,
  EuiSpacer,
  EuiLoadingContent,
  EuiDescriptionList,
  EuiLoadingSpinner,
  EuiStat,
  EuiFlexItem,
  EuiFlexGroup,
} from '@elastic/eui';
import { RIGHT_ALIGNMENT } from '@elastic/eui/lib/services';

const fetcher = url =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json());

const Deployments = () => {
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState({});

  let { data } = useSWR(
    [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/fetch/refresh-projects`],
    fetcher,
    { refreshInterval: 20000 }
  );

  const columns = [
    {
      name: 'Name',
      sortable: true,
      // eslint-disable-next-line react/display-name
      render: data => (
        <EuiLink href={`deployments/${data.projectName}`}>
          {data.publicProjectName}
        </EuiLink>
      ),
    },
    {
      name: 'Health',
      dataType: 'boolean',
      // eslint-disable-next-line react/display-name
      render: data => {
        const sH = data?.progress.find(i => i.key === 'service')?.health;
        const minioHealth = data?.progress.find(i => i.key === 'minio')?.health;
        const pH = data?.progress.find(i => i.key === 'postgresql')?.health;
        const proj = data?.progress.find(i => i.key === 'project')?.health;
        const finished = sH === 200 && minioHealth === 200 && pH === 200;
        const notStarted = proj === 0;
        const error = sH === 500 || minioHealth === 500 || pH === 500;
        const overallStatusOfExisting =
          !data?.serviceDetails?.servicePaused &&
          data?.minioDetails?.status === 'running' &&
          data?.postgresqlDetails?.status === 'running';
        const isProjDeleted =
          sH === 200 &&
          Object.keys(data?.serviceDetails).length === 0 &&
          Object.keys(data?.minioDetails).length === 0 &&
          Object.keys(data?.postgresqlDetails).length === 0;

        const color = error
          ? 'error'
          : finished && overallStatusOfExisting
          ? 'success'
          : isProjDeleted
          ? 'danger'
          : notStarted
          ? 'notStarted'
          : 'spinner';

        const label =
          !data.serviceDetails?.servicePaused &&
          data?.minioDetails?.status === 'running' &&
          data?.postgresqlDetails?.status === 'running'
            ? 'Healthy'
            : 'Offline';

        return color === 'spinner' ? (
          <>
            <EuiLoadingSpinner size="s" />
            {' In Progress'}
          </>
        ) : color === 'notStarted' ? (
          <EuiHealth color={'warning'}>{'Starting soon'}</EuiHealth>
        ) : color === 'error' ? (
          <EuiHealth color={'danger'}>{'Error'}</EuiHealth>
        ) : (
          <EuiHealth color={color}>{label}</EuiHealth>
        );
      },
    },
    {
      field: 'createdAt',
      name: 'Created At',
      dataType: 'date',
      truncateText: true,
      width: '30%',
      render: date => moment(date).format('MMMM Do YYYY, h:mm:ss a'),
    },
    {
      align: RIGHT_ALIGNMENT,
      width: '40px',
      isExpander: true,
      // eslint-disable-next-line react/display-name
      render: item => (
        <EuiButtonIcon
          onClick={() => toggleDetails(item)}
          aria-label={itemIdToExpandedRowMap[item._id] ? 'Collapse' : 'Expand'}
          iconType={itemIdToExpandedRowMap[item._id] ? 'arrowUp' : 'arrowDown'}
        />
      ),
    },
  ];

  const toggleDetails = async item => {
    const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };

    if (itemIdToExpandedRowMapValues[item._id]) {
      delete itemIdToExpandedRowMapValues[item._id];
    } else {
      const projDetails = item;

      const sHealth = item?.progress.find(i => i.key === 'service')?.health;
      const mHealth = item?.progress.find(i => i.key === 'minio')?.health;
      const pHealth = item?.progress.find(i => i.key === 'postgresql')?.health;

      const listItems = [
        {
          title: 'Service Status',
          description:
            sHealth === 200 ? (
              <EuiHealth
                color={
                  projDetails?.serviceDetails?.servicePaused === false
                    ? 'success'
                    : 'danger'
                }>
                {projDetails?.serviceDetails?.servicePaused === false
                  ? 'Running'
                  : 'Offline'}
              </EuiHealth>
            ) : sHealth > 0 && sHealth < 50 ? (
              <>
                <EuiLoadingSpinner size="s" />
                {' In Progress'}
              </>
            ) : (
              <>
                <EuiHealth color={'danger'}>{'Offline'}</EuiHealth>
              </>
            ),
        },
        {
          title: 'MinIO Status',
          description:
            mHealth === 200 ? (
              <EuiHealth
                color={
                  projDetails?.minioDetails?.status === 'running'
                    ? 'success'
                    : 'danger'
                }>
                {projDetails?.minioDetails?.status === 'running'
                  ? 'Running'
                  : 'Offline'}
              </EuiHealth>
            ) : mHealth > 0 && mHealth < 50 ? (
              <>
                <EuiLoadingSpinner size="s" />
                {' In Progress'}
              </>
            ) : (
              <>
                <EuiHealth color={'danger'}>{'Offline'}</EuiHealth>
              </>
            ),
        },
        {
          title: 'PostgreSQL Status',
          description:
            pHealth === 200 ? (
              <EuiHealth
                color={
                  projDetails?.postgresqlDetails?.status === 'running'
                    ? 'success'
                    : 'danger'
                }>
                {projDetails?.postgresqlDetails?.status === 'running'
                  ? 'Running'
                  : 'Offline'}
              </EuiHealth>
            ) : mHealth > 0 && mHealth < 50 ? (
              <>
                <EuiLoadingSpinner size="s" />
                {' In Progress'}
              </>
            ) : (
              <>
                <EuiHealth color={'danger'}>{'Offline'}</EuiHealth>
              </>
            ),
        },
      ];
      itemIdToExpandedRowMapValues[item._id] = (
        <EuiDescriptionList listItems={listItems} />
      );
    }
    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
  };

  const getRowProps = item => {
    const { id } = item;
    return {
      'data-test-subj': `row-${id}`,
      className: 'customRowClass',
    };
  };

  const getCellProps = (item, column) => {
    const { _id } = item;
    const { field } = column;
    return {
      className: 'customCellClass',
      'data-test-subj': `cell-${_id}-${field}`,
      textOnly: true,
    };
  };

  const ipTotal = data?.reduce(function (total, val) {
    const sHealth = val?.progress.find(i => i.key === 'service')?.health;
    const mHealth = val?.progress.find(i => i.key === 'minio')?.health;
    const pHealth = val?.progress.find(i => i.key === 'postgresql')?.health;
    if (
      (sHealth > 1 && sHealth < 50) ||
      (mHealth > 1 && mHealth < 50) ||
      (pHealth > 1 && pHealth < 50)
    ) {
      total = total + 1;
    }
    return total;
  }, 0);

  const healthyTotal = data?.reduce(function (total, val) {
    const sHealth = val?.progress.find(i => i.key === 'service')?.health;
    const mHealth = val?.progress.find(i => i.key === 'minio')?.health;
    const pHealth = val?.progress.find(i => i.key === 'postgresql')?.health;
    const isProjDeleted =
      sHealth === 200 &&
      Object.keys(val?.serviceDetails).length === 0 &&
      Object.keys(val?.minioDetails).length === 0 &&
      Object.keys(val?.postgresqlDetails).length === 0;
    if (
      sHealth === 200 &&
      mHealth === 200 &&
      pHealth === 200 &&
      isProjDeleted === false
    ) {
      total = total + 1;
    }
    return total;
  }, 0);

  const errorTotal = data?.reduce(function (total, val) {
    const sHealth = val?.progress.find(i => i.key === 'service')?.health;
    const mHealth = val?.progress.find(i => i.key === 'minio')?.health;
    const pHealth = val?.progress.find(i => i.key === 'postgresql')?.health;
    if (sHealth === 500) total = total + 1;
    if (mHealth === 500) total = total + 1;
    if (pHealth === 500) total = total + 1;
    return total;
  }, 0);

  const dbTotal = data?.reduce(function (total, val) {
    const pHealth = val?.progress.find(i => i.key === 'postgresql')?.health;
    if (pHealth === 200 && Object.keys(val?.postgresqlDetails).length > 0) {
      total = total + 1;
    }
    return total;
  }, 0);

  const storageTotal = data?.reduce(function (total, val) {
    const mHealth = val?.progress.find(i => i.key === 'minio')?.health;
    if (mHealth === 200 && Object.keys(val?.minioDetails).length > 0) {
      total = total + 1;
    }
    return total;
  }, 0);

  return (
    <>
      <Head>
        <title>Deployments</title>
      </Head>
      <EuiTitle size="l">
        <h1>Deployments</h1>
      </EuiTitle>
      <EuiSpacer />
      {!data ? (
        <EuiLoadingContent lines={3} />
      ) : (
        <>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiStat
                title={data?.length}
                description="Total"
                titleColor={'success'}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={ipTotal}
                description="In Progress"
                titleColor="primary"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={healthyTotal}
                description="Healthy"
                titleColor={'success'}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={dbTotal}
                description="Databases"
                titleColor="primary"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={storageTotal}
                description="Storage"
                titleColor="primary"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={errorTotal}
                description="Errors"
                titleColor="danger"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer />
          <EuiBasicTable
            items={data}
            itemId="_id"
            itemIdToExpandedRowMap={itemIdToExpandedRowMap}
            isExpandable={true}
            columns={columns}
            rowProps={getRowProps}
            cellProps={getCellProps}
          />
        </>
      )}
    </>
  );
};

export default Deployments;
