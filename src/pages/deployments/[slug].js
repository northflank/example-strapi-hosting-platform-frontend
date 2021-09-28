import React, { useState, Fragment, useEffect } from 'react';
import moment from 'moment';
import useSWR from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/router';

import {
  EuiBasicTable,
  EuiLink,
  EuiHealth,
  EuiButtonEmpty,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiText,
  EuiLoadingContent,
  EuiTabbedContent,
} from '@elastic/eui';

import healthCodes from '../../components/healthCodes.js';

import { Charts } from '../../components/charts.js';

const fetcher = (url, projectName) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectName: projectName }),
  }).then(res => res.json());

const DeploymentInfo = () => {
  const router = useRouter();

  const projectName = router.asPath.split('/').pop() ?? '';

  let { data, error } = useSWR(
    [`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/fetch/project`, projectName],
    fetcher,
    { refreshInterval: 2000 }
  );

  if (data) {
    console.log(data);
  }

  const serviceHealth = data?.progress.find(i => i.key === 'service')?.health;
  const minioHealth = data?.progress.find(i => i.key === 'minio')?.health;
  const pHealth = data?.progress.find(i => i.key === 'postgresql')?.health;

  const connectionDetailsColumns = [
    {
      field: 'name',
      name: 'Name',
      width: '20%',
      // eslint-disable-next-line react/display-name
      render: item => <span>{item}</span>,
    },
    {
      field: 'details',
      name: 'Details',
      width: '80%',
      // eslint-disable-next-line react/display-name
      render: item => <span>{item}</span>,
    },
  ];

  const serviceDetails = [
    {
      _id: 1,
      name: 'Internal ID',
      details: data?.serviceDetails?.appId,
    },
    {
      _id: 2,
      name: 'Region',
      details: data?.serviceDetails?.deployment?.region,
    },
    {
      _id: 3,
      name: 'Service URL',
      details: (
        <EuiLink
          href={`https://${data?.serviceDetails?.ports?.[0]?.domains?.[0]?.name}`}
          target="_blank"
          external>
          https://{data?.serviceDetails?.ports?.[0]?.domains?.[0]?.name}
        </EuiLink>
      ),
    },
  ];
  const minioDetails = [
    {
      name: 'Internal ID',
      details: data?.minioDetails?.appId,
    },
    {
      name: 'Region',
      details: data?.minioDetails?.spec?.config?.deployment?.region,
    },
    {
      name: 'Replicas',
      details: data?.minioDetails?.spec?.config?.deployment?.replicas,
    },
    {
      name: 'Storage Size',
      details: `${data?.minioDetails?.spec?.config?.deployment?.storageSize} MB`,
    },
    {
      name: 'Version',
      details: `${data?.minioDetails?.spec?.config?.versionTag}`,
    },
    {
      name: 'Access Key',
      details: data?.minioConnectionDetails?.secrets?.accessKey,
    },
    {
      name: 'Secret Key',
      details: data?.minioConnectionDetails?.secrets?.secretKey,
    },
    {
      name: 'Endpoint',
      details: (
        <>
          <EuiLink
            target="_blank"
            href={data?.minioConnectionDetails?.envs?.MINIO_EXTERNAL_ENDPOINT}
            external>
            {data?.minioConnectionDetails?.envs?.MINIO_EXTERNAL_ENDPOINT}
          </EuiLink>
        </>
      ),
    },
  ];
  const postgresqlDetails = [
    {
      name: 'Internal ID',
      details: data?.postgresqlDetails?.appId,
    },
    {
      name: 'Region',
      details: data?.postgresqlDetails?.spec?.config?.deployment?.region,
    },
    {
      name: 'Replicas',
      details: data?.postgresqlDetails?.spec?.config?.deployment?.replicas,
    },
    {
      name: 'Storage Size',
      details: `${data?.postgresqlDetails?.spec?.config?.deployment?.storageSize} MB`,
    },
    {
      name: 'Version',
      details: `${data?.postgresqlDetails?.spec?.config?.versionTag}`,
    },
    {
      name: 'Database',
      details: data?.postgresqlConnectionDetails?.secrets?.database,
    },
    {
      name: 'Username',
      details: data?.postgresqlConnectionDetails?.secrets?.username,
    },
    {
      name: 'Password',
      details: data?.postgresqlConnectionDetails?.secrets?.password,
    },
    {
      name: 'URI',
      details: data?.postgresqlConnectionDetails?.envs?.POSTGRES_URI,
    },
    {
      name: 'Admin Username',
      details: data?.postgresqlConnectionDetails?.secrets?.adminUsername,
    },
    {
      name: 'Admin Password',
      details: data?.postgresqlConnectionDetails?.secrets?.adminPassword,
    },
    {
      name: 'Admin URI',
      details: data?.postgresqlConnectionDetails?.envs?.POSTGRES_URI_ADMIN,
    },
  ];

  const [backupsFinished, setBackupsFinished] = useState(true);
  useEffect(() => {
    setBackupsFinished(() =>
      data?.backups?.every(function (item) {
        return item?.status !== 'scheduled' && item?.status !== 'in-progress';
      })
    );
  }, [data?.backups]);

  const resourcesHealth = [
    {
      _id: 1,
      details: data,
      resource: `Service`,
      health:
        serviceHealth === 200
          ? data?.serviceDetails?.servicePaused === false
            ? 200
            : 0
          : serviceHealth,
    },
    {
      _id: 2,
      details: data,
      resource: `MinIO`,
      health:
        data?.minioDetails?.status === 'running'
          ? 200
          : !data?.minioDetails?.status
          ? 0
          : minioHealth,
    },
    {
      _id: 3,
      details: data,
      resource: `PostgreSQL`,
      health:
        data?.postgresqlDetails?.status === 'running'
          ? 200
          : !data?.postgresqlDetails?.status
          ? 0
          : pHealth,
    },
  ];

  const columnsDeploymentStatus = [
    {
      field: 'resource',
      name: 'Resource',
      // eslint-disable-next-line react/display-name
      render: item => <span>{item}</span>,
    },
    {
      field: 'health',
      name: 'Status',
      // eslint-disable-next-line react/display-name
      render: health =>
        health === 200 ? (
          <EuiHealth color={'success'}>{'Online'}</EuiHealth>
        ) : health > 0 && health < 50 ? (
          <>
            <EuiLoadingSpinner size="s" />
            {'  In progress'}
          </>
        ) : (
          <>
            <EuiHealth color={'danger'}>{'Offline'}</EuiHealth>
          </>
        ),
    },
  ];

  const columnsBackup = [
    {
      name: 'Completed At',
      // eslint-disable-next-line react/display-name
      render: data => (
        <span>
          {data?.completedAt
            ? moment(data.completedAt).format('MMMM Do YYYY, h:mm:ss a')
            : 'Not completed'}
        </span>
      ),
    },
    {
      field: 'status',
      name: 'Status',
      // eslint-disable-next-line react/display-name
      render: item =>
        item === 'in-progress' ? (
          <>
            <EuiLoadingSpinner size="s" />
            {'  In progress'}
          </>
        ) : item === 'completed' ? (
          <EuiHealth color={'success'}>{'Completed'}</EuiHealth>
        ) : (
          item === 'scheduled' && (
            <EuiHealth color={'warning'}>{'Starting soon'}</EuiHealth>
          )
        ),
    },
    {
      field: 'config',
      name: 'Size',
      // eslint-disable-next-line react/display-name
      render: item => (
        <span>
          {item?.size ? `${(item.size / 1000).toFixed(2)} MB` : `...`}
        </span>
      ),
    },
    {
      field: 'restores',
      name: 'Last Restored',
      // eslint-disable-next-line react/display-name
      render: item => (
        <span>
          {item?.length > 0 ? (
            item?.[0]?.status === 'in-progress' ? (
              <>
                <EuiLoadingSpinner size="s" />
                {'  In progress'}
              </>
            ) : (
              item?.[0]?.status === 'completed' &&
              moment(item[0].restoreTimestamp).format('MMMM Do YYYY, h:mm:ss a')
            )
          ) : (
            `Never`
          )}
        </span>
      ),
    },
    {
      name: 'Actions',
      // eslint-disable-next-line react/display-name
      render: item => (
        <>
          <EuiFlexGroup
            responsive={false}
            wrap
            gutterSize="s"
            alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                size="s"
                disabled={!backupsFinished}
                onClick={async () => {
                  setBackupsFinished(false);
                  await restoreAddon({
                    projectName: data?.projectName,
                    addonId: data?.postgresqlDetails?.id,
                    backupId: item?.id,
                  });
                }}>
                Restore
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                color={'danger'}
                size="s"
                disabled={!backupsFinished}
                onClick={async () => {
                  setBackupsFinished(false);
                  await deleteAddonBackup({
                    projectName: data?.projectName,
                    addonId: data?.postgresqlDetails?.id,
                    backupId: item?.id,
                  });
                }}>
                Delete
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      ),
    },
  ];

  const columnsSetupStatus = [
    {
      field: 'step',
      name: 'Step',
      // eslint-disable-next-line react/display-name
      render: item => <span>{item}</span>,
    },
    {
      name: 'Status',
      // eslint-disable-next-line react/display-name
      render: item =>
        healthCodes.find(x => x.code === item?.health)?.color === 'spinner' ? (
          <>
            <EuiLoadingSpinner size="s" />
            {`\xa0\xa0${healthCodes.find(x => x.code === item?.health)?.text}`}
          </>
        ) : item?.health >= 400 || item?.health === null ? (
          <EuiHealth color={healthCodes.find(x => x.code === 500)?.color}>
            {healthCodes.find(x => x.code === 500)?.text} {item?.message}
          </EuiHealth>
        ) : (
          <EuiHealth
            color={healthCodes.find(x => x.code === item?.health)?.color}>
            {healthCodes.find(x => x.code === item?.health)?.text}
          </EuiHealth>
        ),
    },
  ];

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

  const tabs = [
    {
      id: 'setup',
      name: 'Setup Progress',
      content: (
        <Fragment>
          <EuiSpacer />
          <EuiTitle size="s">
            <h1>Setup Progress</h1>
          </EuiTitle>
          {!data ? (
            <EuiLoadingContent lines={6} />
          ) : (
            <EuiBasicTable
              items={data.progress}
              columns={columnsSetupStatus}
              rowProps={getRowProps}
              cellProps={getCellProps}
            />
          )}
        </Fragment>
      ),
    },
    {
      id: 'health',
      name: 'Connection Details',
      content: (
        <Fragment>
          <EuiSpacer />
          <EuiTitle size="s">
            <h1>Service</h1>
          </EuiTitle>
          {!data ? (
            <EuiLoadingContent lines={3} />
          ) : (
            <EuiBasicTable
              items={serviceDetails}
              itemId="_id"
              columns={connectionDetailsColumns}
              rowProps={getRowProps}
              cellProps={getCellProps}
            />
          )}
          <EuiSpacer />
          <EuiTitle size="s">
            <h1>MinIO</h1>
          </EuiTitle>
          {!data ? (
            <EuiLoadingContent lines={3} />
          ) : (
            <EuiBasicTable
              items={minioDetails}
              itemId="_id"
              columns={connectionDetailsColumns}
              rowProps={getRowProps}
              cellProps={getCellProps}
            />
          )}
          <EuiSpacer />
          <EuiTitle size="s">
            <h1>PostgreSQL</h1>
          </EuiTitle>
          {!data ? (
            <EuiLoadingContent lines={3} />
          ) : (
            <EuiBasicTable
              items={postgresqlDetails}
              itemId="_id"
              columns={connectionDetailsColumns}
              rowProps={getRowProps}
              cellProps={getCellProps}
            />
          )}
        </Fragment>
      ),
    },
    {
      id: 'backups',
      name: 'Backup and Restore',
      content: (
        <Fragment>
          <EuiSpacer />
          <EuiFlexGroup
            responsive={false}
            wrap
            gutterSize="s"
            alignItems="center">
            <EuiFlexItem alignItems={'right'} grow={false}>
              <EuiTitle size="s">
                <h1>Backup and Restore</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                size="s"
                disabled={!backupsFinished}
                onClick={async () => {
                  setBackupsFinished(false);
                  await backupAddon({
                    projectName: data?.projectName,
                    addonId: data?.postgresqlDetails?.id,
                  });
                }}>
                Perform Backup
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          {!data ? (
            <EuiLoadingContent lines={3} />
          ) : (
            <EuiBasicTable
              items={data.backups}
              itemId="id"
              columns={columnsBackup}
              rowProps={getRowProps}
              cellProps={getCellProps}
            />
          )}
        </Fragment>
      ),
    },
    {
      id: 'logs',
      name: 'Logs and Metrics',
      content: (
        <Fragment>
          <EuiSpacer />

          <EuiTitle size="s">
            <h1>Logs and Metrics</h1>
          </EuiTitle>
          <EuiSpacer />

          {!data ? (
            <EuiLoadingContent lines={3} />
          ) : (
            <>
              <Charts />
              <EuiSpacer />
              <EuiFlexItem>
                <EuiText>
                  <pre>
                    {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
                    <code>
                      {`[2021-08-26T12:19:26.412Z] debug GET /assets/images/group_people_1.png (10 ms) 200
[2021-08-26T12:19:26.410Z] debug GET /assets/images/logo_login.png (10 ms) 200 
[2021-08-26T12:19:26.229Z] debug GET index.html (57 ms) 200 
[2021-08-26T10:17:43.873Z] info ⏳ Opening the admin panel...
[2021-08-26T10:17:43.868Z] debug HEAD /admin (15 ms) 200 Aug
[2021-08-26T12:19:26.412Z] stdout F │
[2021-08-26T12:19:26.412Z] stdout F
[2021-08-26T12:19:26.412Z] stdout F Aug 26 12:17:44.053
[2021-08-26T12:19:26.412Z] stdout F Create your first administrator 💻 
[2021-08-26T12:19:26.412Z] stdout F Aug 26 12:17:44.052`}
                    </code>
                  </pre>
                </EuiText>
              </EuiFlexItem>
            </>
          )}
        </Fragment>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>{data?.publicProjectName}</title>
      </Head>
      <EuiTitle size="l">
        <h1>{data?.publicProjectName}</h1>
      </EuiTitle>
      <EuiSpacer />
      {!data ? (
        <EuiLoadingContent lines={2} />
      ) : data?.serviceDetails?.servicePaused === true ? (
        <p>Strapi is offline</p>
      ) : (
        data?.serviceDetails?.servicePaused === false &&
        serviceHealth === 200 && (
          <p>
            Strapi is running on{' '}
            <EuiLink
              href={`https://${data?.serviceDetails?.ports?.[0]?.domains?.[0]?.name}`}
              target="_blank">
              https://{data?.serviceDetails?.ports?.[0]?.domains?.[0]?.name}
            </EuiLink>
          </p>
        )
      )}
      <EuiSpacer />
      <EuiTitle size="s">
        <h1>Overall Health</h1>
      </EuiTitle>
      {!data ? (
        <EuiLoadingContent lines={3} />
      ) : (
        <EuiBasicTable
          items={resourcesHealth}
          itemId="_id"
          columns={columnsDeploymentStatus}
          rowProps={getRowProps}
          cellProps={getCellProps}
        />
      )}
      <EuiSpacer />
      <EuiTabbedContent
        tabs={tabs}
        initialSelectedTab={tabs[0]}
        autoFocus="selected"
        onTabClick={tab => {
          console.log('clicked tab', tab);
        }}
      />
    </>
  );
};

const backupAddon = async ({ projectName, addonId }) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/strapi/backup-addon`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectName: projectName, addonId: addonId }),
      }
    );
    const res = await response.json();
    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
  }
};

const deleteAddonBackup = async ({ projectName, addonId, backupId }) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/strapi/delete-addon-backup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectName,
          addonId: addonId,
          backupId: backupId,
        }),
      }
    );
    const res = await response.json();
    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
  }
};

const restoreAddon = async ({ projectName, addonId, backupId }) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/strapi/restore-addon-backup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectName,
          addonId: addonId,
          backupId: backupId,
        }),
      }
    );
    const res = await response.json();
    console.log(res);
    return res;
  } catch (error) {
    console.log(error);
  }
};

export default DeploymentInfo;
