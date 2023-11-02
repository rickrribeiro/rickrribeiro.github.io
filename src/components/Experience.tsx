import React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import ExperienceCard from './ExperienceCard';
import { experiences } from '@/data/data';

const Index: React.FC = () => {
  return (
    <div id="experience" className="flex flex-col justify-center items-center relative z-1">
      <div className="flex flex-col justify-center items-center w-full max-w-1350 py-12 gap-4 md:py-16">
        <h1 className="text-4xl font-semibold text-center mt-5 md:mt-3">Experience</h1>
        <p className="text-lg text-center max-w-lg text-gray-500">
          My work experience as a software engineer and working on different companies and projects.
        </p>
        <div className="w-full max-w-2xl mt-4">
          <Timeline>
            {experiences.map((experience, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot variant="outlined" color="secondary" />
                  {index !== experiences.length - 1 && <TimelineConnector style={{ background: '#854CE6' }} />}
                </TimelineSeparator>
                <TimelineContent className="py-3 px-2">
                  <ExperienceCard experience={experience} />
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </div>
    </div>
  );
};

export default Index;
