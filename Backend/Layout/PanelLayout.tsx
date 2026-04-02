import React, { ReactNode } from 'react'

type TPanelLayout = {
  title: string
  children: ReactNode
}

export default function PanelLayout({ title, children }: TPanelLayout) {
  return (
    <div className="panel-layout">
      {title && (typeof title === 'string' ? <h2 className="panel-title">{title}</h2> : title)}
      {children}
    </div>
  )
}
