import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

const ContactInfoSection: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const contactInfo = [
    {
      icon: Clock,
      title: "Opening Hours",
      primary: "All Days",
      secondary: "5:30 AM - 11:30 PM",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/30",
      action: null
    },
    {
      icon: Phone,
      title: "Call Us",
      primary: "+91 9885321957",
      secondary: "Available 24/7",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/30",
      action: {
        text: "Call Now",
        href: "tel:+919885321957"
      }
    },
    {
      icon: MapPin,
      title: "Location",
      primary: "Rama Rao Peta",
      secondary: "Kakinada, Andhra Pradesh",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
      action: {
        text: "Get Directions",
        href: "https://maps.google.com/?q=Rama+Rao+Peta,+Kakinada"
      }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`${isMobile ? 'mt-12' : 'mt-8'}`}
    >
      {isMobile ? (
        /* Mobile: Vertical Card Layout */
        <div className="space-y-4 max-w-sm mx-auto">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`${info.bgColor} ${info.borderColor} border backdrop-blur-sm rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
              >
                {/* Background Gradient Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10 flex items-center space-x-4">
                  <div className={`${info.color} ${info.bgColor} p-3 rounded-xl border ${info.borderColor}`}>
                    <IconComponent size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`${info.color} font-semibold text-sm mb-1`}>
                      {info.title}
                    </div>
                    <div className="text-cream font-medium text-base truncate">
                      {info.primary}
                    </div>
                    <div className="text-cream/70 text-sm">
                      {info.secondary}
                    </div>
                  </div>
                  
                  {info.action && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`${info.color} hover:${info.bgColor} border ${info.borderColor} text-xs px-3 py-2 rounded-lg flex-shrink-0`}
                      asChild
                    >
                      <a 
                        href={info.action.href}
                        target={info.action.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center"
                      >
                        {info.action.text}
                        {info.action.href.startsWith('http') && (
                          <ExternalLink size={12} className="ml-1" />
                        )}
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Desktop: Horizontal Layout (Original Style) */
        <div className="flex justify-center items-center gap-6 flex-wrap">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-cream text-center group"
                >
                  <div className="flex items-center justify-center mb-2">
                    <IconComponent size={18} className={`${info.color} mr-2`} />
                    <div className="font-medium">{info.title}:</div>
                  </div>
                  <div className="text-cream/70 text-sm">
                    {info.primary}
                    {info.secondary && (
                      <>
                        <br />
                        {info.secondary}
                      </>
                    )}
                  </div>
                  {info.action && (
                    <Button
                      size="sm"
                      variant="link"
                      className={`${info.color} text-xs mt-2 p-0 h-auto`}
                      asChild
                    >
                      <a 
                        href={info.action.href}
                        target={info.action.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center"
                      >
                        {info.action.text}
                        {info.action.href.startsWith('http') && (
                          <ExternalLink size={12} className="ml-1" />
                        )}
                      </a>
                    </Button>
                  )}
                </motion.div>
                {index < contactInfo.length - 1 && (
                  <div className="h-8 w-px bg-amber-600/30"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ContactInfoSection;
