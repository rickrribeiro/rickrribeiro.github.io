import React from 'react';

interface Project {
  image: string;
  tags?: string[];
  title: string;
  date: string;
  description: string;
  member?: { img: string }[];
}

interface ProjectCardsProps {
  project: Project;
  setOpenModal: React.Dispatch<React.SetStateAction<{ state: boolean; project: Project }>>;
}

const ProjectCards: React.FC<ProjectCardsProps> = ({ project, setOpenModal }) => {
  return (
    <div
      className="w-80 h-96 bg-card cursor-pointer rounded-lg shadow-lg overflow-hidden transition-transform duration-500 ease-in-out transform hover:translate-y-2 hover:shadow-xl hover:brightness-110"
      onClick={() => setOpenModal({ state: true, project: project })}
    >
      <img className="w-full h-48 object-cover rounded-t-lg" src={project.image} alt="Project" />
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {project.tags?.map((tag, index) => (
            <span key={index} className="text-sm font-medium text-primary bg-primary-light rounded-full px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-semibold text-text-secondary my-2 line-clamp-2">{project.title}</h2>
        <p className="text-xs font-normal text-text-secondary-80 mb-2 line-clamp-3">{project.description}</p>
        <div className="flex items-center">
          {project.member?.map((member, index) => (
            <img
              key={index}
              src={member.img}
              alt="Member"
              className="w-9 h-9 rounded-full border-white border-2 shadow-md -ml-2"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCards;
