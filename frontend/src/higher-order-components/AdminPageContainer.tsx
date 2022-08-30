import { Layout } from "antd"
import './AdminPageContainer.css'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from "../state/Store"
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { toggleSidebar } from "../state/features/layoutSlice"
import { Content } from "antd/lib/layout/layout"

const adminPageContainer = (component: JSX.Element, pageName: String) => {
  return () => {
    const collapsed = useSelector((state: RootState) => state.layout.sidebarCollapsed)
    const dispatch = useDispatch()
  
    const handleToggleSidebar = () => dispatch(toggleSidebar())

    return (
      <Layout>
        <Layout.Header className='page-header'>
          {collapsed
            ? <MenuUnfoldOutlined className='sidebar-toggle' onClick={handleToggleSidebar} />
            : <MenuFoldOutlined className='sidebar-toggle' onClick={handleToggleSidebar} />
          }
          <div className='page-name'>
            {pageName}
          </div>
        </Layout.Header>
        <Content id='content-gutter'>
          <div id='content-container'>
            {component}
          </div>
        </Content>
      </Layout>
    )
  }
}

export { adminPageContainer }