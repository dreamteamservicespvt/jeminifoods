import React from 'react';
import { Link } from 'react-router-dom';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1543357480-c6032131a93c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Gourmet Dish 1'
  },
  {
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Gourmet Dish 2'
  },
  {
    src: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Chef at work'
  },
  {
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Fine dining setup'
  },
  {
    src: 'https://images.unsplash.com/photo-1555992336-03a23c44ebf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Elegant plating'
  },
  {
    src: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Signature dessert'
  }
];

const Gallery: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-amber-600 mb-8 text-center">
          Jemini Foods Gallery
        </h1>
        <p className="text-center text-gray-700 mb-12">
          Explore a curated selection of our most exquisite culinary creations and ambiance moments.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300">
              <img src={img.src} alt={img.alt} className="w-full h-64 object-cover" />
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/" className="text-amber-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
