import clsx from 'clsx'
import React, { ReactNode } from 'react'

type TPanel = {
  title: string
  noBottom: boolean
  children: ReactNode
  bodyClassName?: string
  rightSection?: ReactNode
}

export default function Panel({ title, noBottom, bodyClassName, children, rightSection }: TPanel) {
  return (
    <div className={clsx('panel-design', noBottom && 'mb-0')}>
      {title && (
        <div className="panel-header">
          <h3>{title}</h3>
          <div style={{ position: 'absolute', right: 2, top: 10 }}>{rightSection}</div>
        </div>
      )}
      <div className={clsx('panel-body', bodyClassName)}>{children}</div>
    </div>
  )
}
