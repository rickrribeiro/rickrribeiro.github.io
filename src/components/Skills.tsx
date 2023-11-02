import React from 'react';
import { skills } from '@/data/data';

const Skills = () => {
  return (
    <div className="flex flex-col justify-center items-center relative z-10">
      <div className="relative flex justify-between items-center flex-col w-full max-w-1100 gap-12 md:flex-col">
        <h1 className="text-4xl font-semibold text-center md:text-3xl mt-8 text-primary">Skills</h1>
        <p className="text-lg text-center max-w-lg text-secondary md:text-base mt-4">Here are some of my skills on which I have been working for the past 2 years.</p>
        <div className="w-full flex flex-wrap justify-center mt-8 gap-12">
          {skills.map((skill, index) => (
            <div key={index} className="w-full max-w-md bg-card border border-purple-600 shadow-lg rounded-xl p-6 md:w-96">
              <h2 className="text-xl font-semibold text-secondary text-center mb-4">{skill.title}</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {skill.skills.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center bg-primary80 border border-primary80 rounded-lg px-4 py-2 text-primary text-sm">
                    <img src={item.image} alt={item.name} className="w-6 h-6 mr-2" />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
