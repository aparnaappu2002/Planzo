import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-6">
      <header className="text-center mb-12 bg-yellow-200 py-6 px-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-5xl font-extrabold text-yellow-900">About Planzo</h1>
        <p className="text-lg text-yellow-700 mt-2">Your ultimate event management solution.</p>
      </header>

      <div className="bg-yellow-50 rounded-xl shadow-xl p-8 max-w-lg w-full border border-yellow-400">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">Our Story</h2>
          <p className="text-yellow-700 mb-4">
            Planzo is a cutting-edge event management application designed to simplify the way you organize and execute events. Founded in 2023, our platform helps individuals and businesses create memorable experiences with ease.
          </p>
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">Our Mission</h2>
          <p className="text-yellow-700 mb-4">
            To empower event planners worldwide with intuitive tools that streamline planning, coordination, and engagement, ensuring every event is a success.
          </p>
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">Why Choose Planzo?</h2>
          <ul className="list-disc list-inside text-yellow-700">
            <li>User-friendly interface</li>
            <li>Comprehensive features for all event types</li>
            <li>Real-time collaboration</li>
            <li>Secure and reliable</li>
          </ul>
        </div>
      </div>

      
    </div>
  );
};

export default AboutPage;