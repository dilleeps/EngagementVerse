import moment from 'moment'
import React from 'react'
import blockchainExecutionImg from '../../assets/images/block-explorer/blockchain-execution.svg'
import broadcastTransactionalProposalImg from '../../assets/images/block-explorer/broadcast-transactional-proposal.svg'
import consensusReachedImg from '../../assets/images/block-explorer/consensus-reached.svg'
import invoiceReceivedImg from '../../assets/images/block-explorer/invoice-received.svg'
import invoiceSentImg from '../../assets/images/block-explorer/invoice-sent.svg'
import invoiceTransmittedImg from '../../assets/images/block-explorer/invoice-transmitted.svg'
import mspVerificationImg from '../../assets/images/block-explorer/msp-verification.svg'
import parseXmlImg from '../../assets/images/block-explorer/parse-xml.svg'
import './BlockExplorerBox.scss'

class BlockChainFlow extends React.PureComponent {
  render() {
    const { blockData } = this.props

    return (
      <div>
        <div className="blockchain-transmission">
          <div className="details">
            <h3>Transmission Sent Id:</h3>
            <div className="transaction-code">{blockData.transmissionSentId}</div>
            <div className="date-and-time">
              at {moment(blockData.transmissionSentDate).format('DD-MMM-YYYY HH:mm:ss')}
            </div>
          </div>
          {blockData && blockData.transmissionReceivedId && (
            <div className="details">
              <div className="trasmission-received" style={{ padding: '0 50px', paddingBottom: 37 }}>
                <i
                  onClick={this.props.onCancel}
                  className="flaticon-arrow-pointing-to-right"
                  style={{ float: 'right', fontSize: 14, cursor: 'pointer' }}
                />
              </div>
            </div>
          )}
          {blockData && blockData.transmissionReceivedId && (
            <div className="details">
              <div style={{ textAlign: 'center', padding: 10 }}>
                <h3>Transmission Received Id:</h3>
                <div className="transaction-code">{blockData.transmissionReceivedId}</div>
                <div className="date-and-time">
                  at {moment(blockData.transmissionReceivedDate).format('DD-MMM-YYYY HH:mm:ss')}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="block-explorer-view">
          <div className="list-box animate fadeUp">
            <div className="details">
              <div className="status">
                <i className="flaticon-tick-1" />
                <p>Invoice {blockData.invoiceNo}</p>
              </div>
              <div className="icon-with-chain">
                <div className="image-holder">
                  <img src={invoiceSentImg} alt="Invoice" />
                </div>
              </div>
            </div>
          </div>
          <div className="list-box animate fadeUp">
            <div className="details">
              <div className="status">
                <i className="flaticon-tick-1" />
                <p>MSP Verification</p>
              </div>
              <div className="icon-with-chain">
                <div className="image-holder">
                  <img src={mspVerificationImg} alt="Invoice" />
                </div>
              </div>
            </div>
          </div>
          <div className="list-box animate fadeUp">
            <div className="details">
              <div className="status">
                <i className="flaticon-tick-1" />
                <p>Parse XML</p>
              </div>
              <div className="icon-with-chain">
                <div className="image-holder">
                  <img src={parseXmlImg} alt="Invoice" />
                </div>
              </div>
            </div>
          </div>
          <div className="list-box animate fadeUp">
            <div className="details">
              <div className="status">
                <i className="flaticon-tick-1" />
                <p>Blockchain Execution Invoked</p>
              </div>
              <div className="icon-with-chain">
                <div className="image-holder">
                  <img src={blockchainExecutionImg} alt="Invoice" />
                </div>
              </div>
            </div>
          </div>
          <div className="list-box animate fadeUp">
            <div className="details">
              <div className="status">
                <i className="flaticon-tick-1" />
                <p>Broadcast transaction proposal</p>
              </div>
              <div className="icon-with-chain">
                <div className="image-holder">
                  <img src={broadcastTransactionalProposalImg} alt="Invoice" />
                </div>
              </div>
            </div>
          </div>
          <div className="list-box animate fadeUp">
            <div className="details">
              <div className="status">
                <i className="flaticon-tick-1" />
                <p>Consensus reached</p>
              </div>
              <div className="icon-with-chain">
                <div className="image-holder">
                  <img src={consensusReachedImg} alt="Invoice" />
                </div>
              </div>
            </div>
          </div>
          <div className="list-box animate fadeUp">
            <div className="details">
              <div className="status">
                <i className="flaticon-tick-1" />
                <p>Invoice Transmitted</p>
              </div>
              <div className="icon-with-chain">
                <div className="image-holder">
                  <img src={invoiceTransmittedImg} alt="Invoice" />
                </div>
              </div>
            </div>
          </div>

          {blockData && blockData.transmissionStatus === 'Approved' && (
            <div className="list-box animate fadeUp">
              <div className="details">
                <div className="status">
                  <i className="flaticon-tick-1" />
                  <p>Invoice Received</p>
                </div>
                <div className="icon-with-chain">
                  <div className="image-holder">
                    <img src={invoiceReceivedImg} alt="Invoice" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {blockData && blockData.transmissionStatus === 'Rejected' && (
            <div className="list-box animate fadeUp">
              <div className="details">
                <div className="status">
                  <i className="flaticon-tick-1" />
                  <p>Invoice Rejected</p>
                </div>
                <div className="icon-with-chain">
                  <div className="image-holder">
                    <img src={invoiceReceivedImg} alt="Invoice" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <br />
      </div>
    )
  }
}

export default BlockChainFlow
