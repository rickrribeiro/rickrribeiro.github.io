import React from 'react';

interface Education {
  img: string;
  school: string;
  degree: string;
  date: string;
  grade: string;
  desc: string;
}

const EducationCard: React.FC<{ education: Education }> = ({ education }) => {
  return (
    <div className="w-96 rounded-lg shadow-lg p-4 flex flex-col gap-4 transition-transform duration-300 ease-in-out transform hover:translate-y-[-5px] hover:shadow-md hover:bg-gray-50 border border-purple-600">
      <div className="flex gap-4">
        <img src={education.img} alt="School Logo" className="h-12 w-12 object-cover rounded-lg" />
        <div className="flex flex-col">
          <div className="text-xl font-semibold text-purple-900">{education.school}</div>
          <div className="text-base font-medium text-gray-700">{education.degree}</div>
          <div className="text-sm text-gray-500">{education.date}</div>
        </div>
      </div>
      <div className="text-base font-medium text-gray-700">
        <b>Grade:</b> {education.grade}
      </div>
      <div className="text-sm text-gray-700 overflow-hidden line-clamp-4">
        {education.desc}
      </div>
    </div>
  );
};

export default EducationCard;
