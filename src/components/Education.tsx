import React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { education } from '@/data/data';
import EducationCard from './EducationCard';

const Index: React.FC = () => {
  return (
    <div id="education" className="flex flex-col justify-center items-center relative z-1 py-60 px-0 md:px-0">
      <div className="flex flex-col justify-between items-center w-full max-w-1350 pt-40 gap-12 md:flex-col">
        <div className="text-4xl font-semibold text-center text-primary md:text-3xl">
          Education
        </div>
        <div className="text-lg text-center max-w-600 text-secondary md:text-base">
          My education has been a journey of self-discovery and growth. My educational details are as follows.
        </div>
        <div className="w-full max-w-1000 mt-10 flex flex-col items-center justify-center gap-12 md:items-end">
          <Timeline>
            {education.map((edu, index) => (
              <TimelineItem key={index}>
                <TimelineContent className="py-12 px-2">
                  <EducationCard education={edu} />
                </TimelineContent>
                <TimelineSeparator>
                  <TimelineDot variant="outlined" color="secondary" />
                  {index !== education.length - 1 && (
                    <TimelineConnector className="bg-purple-600" />
                  )}
                </TimelineSeparator>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </div>
    </div>
  );
};

export default Index;
