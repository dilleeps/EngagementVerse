import React from 'react'
import { Link } from 'react-router-dom'
import invoice from '../assets/images/logo.png'

const NotFound = () => (
  <div className="page-not-found">
    <img src={invoice} alt="Nothing found" />
    <h1>Page Not Found</h1>
    <div>
      <Link className="btn-glow primary" to="/app/dashboard">
        <i className="flaticon-left-arrow-6" /> Go Back to Home
      </Link>
    </div>
  </div>
)

export default NotFound
