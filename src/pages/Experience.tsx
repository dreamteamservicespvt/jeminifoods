import React from 'react';
import { Link } from 'react-router-dom';

const Experience: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-amber-400 mb-6">Curated Experience</h1>
        <p className="text-lg text-gray-300 mb-8">
          Embark on a personalized dining journey at Jemini Foods. Our master sommelier ensures perfect wine pairings, while our chefs craft each course to your taste.
        </p>
        <img
          src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Curated Experience"
          className="w-full rounded-lg shadow-lg mb-8"
        />
        <p className="text-gray-300 mb-6">
          From intimate chef’s table events to exclusive tasting menus, every detail is tailored to create memories that last a lifetime.
        </p>
        <Link to="/" className="inline-block mt-4 text-amber-400 hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Experience;
