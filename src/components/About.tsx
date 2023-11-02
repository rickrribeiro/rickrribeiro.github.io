import React from 'react';

const SocialMediaIcon = ({ children, href }: any) => {
  return (
    <a
      href={href}
      className="inline-block mx-4 text-2xl text-primary transition duration-200 ease-in-out hover:text-primary-dark"
    >
      {children}
    </a>
  );
};

const About = () => {
  return (
    <div className="text-center">
      <div>About</div>
      <div className="flex mt-4">
        <SocialMediaIcon href="#">Icon 1</SocialMediaIcon>
        <SocialMediaIcon href="#">Icon 2</SocialMediaIcon>
      </div>
    </div>
  );
};

export default About;
