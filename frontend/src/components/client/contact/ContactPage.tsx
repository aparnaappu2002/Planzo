import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-6">
      <header className="text-center mb-12 bg-yellow-200 py-6 px-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-5xl font-extrabold text-yellow-900">Contact Planzo</h1>
        <p className="text-lg text-yellow-700 mt-2">We're here to help with your event management needs.</p>
      </header>

      <div className="bg-yellow-50 rounded-xl shadow-xl p-8 max-w-lg w-full border border-yellow-400">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">Get in Touch</h2>
          <p className="text-yellow-700">
            For inquiries, support, or feedback, reach out to us at:
            <a href="mailto:admin@gmail.com" className="text-yellow-600 hover:underline ml-1 font-medium">
              admin@gmail.com
            </a>
          </p>
        </div>
      </div>

      
    </div>
  );
};

export default ContactPage;