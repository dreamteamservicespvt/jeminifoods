import React from 'react';
import { Link } from 'react-router-dom';

const Cuisine: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-amber-400 mb-6">Artisan Cuisine</h1>
        <p className="text-lg text-gray-300 mb-8">
          At Jemini Foods, every dish is a work of art. Our chefs select the finest seasonal ingredients to craft flavors that delight and surprise.
        </p>
        <img
          src="https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Artisan Cuisine"
          className="w-full rounded-lg shadow-lg mb-8"
        />
        <p className="text-gray-300 mb-6">
          From farm-to-table freshness to innovative plating, our culinary team ensures an unforgettable dining experience.
        </p>
        <Link to="/" className="inline-block mt-4 text-amber-400 hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Cuisine;
