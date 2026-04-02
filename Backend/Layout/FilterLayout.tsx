import { FunnelPlotOutlined } from '@ant-design/icons'
import { Layout } from 'antd'
import { getIn } from 'formik'
import React, { ReactElement } from 'react'
import Button from '../Components/Button'
import { validateAccess } from '../Util/Util'
import TableLayout from './TableLayout'

const { Sider, Content } = Layout

type TFilterLayout = {
  children: ReactElement<TFilterLayoutProps> | ReactElement<TFilterLayoutProps>[]
  filter: ReactElement<TFilterLayoutProps>
  addButton?: {
    title: string
    onClick: () => void
    access: string
  }
} & TFilterLayoutProps

type TFilterLayoutProps = {
  filterData?: Record<string, unknown>
}

export default function FilterLayout({ filter, filterData, addButton, children }: TFilterLayout) {
  const responsiveFilter = () => {
    const x = document.getElementById('mobile-sider-menu')

    if (x) {
      if (x.style.display === 'block') {
        x.style.display = 'none'
      } else {
        x.style.display = 'block'
      }
    }
  }

  const AddButton = () =>
    addButton ? (
      validateAccess(addButton.access) ? (
        <Button onClick={addButton.onClick} variant="primary" className="btn-block">
          <i className="flaticon-plus" /> {addButton.title}
        </Button>
      ) : null
    ) : null

  const FilterComponent = filter && React.cloneElement(filter, { ...(filterData && { filterData }) })

  return (
    <Layout className="app-sidebar">
      <div className="mobile-filter">
        <Button>
          <FunnelPlotOutlined onClick={responsiveFilter} />
        </Button>
      </div>
      <Sider width={230} trigger={null} collapsible collapsed={false} id="mobile-sider-menu">
        {addButton ? (
          <div className="filter-section">
            <AddButton />
            {FilterComponent}
          </div>
        ) : (
          FilterComponent
        )}
      </Sider>
      <Layout className="site-layout">
        <Content className="site-layout-background">
          {React.Children.map(children, (child) => {
            if (getIn(child?.type, 'name') === TableLayout.name) {
              return React.cloneElement(child, {
                ...{ filterData, addButton: AddButton }
              })
            }

            return child
          })}
        </Content>
      </Layout>
    </Layout>
  )
}
