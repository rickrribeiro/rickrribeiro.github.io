// import React, { useEffect, useState } from 'react'

// import { Layout } from '@/components'
// // import 'tailwindcss/'  QUALQUER COISA VOLTAR
// import type { AppProps } from 'next/app'
// export default function App({ Component, pageProps }: AppProps) {
//   return (
//     <Layout>
//       <Component {...pageProps} />
//     </Layout>
//   )
// }

import '@/styles/globals.css'
import { useEffect, useState } from "react";
import { darkTheme, lightTheme } from '@/utils/Theme';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import ProjectDetails from "@/components/ProjectDetails";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [openModal, setOpenModal] = useState({ state: false, project: null });


  useEffect(() => {
    // Code that relies on the document object can be placed here
    // This code will only run on the client-side after the component is mounted
  }, []);

  return (
    <div className={`bg-${darkMode ? darkTheme.bg : lightTheme.bg} h-screen overflow-x-hidden`}>
      {/* <Router> */}

      {/* <Navbar /> */}

      <div className="min-h-screen">
        <HeroSection />
        <div className="bg-gradient-to-b from-pink-100 to-purple-100 clip-path-[polygon(0 0, 100% 0, 100% 100%,30% 98%, 0 100%)]">
          <Skills />
          <Experience />
        </div>
        <Projects openModal={openModal} setOpenModal={setOpenModal} />
        <div className="bg-gradient-to-b from-blue-100 to-purple-100 clip-path-[polygon(0 0, 100% 0, 100% 100%,30% 98%, 0 100%)]">
          <Education />
          <Contact />
        </div>
      </div>
      <Footer />
      {openModal.state && <ProjectDetails openModal={openModal} setOpenModal={setOpenModal} />}

      {/* </Router> */}
    </div>
  );
}

export default App;
