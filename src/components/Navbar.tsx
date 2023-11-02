import React, { useState } from 'react';
import { DiCssdeck } from 'react-icons/di';
import { FaBars } from 'react-icons/fa';
import { Bio } from '@/data/data';
import { Link as LinkR } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // TODO - AJUSTE DE TEMA AQUI DPS 
  const theme = {
    bg: "#1C1C27",
    bgLight: "#1C1E27",
    primary: "#854CE6",
    text_primary: "#F2F3F4",
    text_secondary: "#b1b2b3",
    card: "#171721",
    card_light: '#191924',
    button: "#854CE6",
    white: "#FFFFFF",
    black: "#000000",
  }

  return (
    <nav className={`bg-${theme.card_light} h-20 flex items-center justify-center text-base sticky top-0 z-10 ${isOpen ? 'transition-all ease' : ''}`}>
      <div className="container mx-auto flex justify-between items-center h-16">
        <LinkR to="/" className="w-80% p-6 flex items-center text-white">
          <a className="flex items-center">
            <DiCssdeck size="3rem" className="mr-2" />
            <span className="font-bold text-xl">Portfolio</span>
          </a>
        </LinkR>
        <div className="block md:flex items-center gap-8 p-6">
          <a href="#about" className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary">
            About
          </a>
          <a href="#skills" className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary">
            Skills
          </a>
          <a href="#experience" className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary">
            Experience
          </a>
          <a href="#projects" className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary">
            Projects
          </a>
          <a href="#education" className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary">
            Education
          </a>
          <a href={Bio.github} target="_blank" className="border-2 border-primary rounded-full flex items-center justify-center h-14 px-8 font-medium text-primary hover:bg-primary hover:text-white hover:border-primary">
            Github Profile
          </a>
        </div>
        <div className="block md:hidden">
          <FaBars
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="text-primary text-2xl cursor-pointer"
          />
        </div>
        {isOpen && (
          <div
            className={`flex flex-col justify-center gap-4 absolute top-20 right-0 w-full p-3 md:p-10 bg-${theme.card_light}99 transition-all ease-in-out transform ${isOpen ? 'translate-y-0' : 'translate-y-100'
              } rounded-b-2xl shadow-md`}
          >
            <LinkR
              to="#about"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary"
            >
              About
            </LinkR>
            <LinkR
              to="#skills"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary"
            >
              Skills
            </LinkR>
            <LinkR
              to="#experience"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary"
            >
              Experience
            </LinkR>
            <LinkR
              to="#projects"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary"
            >
              Projects
            </LinkR>
            <LinkR
              to="#education"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
              className="text-base font-medium text-primary hover:text-primary hover:border-b-2 hover:border-primary"
            >
              Education
            </LinkR>
            <a
              href={Bio.github}
              target="_blank"
              className="border-2 border-primary rounded-full flex items-center justify-center h-14 px-8 font-medium text-primary hover:bg-primary hover:text-white hover:border-primary"
            >
              Github Profile
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
