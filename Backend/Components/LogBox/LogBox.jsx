import { ClockCircleOutlined } from '@ant-design/icons'
import { Timeline } from 'antd'
import moment from 'moment'
import React from 'react'
import './LogBox.scss'

class Logs extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  getColors = (status) => {
    if (status === 'Approved') {
      return '#4caf50'
    }

    if (status === 'Rejected') {
      return '#fa3729'
    }

    if (status === 'Returned') {
      return '#f56c00'
    }

    return '#194bed'
  }

  render() {
    const { logs } = this.props

    return (
      <div className="timeline-container">
        <Timeline mode="alternate">
          {logs.map((log, i) => {
            const color = this.getColors(log.status)

            return (
              <Timeline.Item
                key={i}
                dot={<ClockCircleOutlined className="timeline-clock-icon" style={{ color }} />}
                color={color}
                label={moment(log.createdAt).format('DD-MMM-YYYY hh:mm a')}>
                <div className={`timeline-list-container ${log.status}`} style={{ borderColor: color }}>
                  <div>
                    {' '}
                    <b>
                      {log.userData?.name} {log.status}
                    </b>{' '}
                    {log.entityType}
                  </div>
                  {log.reason && <div>{log.reason}</div>}
                </div>
              </Timeline.Item>
            )
          })}
        </Timeline>
      </div>
    )
  }
}

export default Logs
