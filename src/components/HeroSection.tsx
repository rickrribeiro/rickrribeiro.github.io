import React from 'react';
import HeroBgAnimation from './HeroBgAnimation';
import { Bio } from '@/data/data';
// todo  - fix aq a imagem
// TODO - FIX TODOS OS ../
// import HeroImg from '@/images/HeroImage.jpg';
import Typewriter from 'typewriter-effect';

const HeroSection: React.FC = () => {
  return (
    <div id="about" className="bg-card_light min-h-screen flex justify-center items-center relative">
      <div className="absolute top-0 right-0 bottom-0 left-0 max-w-screen-xl mx-auto px-6 lg:px-0 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl">
          <div id="Left" className="order-2 lg:order-1 text-center lg:text-left">
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-text_primary leading-tight">
              Hi, I am <br /> {Bio.name}
            </h1>
            <div className="font-semibold text-2xl md:text-3xl lg:text-4xl text-text_primary mb-6">
              I am a{' '}
              <span className="text-primary">
                <Typewriter
                  options={{
                    strings: Bio.roles,
                    autoStart: true,
                    loop: true,
                  }}
                />
              </span>
            </div>
            <div className="text-text_primary mb-8 text-lg md:text-xl lg:text-2xl">{Bio.description}</div>
            <a
              href={Bio.resume}
              target="display"
              className="block w-full max-w-md mx-auto px-8 py-4 text-white font-semibold rounded-full text-center bg-gradient-to-r from-primary to-primary-dark hover:scale-105 transform transition duration-300 ease-in-out"
            >
              Check Resume
            </a>
          </div>

          <div id="Right" className="order-1 lg:order-2">
            {/* <img
              src={HeroImg}
              alt="hero-image"
              className="rounded-full border-2 border-primary max-w-xs md:max-w-lg lg:max-w-xl"
            /> */}
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 bottom-0 left-0 z-0">
        <HeroBgAnimation />
      </div>
    </div>
  );
};

export default HeroSection;
