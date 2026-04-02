import React from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import ButtonBox from '../ButtonBox/ButtonBox'
import './ConfirmationBox.scss'

export default function ConfirmationBox(
  { title, description, acceptText, acceptFn, acceptText1, acceptFn1, canelText, cancelFn },
  onAcceptFn,
  onCancelFn
) {
  return confirmAlert({
    closeOnClickOutside: false,
    customUI: ({ onClose }) => (
      <div className="confirmation-container">
        <h1>{title}</h1>
        <h3>{description}</h3>
        <div style={{ paddingTop: 10 }}>
          <ButtonBox
            style={{ marginRight: 10 }}
            type="secondary"
            onClick={() => {
              if (onCancelFn) {
                onCancelFn()
              } else {
                cancelFn?.cancelFn()
              }

              onClose()
            }}>
            {canelText || 'No'}
          </ButtonBox>
          {acceptFn1 && (
            <ButtonBox
              style={{ marginRight: 10 }}
              onClick={() => {
                acceptFn1()
                onClose()
              }}>
              {acceptText1 || 'Yes'}
            </ButtonBox>
          )}
          <ButtonBox
            onClick={() => {
              if (onAcceptFn) {
                onAcceptFn()
              } else {
                acceptFn()
              }

              onClose()
            }}>
            {acceptText || 'Yes'}
          </ButtonBox>
        </div>
      </div>
    )
  })
}
