import React from 'react'
import LoadingBar from 'react-top-loading-bar'

export const loaderRef = { barRef: null }

export default class TopLoaderBox extends React.Component {
  constructor() {
    super()
    this.state = {
      loader: false
    }
    this.myRef = React.createRef(null)
  }

  toggleLoader = (loader) => {
    this.setState({ loader })

    if (loader) {
      this.myRef.current.continuousStart()
    } else {
      this.myRef.current.complete()
    }
  }

  render() {
    const { loader } = this.state

    return (
      <div className={loader ? 'custom-loader-back-active' : 'custom-loader-back'}>
        <LoadingBar
          loaderSpeed={600}
          className="custom-loader"
          height={4}
          color="rgb(240, 90, 40, 0.6)"
          ref={this.myRef}
          shadow={false}
        />
      </div>
    )
  }
}
