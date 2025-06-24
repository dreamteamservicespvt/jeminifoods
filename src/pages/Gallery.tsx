import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download, Heart, Share2, Grid3X3, List, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  title: string;
  description: string;
}

const images: GalleryImage[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1543357480-c6032131a93c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Gourmet Dish 1',
    category: 'signature',
    title: 'Truffle Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms and truffle oil'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Gourmet Dish 2',
    category: 'mains',
    title: 'Pan-Seared Salmon',
    description: 'Atlantic salmon with seasonal vegetables and citrus reduction'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Chef at work',
    category: 'behind-scenes',
    title: 'Culinary Artistry',
    description: 'Our master chef crafting the perfect dish'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Fine dining setup',
    category: 'ambiance',
    title: 'Elegant Dining Room',
    description: 'Sophisticated atmosphere for an unforgettable experience'
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1555992336-03a23c44ebf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Elegant plating',
    category: 'signature',
    title: 'Deconstructed Tiramisu',
    description: 'Classic Italian dessert reimagined with modern presentation'
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Signature dessert',
    category: 'desserts',
    title: 'Chocolate Lava Cake',
    description: 'Warm molten chocolate cake with vanilla ice cream'
  }
];

const categories = {
  all: { title: 'All Images', count: images.length },
  signature: { title: 'Signature Dishes', count: images.filter(img => img.category === 'signature').length },
  mains: { title: 'Main Courses', count: images.filter(img => img.category === 'mains').length },
  desserts: { title: 'Desserts', count: images.filter(img => img.category === 'desserts').length },
  ambiance: { title: 'Ambiance', count: images.filter(img => img.category === 'ambiance').length },
  'behind-scenes': { title: 'Behind the Scenes', count: images.filter(img => img.category === 'behind-scenes').length }
};

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const handleImageLoad = (id: number) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const handleImageError = (id: number) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-cream pt-20 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-black/80 to-black/40 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent"></div>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-6">
              Culinary Gallery
            </h1>
            <p className="text-xl text-cream/80 mb-8 leading-relaxed">
              Explore a curated collection of our finest culinary creations, from signature dishes to behind-the-scenes moments that capture the essence of fine dining excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 px-4 py-2">
                {images.length} High-Quality Images
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-4 py-2">
                Multiple Categories
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="container mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, category]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedCategory(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedCategory === key
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-black/30 text-cream border-cream/20 hover:border-amber-400/50 hover:bg-black/50"
                )}
              >
                {category.title}
                <Badge 
                  className={cn(
                    "ml-2 text-xs",
                    selectedCategory === key
                      ? "bg-black/20 text-black"
                      : "bg-cream/20 text-cream"
                  )}
                >
                  {category.count}
                </Badge>
              </motion.button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full p-1 border border-cream/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-full px-3",
                viewMode === 'grid' 
                  ? "bg-amber-500 text-black" 
                  : "text-cream hover:text-amber-400"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('masonry')}
              className={cn(
                "rounded-full px-3",
                viewMode === 'masonry' 
                  ? "bg-amber-500 text-black" 
                  : "text-cream hover:text-amber-400"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            viewMode === 'masonry' && "auto-rows-max"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-black/20 backdrop-blur-sm border border-cream/10 hover:border-amber-400/50 transition-all duration-300"
                style={{
                  height: viewMode === 'masonry' 
                    ? index % 3 === 0 ? '400px' : index % 2 === 0 ? '350px' : '300px'
                    : '320px'
                }}
              >
                {/* Image */}
                <div className="relative w-full h-full overflow-hidden">
                  {imageLoading[image.id] !== false && (
                    <div className="absolute inset-0 bg-black/30 animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => handleImageLoad(image.id)}
                    onError={() => handleImageError(image.id)}
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-semibold text-cream mb-2">{image.title}</h3>
                    <p className="text-cream/70 text-sm mb-4 line-clamp-2">{image.description}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 capitalize">
                        {image.category.replace('-', ' ')}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-cream hover:text-amber-400 p-2"
                          onClick={() => setSelectedImage(image)}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-cream hover:text-red-400 p-2"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16 p-8 bg-black/30 rounded-2xl border border-amber-600/20"
        >
          <h3 className="text-2xl font-serif font-bold text-amber-400 mb-4">
            Experience These Dishes in Person
          </h3>
          <p className="text-cream/70 mb-6 max-w-2xl mx-auto">
            Each image tells a story of culinary passion and artistry. Reserve your table today and taste the perfection you see.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-black font-medium px-8 py-3"
            >
              <Link to="/reservations">
                Make a Reservation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10 px-8 py-3"
            >
              <Link to="/menu">
                View Our Menu
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] bg-black/80 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-cream mb-2">
                      {selectedImage.title}
                    </h3>
                    <p className="text-cream/70 mb-4">{selectedImage.description}</p>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 capitalize">
                      {selectedImage.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                    className="text-cream hover:text-amber-400"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
