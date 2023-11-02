import React, { useRef, useState } from 'react';
// import emailjs from '@emailjs/browser';
// import { Snackbar } from '@mui/material';

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.current) {
      // emailjs.sendForm('service_tox7kqs', 'template_nv7k7mj', form.current, 'SybVGsYS52j2TfLbi')
      //   .then((result) => {
      //     setOpen(true);
      //     form.current.reset();
      //   }, (error) => {
      //     console.log(error.text);
      //   });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center relative z-1">
      <div className="flex flex-col items-center space-y-12 w-full max-w-5xl p-12">
        <div className="text-4xl font-semibold text-center text-primary mb-6">
          Contact
        </div>
        <div className="text-lg text-center max-w-lg text-secondary">
          Feel free to reach out to me for any questions or opportunities!
        </div>
        <form ref={form} onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-card rounded-lg shadow-md mt-8 space-y-6">
          <div className="text-2xl font-semibold text-primary mb-2">Email Me 🚀</div>
          <input
            type="email"
            placeholder="Your Email"
            name="from_email"
            className="w-full p-4 border border-text-secondary rounded-lg focus:border-primary outline-none"
            required
          />
          <input
            type="text"
            placeholder="Your Name"
            name="from_name"
            className="w-full p-4 border border-text-secondary rounded-lg focus:border-primary outline-none"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            name="subject"
            className="w-full p-4 border border-text-secondary rounded-lg focus:border-primary outline-none"
            required
          />
          <textarea
            placeholder="Message"
            rows={4}
            name="message"
            className="w-full p-4 border border-text-secondary rounded-lg focus:border-primary outline-none"
            required
          />
          <button
            type="submit"
            className="w-full p-4 bg-gradient-to-r from-primary to-secondary rounded-lg text-text-primary font-semibold"
          >
            Send
          </button>
        </form>
        {/* <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          message="Email sent successfully!"
          severity="success"
        /> */}
      </div>
    </div>
  );
};

export default Contact;
