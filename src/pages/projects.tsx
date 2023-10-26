/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
// import Header from './Header'
import { FaLinkedin, FaInstagram, FaGithubSquare, FaHome, FaLaptopCode, FaRegFileCode, FaBrain } from 'react-icons/fa';
import image from '@/public/profile.png'

const SideBar = ({ children }: any) => {


  return (
    <>
        <main >
            <div className="row tm-row">
                <div className="col-12">
                    <form method="GET" className="form-inline tm-mb-80 tm-search-form">                
                        <input className="form-control tm-search-input" name="query" type="text" placeholder="Search..." aria-label="Search"/>
                        <button className="tm-search-button" type="submit">
                            <i className="fas fa-search tm-search-icon" aria-hidden="true"></i>
                        </button>                                
                    </form>
                </div>                
            </div>            
            <div className="row tm-row">
                <article className="col-12 col-md-6 tm-post">
                    <hr className="tm-hr-primary"/>
                    <a href="post.html" className="effect-lily tm-post-link tm-pt-60">
                        <div className="tm-post-link-inner">
                            <img src="img/img-01.jpg" alt="Image" className="img-fluid"/>                            
                        </div>
                        <span className="position-absolute tm-new-badge">New</span>
                        <h2 className="tm-pt-30 tm-color-primary tm-post-title">Simple and useful HTML layout</h2>
                    </a>                    
                    <p className="tm-pt-30">
                        There is a clickable image with beautiful hover effect and active title link for each post item. 
                        Left side is a sticky menu bar. Right side is a blog content that will scroll up and down.
                    </p>
                    <div className="d-flex justify-content-between tm-pt-45">
                        <span className="tm-color-primary">Travel . Events</span>
                        <span className="tm-color-primary">June 24, 2020</span>
                    </div>
                    <hr/>
                    <div className="d-flex justify-content-between">
                        <span>36 comments</span>
                        <span>by Admin Nat</span>
                    </div>
                </article>
                <article className="col-12 col-md-6 tm-post">
                    <hr className="tm-hr-primary"/>
                    <a href="post.html" className="effect-lily tm-post-link tm-pt-60">
                        <div className=" tm-post-link-inner">
                            <img src="img/img-02.jpg" alt="Image" className="img-fluid"/>                            
                        </div>
                        <span className="position-absolute tm-new-badge">New</span>
                        <h2 className="tm-pt-30 tm-color-primary tm-post-title">Multi-purpose blog template</h2>
                    </a>                    
                    <p className="tm-pt-30">
                        <a rel="nofollow noreferrer" href="https://templatemo.com/tm-553-xtra-blog" target="_blank">Xtra Blog</a>  is a multi-purpose HTML CSS template from TemplateMo website. 
                        Blog list, single post, about, contact pages are included. Left sidebar fixed width and content area is a fluid full-width.
                    </p>
                    <div className="d-flex justify-content-between tm-pt-45">
                        <span className="tm-color-primary">Creative . Design . Business</span>
                        <span className="tm-color-primary">June 16, 2020</span>
                    </div>
                    <hr/>
                    <div className="d-flex justify-content-between">
                        <span>48 comments</span>
                        <span>by Admin Sam</span>
                    </div>
                </article>
                <article className="col-12 col-md-6 tm-post">
                    <hr className="tm-hr-primary"/>
                    <a href="post.html" className="effect-lily tm-post-link tm-pt-20">
                        <div className="tm-post-link-inner">
                            <img src="img/img-03.jpg" alt="Image" className="img-fluid"/>
                        </div>
                        <h2 className="tm-pt-30 tm-color-primary tm-post-title">How can you apply Xtra Blog</h2>
                    </a>                    
                    <p className="tm-pt-30">
                        You are <u>allowed</u> to convert this template as any kind of CMS theme or template for your custom website builder. 
                        You can also use this for your clients. Thank you for choosing us.
                    </p>
                    <div className="d-flex justify-content-between tm-pt-45">
                        <span className="tm-color-primary">Music . Audio</span>
                        <span className="tm-color-primary">June 11, 2020</span>
                    </div>
                    <hr/>
                    <div className="d-flex justify-content-between">
                        <span>24 comments</span>
                        <span>by John Walker</span>
                    </div>
                </article>
                <article className="col-12 col-md-6 tm-post">
                    <hr className="tm-hr-primary"/>
                    <a href="post.html" className="effect-lily tm-post-link tm-pt-20">
                        <div className="tm-post-link-inner">
                            <img src="img/img-04.jpg" alt="Image" className="img-fluid"/>
                        </div>
                        <h2 className="tm-pt-30 tm-color-primary tm-post-title">A little restriction to apply</h2>
                    </a>                    
                    <p className="tm-pt-30">
                        You are <u>not allowed</u> to re-distribute this template as a downloadable ZIP file on any template collection
                        website. This is strongly prohibited as we worked hard for this template. Please contact TemplateMo for more information.
                		<br/>For example, <a href="https://www.free-css.com/free-css-templates/page272/xtra-blog" target="_blank" rel="noreferrer">Free-CSS</a> redistributed this Xtra Blog template on their website without asking any permission. It is an illegal act by Free-CSS website doing an unauthorized reposting.</p>
                    <div className="d-flex justify-content-between tm-pt-45">
                        <span className="tm-color-primary">Artworks . Design</span>
                        <span className="tm-color-primary">June 4, 2020</span>
                    </div>
                    <hr/>
                    <div className="d-flex justify-content-between">
                        <span>72 comments</span>
                        <span>by Admin Sam</span>
                    </div>
                </article>
                <article className="col-12 col-md-6 tm-post">
                    <hr className="tm-hr-primary"/>
                    <a href="post.html" className="effect-lily tm-post-link tm-pt-20">
                        <div className="tm-post-link-inner">
                            <img src="img/img-05.jpg" alt="Image" className="img-fluid"/>
                        </div>
                        <h2 className="tm-pt-30 tm-color-primary tm-post-title">Color hexa values of Xtra Blog</h2>
                    </a>                    
                    <p className="tm-pt-30">
                        If you wish to kindly support us, please contact us or contribute a small PayPal amount to info [at] templatemo.com that is helpful for us.
                        <br/>
                        Title #099 New #0CC <br/>
                        <span className="tm-color-primary">Text #999 Line #CCC Next #0CC Prev #F0F0F0</span>
                    </p>
                    <div className="d-flex justify-content-between tm-pt-45">
                        <span className="tm-color-primary">Creative . Video . Audio</span>
                        <span className="tm-color-primary">May 31, 2020</span>
                    </div>
                    <hr/>
                    <div className="d-flex justify-content-between">
                        <span>84 comments</span>
                        <span>by Admin Sam</span>
                    </div>
                </article>
                <article className="col-12 col-md-6 tm-post">
                    <hr className="tm-hr-primary"/>
                    <a href="post.html" className="effect-lily tm-post-link tm-pt-20">
                        <div className="tm-post-link-inner">
                            <img src="img/img-06.jpg" alt="Image" className="img-fluid"/>
                        </div>
                        <h2 className="tm-pt-30 tm-color-primary tm-post-title">Donec convallis varius risus</h2>
                    </a>                    
                    <p className="tm-pt-30">
                        Quisque id ipsum vel sem maximus vulputate sed quis velit. Nunc vel turpis eget orci elementum cursus vitae in eros. Quisque vulputate nulla ut dolor consectetur luctus.
                    </p>
                    <div className="d-flex justify-content-between tm-pt-45">
                        <span className="tm-color-primary">Visual . Artworks</span>
                        <span className="tm-color-primary">June 16, 2020</span>
                    </div>
                    <hr/>
                    <div className="d-flex justify-content-between">
                        <span>96 comments</span>
                        <span>by Admin Sam</span>
                    </div>
                </article>
            </div>
            <div className="row tm-row tm-mt-100 tm-mb-75">
                <div className="tm-prev-next-wrapper">
                    <a href="#" className="mb-2 tm-btn tm-btn-primary tm-prev-next disabled tm-mr-20">Prev</a>
                    <a href="#" className="mb-2 tm-btn tm-btn-primary tm-prev-next">Next</a>
                </div>
                <div className="tm-paging-wrapper">
                    <span className="d-inline-block mr-3">Page</span>
                    <nav className="tm-paging-nav d-inline-block">
                        <ul>
                            <li className="tm-paging-item active">
                                <a href="#" className="mb-2 tm-btn tm-paging-link">1</a>
                            </li>
                            <li className="tm-paging-item">
                                <a href="#" className="mb-2 tm-btn tm-paging-link">2</a>
                            </li>
                            <li className="tm-paging-item">
                                <a href="#" className="mb-2 tm-btn tm-paging-link">3</a>
                            </li>
                            <li className="tm-paging-item">
                                <a href="#" className="mb-2 tm-btn tm-paging-link">4</a>
                            </li>
                        </ul>
                    </nav>
                </div>                
            </div>            
           
        </main>
      
    </>
  )
}

export default SideBar
