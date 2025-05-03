// assets
import { IconDashboard, IconMap } from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconMap };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Map',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.IconMap,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
