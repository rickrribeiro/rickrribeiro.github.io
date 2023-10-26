/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
// import Header from './Header'
import { FaLinkedin, FaInstagram, FaGithubSquare, FaHome, FaLaptopCode, FaRegFileCode, FaBrain } from 'react-icons/fa';
import image from '@/public/profile.png'

const SideBar = ({ children }: any) => {

  const [path, setPath] = useState("")

  useEffect(() => {
    console.log("bbbb"+window.location.pathname)
    console.log(image)
    setPath(window.location.pathname)
  
  }, [])
  
  let pages = {
    Home: {
      path: '/',
      icon: FaHome
    },
    Projects: {
      path: '/projects',
      icon: FaLaptopCode
    },
    CV: {
      path: '/cv',
      icon: FaRegFileCode
    },
    Articles: {
      path: '/articles',
      icon: FaBrain
    }
  }
  
  return (
    <>
      <header className="tm-header" id="tm-header">
        <div className="tm-header-wrapper">
            <button className="navbar-toggler" type="button" aria-label="Toggle navigation">
                <i className="fas fa-bars"></i>
            </button>
            <div className="tm-site-header">
                <div className="mb-3 mx-auto tm-site-logo">
                  <img
                    src={image.src}
                    alt=""
              
                  />
                </div>            
                <h1 className="text-center">Ricardo Ribeiro</h1>
            </div>
            <nav className="tm-nav" id="tm-nav">            
                <ul>
                  {
                    Object.entries(pages).map(([key, value]) => (
                      <li className={"tm-nav-item "+(path===value.path?"active":"")} key={key}>
                        <Link href={value.path} className="tm-nav-link">
                          <div className='mr-4'>
                            <value.icon />
                          </div>
                          {key}
                        </Link>
                      </li>
                    ))
                  }
                </ul>
            </nav>
            <div className="tm-mb-65">
                <a  href="https://linkedin.com/in/rickrribeiro" className="tm-social-link" target='_blank' rel="noreferrer">
                    <FaLinkedin/>
                </a>
              
                <a href="https://instagram.com/rickrribeiro" className="tm-social-link" target='_blank' rel="noreferrer">
                    <FaInstagram />
                </a>
                <a href="https://github.com/rickrribeiro" className="tm-social-link" target='_blank' rel="noreferrer">
                   <FaGithubSquare/>
                </a>
            </div>
            <p className="tm-mb-80 pr-5 text-white">
               eae
            </p>
        </div>
    </header>
    </>
  )
}

export default SideBar
