import React from 'react'
import BlockChainFlow from './BlockChainFlow'
import './BlockExplorerBox.scss'

class BlockExplorerBox extends React.PureComponent {
  render() {
    if (this.props.visible) {
      return this.props.layout ? (
        <div className="blockchain-explorer-holder">
          <div className="explorer-box-header">
            <span>Block Chain Explorer</span>
            <i onClick={this.props.onCancel} className="flaticon-delete close-popup" />
          </div>
          <div className="animate-blocks-container">
            <BlockChainFlow blockData={this.props.visible} />
          </div>
        </div>
      ) : (
        <BlockChainFlow blockData={this.props.visible} />
      )
    }

    return null
  }
}

export default BlockExplorerBox
