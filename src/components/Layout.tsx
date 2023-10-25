import React from 'react'
import SideBar from './SideBar'
// import Header from './Header'

const Layout = ({ children }: any) => {
  return (
    <>
      {/* <Header /> */}
      <SideBar />
      {children}
    </>
  )
}

export default Layout
