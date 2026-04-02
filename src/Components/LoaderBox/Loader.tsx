import loadable, { DefaultComponent } from '@loadable/component'
import { Col, Row, Skeleton, Space } from 'antd'
import React from 'react'
import FilterLayout from '../../Layout/FilterLayout'
import TableLayout from '../../Layout/TableLayout'
import TableBox from '../TableBox/TableBox'
import LoaderBox from './LoaderBox'

export function FullLoader<Props>(loadFn: (props: Props) => Promise<DefaultComponent<Props>>) {
  return loadable(loadFn, {
    fallback: <LoaderBox loader />
  })
}

export function HeaderLoader<Props>(loadFn: (props: Props) => Promise<DefaultComponent<Props>>) {
  return loadable(loadFn, {
    fallback: (
      <div className="main-header">
        <Row justify="center">
          <Col xs={{ span: 9 }} sm={{ span: 9 }} md={{ span: 6 }} lg={{ span: 3 }}>
            <div className="logo p-2 mt-1 bg-transparent">
              <Skeleton.Input active className="w-100" />
            </div>
          </Col>
          <Col xs={{ span: 14 }} sm={{ span: 14 }} md={{ span: 18 }} lg={{ span: 21 }}>
            <div className="container-menu">
              <Row>
                <Col
                  xs={{ span: 3 }}
                  sm={{ span: 3 }}
                  md={{ span: 8 }}
                  lg={{ span: 18 }}
                  className="default-menu-desktop">
                  <Space size="large" className="field-array w-75 p-2 m-1">
                    {[...Array(4)].map((item, i) => (
                      <Skeleton.Input key={i} active className="w-100" />
                    ))}
                  </Space>
                </Col>
                <Col xs={{ span: 0 }} sm={{ span: 0 }} md={{ span: 7 }} lg={{ span: 3 }}>
                  <div className="search p-2 mt-1">
                    <Skeleton.Input active className="w-100" />
                  </div>
                </Col>
                <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 9 }} lg={{ span: 3 }}>
                  <div className="right-profile-menu">
                    <ul>
                      <li className="p-2 mt-1">
                        <Skeleton.Avatar active />
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    )
  })
}

export function SideBarLoader<Props>(loadFn: (props: Props) => Promise<DefaultComponent<Props>>) {
  return loadable(loadFn, {
    fallback: (
      <FilterLayout
        filter={
          <div className="filter-section">
            <Space size="middle" direction="vertical" className="w-100">
              {[...Array(4)].map((item, i) => (
                <Skeleton.Input key={i} active className="w-100" />
              ))}
            </Space>
          </div>
        }>
        <TableLayout
          title={
            <h2 className="table-title">
              <Skeleton.Input active style={{ width: '200px' }} />
            </h2>
          }
          rightSection={<Skeleton.Input active style={{ width: '100px' }} />}>
          <div className="mt-2">
            <TableBox
              dataSource={[...Array(5)].map((_, index) => ({
                id: `key${index}`
              }))}
              columns={[...Array(5)].map((_, index) => ({
                title: <Skeleton title active paragraph={false} />,
                render: () => <Skeleton key={index} title active paragraph={false} />
              }))}
            />
          </div>
        </TableLayout>
      </FilterLayout>
    )
  })
}
