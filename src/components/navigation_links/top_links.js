import React from 'react';
import { EuiIcon, EuiSideNavItemType } from '@elastic/eui';

export const buildTopLinks = makeAction => [
  {
    id: 'favourites',
    name: 'Frequently used',
    icon: <EuiIcon type="managementApp" />,
    items: [
      {
        id: 'new_deployment',
        name: 'New deployment',
        onClick: makeAction('/new-deployment'),
        icon: <EuiIcon type="addDataApp" />,
      },
    ],
  },
];
