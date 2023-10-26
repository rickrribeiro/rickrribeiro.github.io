

import React from 'react'
import SideBar from './SideBar'
// import Header from './Header'

const Footer = ({ children }: any) => {
  return (
    <>
      {/* <Header /> */}
      <footer className="row tm-row">
        <hr className="col-12"/>
        <div className="col-md-6 col-12 tm-color-gray">
            Design: <a rel="nofollow" target="_parent" href="https://templatemo.com" className="tm-external-link">TemplateMo</a>
        </div>
        <div className="col-md-6 col-12 tm-color-gray tm-copyright">
            Copyright 2020 Xtra Blog Company Co. Ltd.
        </div>
        </footer> 
    </>
  )
}

export default Footer
