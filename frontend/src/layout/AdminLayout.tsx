import { useMemo } from 'react'
import { HomeOutlined } from "@ant-design/icons"
import { LockOutlined, PartitionOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons/lib/icons"
import Layout from "antd/lib/layout/layout"
import Sider from "antd/lib/layout/Sider"
import Menu from "antd/lib/menu"
import { matchPath, Outlet } from "react-router-dom"
import './AdminLayout.css'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../state/Store'
import { useNavigate, useLocation } from 'react-router-dom'

const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const activeMenu = useMemo(() => {
    const menus = [
      { key: 'dashboard', path: '/admin' },
      { key: 'accounts', path: '/admin/accounts' },
      { key: 'locks', path: '/admin/locks' },
      { key: 'integrations', path: '/admin/integrations' },
      { key: 'configurations', path: '/admin/configuration' }
    ]

    const menu = menus.find(menu => Boolean(matchPath(menu.path, location.pathname)))

    return menu?.key
  }, [location])

  const collapsed = useSelector((state: RootState) => state.layout.sidebarCollapsed)

  const handleNavigateToPage = (path: string) => () => navigate(path)

  return (
    <Layout id='admin-layout'>
      <Sider collapsible collapsed={collapsed} trigger={null}>
        <div style={{ position: 'relative', height: '5rem' }}>
          <div className={`logo-container ${collapsed ? 'collapsed' : ''}`}>
            <img src='/smart-lock-logo-dark.png' alt='The smart lock system logo' />
            <div>Smart Lock System</div>
          </div>
        </div>
        <Menu
          theme='dark'
          mode='inline'
          defaultSelectedKeys={[activeMenu ?? '']}
          items={[
            {
              key: 'dashboard',
              icon: <HomeOutlined />,
              label: 'Dashboard',
              onClick: handleNavigateToPage('/admin/')
            },
            {
              key: 'accounts',
              icon: <UserOutlined />,
              label: 'Accounts',
              onClick: handleNavigateToPage('/admin/accounts')
            },
            {
              key: 'locks',
              icon: <LockOutlined />,
              label: 'Locks',
              onClick: handleNavigateToPage('/admin/locks')
            },
            {
              key: 'integrations',
              icon: <PartitionOutlined />,
              label: 'Integrations',
              onClick: handleNavigateToPage('/admin/integrations')
            },
            {
              key: 'configurations',
              icon: <SettingOutlined />,
              label: 'Configuration',
              onClick: handleNavigateToPage('/admin/configuration')
            }
          ]}
        />
      </Sider>
      <Layout>
        <Outlet />
      </Layout>
    </Layout>
  )
}

export { AdminLayout }