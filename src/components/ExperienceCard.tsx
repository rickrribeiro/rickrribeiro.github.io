import React from 'react';


const ExperienceCard = ({ experience }) => {
  return (
    <div className="w-72 md:w-96 border border-blue-500 rounded-lg shadow-lg p-4 transition duration-300 ease-in-out transform hover:translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-4">
        <img src={experience.img} alt="Company Logo" className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-black" />
        <div className="flex flex-col">
          <div className="text-xl font-semibold text-gray-900">{experience.role}</div>
          <div className="text-sm font-medium text-gray-700">{experience.company}</div>
          <div className="text-xs font-normal text-gray-600">{experience.date}</div>
        </div>
      </div>
      <div className="mt-4">
        {experience?.desc && (
          <p className="overflow-hidden line-clamp-4 text-sm md:text-base text-gray-700">{experience.desc}</p>
        )}
        {experience?.skills && (
          <div className="mt-2">
            <b>Skills:</b>
            <div className="flex flex-wrap gap-2 mt-1">
              {experience?.skills?.map((skill, index) => (
                <div key={index} className="text-sm md:text-base text-gray-700">
                  • {skill}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {experience.doc && (
        <a href={experience.doc} target="_blank" rel="noopener noreferrer">
          <img src={experience.doc} alt="Document" className="h-16 w-auto mt-4 cursor-pointer hover:opacity-80" />
        </a>
      )}
    </div>
  );
};

export default ExperienceCard;
