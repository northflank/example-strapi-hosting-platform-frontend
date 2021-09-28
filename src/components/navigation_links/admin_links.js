import React from 'react';
import { EuiIcon, EuiSideNavItemType } from '@elastic/eui';

export const buildAdminLinks = makeAction => [
  {
    id: 'admin',
    name: 'Admin',
    icon: <EuiIcon type="managementApp" />,
    items: [
      {
        id: 'home',
        name: 'Home',
        onClick: makeAction('/'),
        icon: <EuiIcon type="dashboardApp" />,
      },
      {
        id: 'deployments',
        name: 'Deployments',
        onClick: makeAction('/deployments'),
        icon: <EuiIcon type="monitoringApp" />,
      },
      {
        id: 'new_deployment',
        name: 'New deployment',
        onClick: makeAction('/new-deployment'),
        icon: <EuiIcon type="addDataApp" />,
      },
    ],
  },
];
