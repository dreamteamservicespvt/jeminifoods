import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Shield, Eye, Lock, UserCheck, Clock, Mail, Phone, MapPin } from 'lucide-react';

const PrivacyPolicy = () => {
  // Scroll to top on component mount and set SEO meta tags
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Update page title and meta description for SEO
    document.title = 'Privacy Policy – Jemini Foods';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy for Jemini Foods - Learn how we collect, use, and protect your personal information when you dine with us or use our services.');
    }
    
    // Cleanup function to restore original title when component unmounts
    return () => {
      document.title = 'Jemini Foods - Premium Fine Dining Experience';
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Experience luxury dining at Jemini Foods. Award-winning cuisine, elegant atmosphere, and exceptional service in an unforgettable culinary journey.');
      }
    };
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-charcoal pt-20 pb-20">
      {/* Scroll to top button */}
      <button 
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 bg-black/60 backdrop-blur-sm p-3 rounded-full border border-amber-600/40 hover:border-amber-400 hover:bg-amber-600/10 transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
      </button>

      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-600/30">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-cream/80 max-w-2xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy explains how Jemini Foods collects, uses, and protects your personal information.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-cream/60">
            <Clock className="w-4 h-4" />
            <span>Last Updated: July 12, 2025</span>
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Introduction */}
          <motion.section variants={itemVariants} className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-amber-600/20">
            <h2 className="text-2xl font-semibold text-amber-300 mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-3" />
              Introduction
            </h2>
            <p className="text-cream/90 leading-relaxed">
              At Jemini Foods, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, 
              mobile application, or visit our restaurant located in Rama Rao Peta, Kakinada, Andhra Pradesh. 
              By using our services, you consent to the data practices described in this policy.
            </p>
          </motion.section>

          {/* Information We Collect */}
          <motion.section variants={itemVariants} className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-amber-600/20">
            <h2 className="text-2xl font-semibold text-amber-300 mb-6 flex items-center">
              <UserCheck className="w-6 h-6 mr-3" />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-cream mb-2">Personal Information</h3>
                <ul className="text-cream/80 space-y-2 ml-4">
                  <li>• Name and contact information (email address, phone number)</li>
                  <li>• Reservation details and dining preferences</li>
                  <li>• Order history and menu preferences</li>
                  <li>• Special dietary requirements or accessibility needs</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-cream mb-2">Technical Information</h3>
                <ul className="text-cream/80 space-y-2 ml-4">
                  <li>• Device and browser information</li>
                  <li>• Website usage analytics and interaction data</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* How We Use Information */}
          <motion.section variants={itemVariants} className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-amber-600/20">
            <h2 className="text-2xl font-semibold text-amber-300 mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-3" />
              How We Use Your Information
            </h2>
            <div className="text-cream/90 space-y-4">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="space-y-3 ml-4">
                <li>• <strong>Reservation Management:</strong> To process and confirm your table reservations</li>
                <li>• <strong>Order Processing:</strong> To handle pre-orders and special menu requests</li>
                <li>• <strong>Communication:</strong> To send reservation confirmations via WhatsApp, email, or SMS</li>
                <li>• <strong>Customer Support:</strong> To respond to your inquiries and provide assistance</li>
                <li>• <strong>Service Improvement:</strong> To enhance our menu, services, and overall dining experience</li>
                <li>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.section variants={itemVariants} className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 backdrop-blur-sm rounded-2xl p-8 border border-amber-600/30">
            <h2 className="text-2xl font-semibold text-amber-300 mb-6">Contact Us</h2>
            <div className="text-cream/90 space-y-6">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please don't hesitate to contact us:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex-shrink-0">
                      <Mail className="text-amber-400" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-amber-200">Email</p>
                      <p className="text-cream/80">Jeminifoodskkd@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex-shrink-0">
                      <Phone className="text-amber-400" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-amber-200">Phone</p>
                      <p className="text-cream/80">+91 9885321957</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-600/5 flex-shrink-0">
                    <MapPin className="text-amber-400" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-amber-200">Address</p>
                    <p className="text-cream/80">
                      Jemini Foods<br />
                      Rama Rao Peta<br />
                      Kakinada, Andhra Pradesh 533004<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-charcoal/50 rounded-lg border border-amber-600/10">
                <p className="text-sm text-cream/70">
                  <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 48 hours during business days.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Legal Compliance Note */}
          <motion.section variants={itemVariants} className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-amber-600/10">
            <div className="text-center text-sm text-cream/60 space-y-2">
              <p>
                This Privacy Policy is compliant with the Information Technology Act, 2000, and Information Technology 
                (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India, 
                as well as GDPR requirements for international users.
              </p>
              <p className="font-medium text-amber-300">
                Effective Date: July 12, 2025 | Last Updated: July 12, 2025
              </p>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
