import React from 'react';
import { Link } from 'react-router-dom';

const Excellence: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-amber-400 mb-6">Michelin Excellence</h1>
        <p className="text-lg text-gray-300 mb-8">
          At Jemini Foods, we take pride in our Michelin-rated culinary creations. Since 2018, our commitment to innovation and unparalleled service has earned us the highest accolades in fine dining.
        </p>
        <img
          src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Michelin Excellence"
          className="w-full rounded-lg shadow-lg mb-8"
        />
        <p className="text-gray-300 mb-6">
          Our chefs blend tradition with modern techniques to present you with a dining experience that transcends expectations. Each dish is a testament to our relentless pursuit of perfection.
        </p>
        <Link to="/" className="inline-block mt-4 text-amber-400 hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Excellence;
