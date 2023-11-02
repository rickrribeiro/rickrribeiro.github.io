import React, { useState } from 'react';
import ProjectCard from './ProjectCards';
import { projects } from '@/data/data';

const Projects: React.FC<{ openModal: Function; setOpenModal: Function }> = ({ openModal, setOpenModal }) => {
  const [toggle, setToggle] = useState<string>('all');

  return (
    <div className="bg-gradient-to-b from-white to-purple-200 min-h-screen">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-semibold text-center mb-8">Projects</h1>
        <p className="text-lg text-center max-w-2xl mx-auto mb-8">
          I have worked on a wide range of projects. From web apps to android apps. Here are some of my projects.
        </p>
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            className={`${toggle === 'all' ? 'bg-purple-500 text-white' : 'bg-white text-purple-500'
              } py-2 px-4 rounded-full border border-purple-500 hover:bg-purple-500 hover:text-white transition duration-300`}
            onClick={() => setToggle('all')}
          >
            All
          </button>
          {/* Add similar buttons for other categories */}
        </div>
        <div className="flex flex-wrap justify-center -mx-4">
          {(toggle === 'all' ? projects : projects.filter((item) => item.category === toggle)).map((project) => (
            <ProjectCard key={project.id} project={project} openModal={openModal} setOpenModal={setOpenModal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
