import React from 'react'
import SideBar from './SideBar'
// import Header from './Header'

const Layout = ({ children }: any) => {
  return (
    <>
      {/* <Header /> */}
   
        <SideBar />
        <div className="container-fluid">
        <main className="tm-main">
        {children}
        </main>
      </div>
    </>
  )
}

export default Layout
