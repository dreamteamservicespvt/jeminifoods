import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

const ContactInfoSection: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const contactInfo = [
    {
      icon: Clock,
      title: "Opening Hours",
      primary: "Every Day",
      secondary: "5:30 AM - 11:30 PM",
      detail: "Fresh tiffins daily",
      color: "text-brand-secondary",
      iconBg: "bg-brand-secondary/20",
      gradient: "from-brand-secondary/10 to-brand-secondary/5",
      action: null
    },
    {
      icon: Phone,
      title: "Call Us",
      primary: "+91 9885321957",
      secondary: "Order & Inquiries",
      detail: "Available 24/7",
      color: "text-brand-primary",
      iconBg: "bg-brand-primary/20",
      gradient: "from-brand-primary/10 to-brand-primary/5",
      action: {
        text: "Call Now",
        href: "tel:+919885321957",
        icon: Phone
      }
    },
    {
      icon: MapPin,
      title: "Visit Us",
      primary: "Rama Rao Peta",
      secondary: "Kakinada, Andhra Pradesh",
      detail: "Easy to reach location",
      color: "text-brand-accent",
      iconBg: "bg-brand-accent/20",
      gradient: "from-brand-accent/10 to-brand-accent/5",
      action: {
        text: "Get Directions",
        href: "https://maps.google.com/?q=Rama+Rao+Peta,+Kakinada",
        icon: Navigation
      }
    }
  ];

  const handleAction = (action: any) => {
    if (action?.href) {
      if (action.href.startsWith('tel:')) {
        window.location.href = action.href;
      } else {
        window.open(action.href, '_blank', 'noopener noreferrer');
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-brand-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-surface/30 to-transparent"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-brand-secondary/5 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text-primary mb-4">
            Visit <span className="text-gradient-primary">Jemini Foods</span>
          </h2>
          <p className="text-brand-text-muted max-w-2xl mx-auto">
            Experience authentic South Indian flavors in the heart of Kakinada. We're here to serve you!
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className={cn(
          "grid gap-6 md:gap-8",
          isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
        )}>
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={cn(
                "relative group",
                isMobile ? "w-full" : ""
              )}
            >
              {/* Card Container */}
              <div className={cn(
                "relative card-brand p-6 md:p-8 text-center",
                "bg-gradient-to-br", info.gradient,
                "hover:shadow-brand-lg transition-all duration-300",
                "border border-brand-border-subtle hover:border-brand-border"
              )}>
                {/* Icon */}
                <div className={cn(
                  "w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center",
                  info.iconBg,
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  <info.icon className={cn("w-8 h-8", info.color)} />
                </div>

                {/* Content */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-semibold text-brand-text-primary">
                    {info.title}
                  </h3>
                  
                  <div className="space-y-1">
                    <p className={cn("text-lg font-medium", info.color)}>
                      {info.primary}
                    </p>
                    <p className="text-brand-text-secondary">
                      {info.secondary}
                    </p>
                    <p className="text-sm text-brand-text-muted">
                      {info.detail}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                {info.action && (
                  <Button
                    onClick={() => handleAction(info.action)}
                    className={cn(
                      "w-full touch-target interactive-scale",
                      index === 0 ? "btn-brand-secondary" :
                      index === 1 ? "btn-brand-primary" :
                      "btn-brand-accent"
                    )}
                  >
                    {info.action.icon && <info.action.icon className="w-4 h-4 mr-2" />}
                    {info.action.text}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {/* Hover Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100",
                  "bg-gradient-to-br", info.gradient,
                  "transition-opacity duration-300 pointer-events-none"
                )} />
              </div>

              {/* Mobile Enhancement: Tap-friendly spacing */}
              {isMobile && index < contactInfo.length - 1 && (
                <div className="h-4"></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile: Additional Quick Actions */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 grid grid-cols-2 gap-4"
          >
            <Button
              onClick={() => handleAction({ href: "tel:+919885321957" })}
              className="btn-brand-primary h-14 text-lg interactive-scale"
            >
              <Phone className="w-5 h-5 mr-2" />
              Quick Call
            </Button>
            <Button
              onClick={() => handleAction({ 
                href: "https://maps.google.com/?q=Rama+Rao+Peta,+Kakinada" 
              })}
              variant="outline"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary/10 h-14 text-lg interactive-scale"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Directions
            </Button>
          </motion.div>
        )}

        {/* Mobile: Extra Information */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-brand-text-muted">
              🍛 Fresh tiffins prepared daily with authentic South Indian recipes
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ContactInfoSection;
