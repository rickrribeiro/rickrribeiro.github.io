import { CloseRounded, GitHub, LinkedIn } from '@mui/icons-material';
import { Modal } from '@mui/material';
import React from 'react';

interface Member {
  img: string;
  name: string;
  github: string;
  linkedin: string;
}

interface Project {
  title: string;
  date: string;
  image: string;
  tags: string[];
  description: string;
  member?: Member[];
  github: string;
  webapp: string;
}

interface ModalProps {
  openModal: {
    state: boolean;
    project: Project | null;
  };
  setOpenModal: React.Dispatch<React.SetStateAction<{ state: boolean; project: Project | null }>>;
}

const ModalComponent: React.FC<ModalProps> = ({ openModal, setOpenModal }) => {
  const project = openModal?.project;

  return (
    <Modal open={true} onClose={() => setOpenModal({ state: false, project: null })}>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-white w-full max-w-screen-md p-8 rounded-lg">
          <CloseRounded
            className="absolute top-4 right-6 cursor-pointer"
            onClick={() => setOpenModal({ state: false, project: null })}
          />
          <img src={project?.image} className="w-full h-auto rounded-md mb-6" alt={project?.title} />
          <h1 className="text-3xl font-semibold text-primary mb-2">{project?.title}</h1>
          <p className="text-sm text-secondary mb-4">{project?.date}</p>
          <div className="flex flex-wrap mb-4">
            {project?.tags.map((tag, index) => (
              <span key={index} className="text-xs font-medium text-primary bg-primary-light rounded-full px-3 py-1 mr-2 mb-2">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-base text-primary mb-4">{project?.description}</p>
          {project?.member && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-primary mb-2">Members</h2>
              <div className="flex flex-col gap-2">
                {project?.member.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <img src={member.img} alt={member.name} className="w-12 h-12 rounded-full" />
                    <span className="text-base font-medium text-primary">{member.name}</span>
                    <a href={member.github} target="_blank" rel="noopener noreferrer">
                      <GitHub className="w-6 h-6 text-primary" />
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      <LinkedIn className="w-6 h-6 text-primary" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-4">
            <a href={project?.github} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:text-primary-dark">
              View Code
            </a>
            <a href={project?.webapp} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:text-primary-dark">
              View Live App
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalComponent;