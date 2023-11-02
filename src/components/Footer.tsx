
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Bio } from '@/data/data';

const Footer = () => {
  return (
    <div className="w-full py-8 flex justify-center bg-gradient-to-b from-gray-100 via-gray-50 to-white">
      <footer className="w-full max-w-screen-lg flex flex-col items-center space-y-4 p-4 text-primary">
        <h1 className="font-semibold text-xl text-primary">Rishav Chanda</h1>
        <nav className="w-full max-w-md flex flex-wrap justify-center gap-4 md:justify-between md:gap-8 text-lg">
          <a href="#about" className="text-primary hover:text-primary-dark transition duration-200">About</a>
          <a href="#skills" className="text-primary hover:text-primary-dark transition duration-200">Skills</a>
          <a href="#experience" className="text-primary hover:text-primary-dark transition duration-200">Experience</a>
          <a href="#projects" className="text-primary hover:text-primary-dark transition duration-200">Projects</a>
          <a href="#education" className="text-primary hover:text-primary-dark transition duration-200">Education</a>
        </nav>
        <div className="flex mt-4">
          <a href={Bio.linkedin} target="_blank" rel="noopener noreferrer" className="mr-2 text-primary hover:text-primary-dark transition duration-200">
            <LinkedInIcon />
          </a>
          <a href={Bio.insta} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition duration-200">
            <InstagramIcon />
          </a>
        </div>
        <p className="mt-6 text-sm text-soft2 text-center">&copy; 2023 Rishav Chanda. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Footer;
