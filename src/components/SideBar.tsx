import React from 'react'
// import Header from './Header'
import { FaLinkedin, FaInstagram, FaGithubSquare } from 'react-icons/fa';
const SideBar = ({ children }: any) => {
  return (
    <>
      <header className="tm-header" id="tm-header">
        <div className="tm-header-wrapper">
            <button className="navbar-toggler" type="button" aria-label="Toggle navigation">
                <i className="fas fa-bars"></i>
            </button>
            <div className="tm-site-header">
                <div className="mb-3 mx-auto tm-site-logo"><i className="fas fa-times fa-2x"></i></div>            
                <h1 className="text-center">Ricardo Ribeiro</h1>
            </div>
            <nav className="tm-nav" id="tm-nav">            
                <ul>
                    <li className="tm-nav-item active"><a href="index.html" className="tm-nav-link">
                        <i className="fas fa-home"></i>
                        Home
                    </a></li>
                    <li className="tm-nav-item"><a href="post.html" className="tm-nav-link">
                        <i className="fas fa-pen"></i>
                        Projects
                    </a></li>
                    <li className="tm-nav-item"><a href="about.html" className="tm-nav-link">
                        <i className="fas fa-users"></i>
                        CV
                    </a></li>
                    <li className="tm-nav-item"><a href="contact.html" className="tm-nav-link">
                        <i className="far fa-comments"></i>
                        Articles
                    </a></li>
                </ul>
            </nav>
            <div className="tm-mb-65">
                <a  href="https://linkedin.com/in/rickrribeiro" className="tm-social-link">
                    <FaLinkedin/>
                </a>
              
                <a href="https://instagram.com/rickrribeiro" className="tm-social-link">
                    <FaInstagram />
                </a>
                <a href="https://github.com/rickrribeiro" className="tm-social-link">
                   <FaGithubSquare/>
                </a>
            </div>
            <p className="tm-mb-80 pr-5 text-white">
               This is my portfólio website
            </p>
        </div>
    </header>
    </>
  )
}

export default SideBar
