import React from 'react';
import { adminPageContainer } from '../../higher-order-components/AdminPageContainer';

const Contents = () => {
  return (
    <div>
      This is the dashboard page
    </div>
  )
}

const DashboardPage = adminPageContainer(<Contents />, 'Dashboard')

export { DashboardPage }