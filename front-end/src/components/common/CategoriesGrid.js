/**
 * Categories Grid Component
 * Displays main service categories with images and descriptions
 */

import React from 'react';
import { 
  Wrench, Zap, Sparkles, Paintbrush, Scissors, 
  Bug, Wind, Dumbbell, TreePine, Camera, Gamepad2, 
  Stethoscope, GraduationCap, Car, TrendingUp 
} from 'lucide-react';
import './CategoriesGrid.css';

const CategoriesGrid = ({ onCategoryClick }) => {
  // Main Categories - Urban Company Style (Top Categories Above the Fold)
  const mainCategories = [
    { 
      name: "Home Cleaning", 
      icon: Sparkles, 
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      services: "Deep cleaning, Regular cleaning, Move-in/out",
      popular: true,
      link: "/cleaning"
    },
    { 
      name: "Appliance Repair", 
      icon: Wrench, 
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      services: "Washing machine, Refrigerator, Microwave",
      popular: true,
      link: "/appliance-repair"
    },
    { 
      name: "Pest Control", 
      icon: Bug, 
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      services: "Cockroach, Termite, Bedbugs treatment",
      popular: true,
      link: "/pest-control"
    },
    { 
      name: "Plumbing & Carpentry", 
      icon: Wrench, 
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop",
      services: "Pipe repair, Furniture assembly, Installation",
      popular: true,
      link: "/plumbing-carpentry"
    },
    { 
      name: "Electrician", 
      icon: Zap, 
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      services: "Wiring, Switch/socket, Fan installation",
      popular: true,
      link: "/electrician"
    },
    { 
      name: "Men's Grooming", 
      icon: Scissors, 
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
      services: "Haircut, Beard styling, Massage",
      popular: true,
      link: "/mens-grooming"
    },
    { 
      name: "Women's Salon at Home", 
      icon: Paintbrush, 
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      services: "Hair styling, Facial, Manicure/Pedicure",
      popular: true,
      link: "/womens-salon"
    },
    { 
      name: "AC/Cooler Repair", 
      icon: Wind, 
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
      services: "AC service, Installation, Gas refill",
      popular: true,
      link: "/ac-repair"
    }
  ];

  // Popular Categories - Secondary Section Below Main Grid
  const popularCategories = [
    { name: "Fitness Trainer", icon: Dumbbell, services: "Personal training, Yoga, Diet" },
    { name: "Gardening", icon: TreePine, services: "Landscaping, Plant care, Maintenance" },
    { name: "Photography", icon: Camera, services: "Events, Portraits, Product shoots" },
    { name: "Gaming Setup", icon: Gamepad2, services: "Console setup, PC build, Streaming" },
    { name: "Health Checkup", icon: Stethoscope, services: "Blood test, Doctor visit, Consultation" },
    { name: "Tutoring", icon: GraduationCap, services: "Academic subjects, Test prep, Languages" },
    { name: "Car Service", icon: Car, services: "Washing, Repair, Maintenance" }
  ];

  return (
    <>
      {/* Main Categories Section */}
      <section className="main-categories">
        <div className="section-container">
          <div className="section-header">
            <h2>Book top categories</h2>
            <p>Most booked services</p>
          </div>
          
          <div className="categories-grid-main">
            {mainCategories.map((category, index) => (
              <div 
                key={index} 
                className="category-card-main" 
                onClick={() => onCategoryClick(category)}
              >
                <div className="category-image">
                  <img src={category.image} alt={category.name} loading="lazy" />
                  <div className="category-overlay">
                    <category.icon size={32} className="category-icon" />
                  </div>
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.services}</p>
                </div>
                {category.popular && (
                  <div className="popular-badge">
                    <TrendingUp size={14} />
                    Popular
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Section - Horizontal Scroll */}
      <section className="popular-categories">
        <div className="section-container">
          <div className="section-header">
            <h2>New and noteworthy</h2>
            <p>Fresh out of our catalogue</p>
          </div>
          
          <div className="categories-scroll">
            <div className="scroll-container">
              {popularCategories.map((category, index) => (
                <div 
                  key={index} 
                  className="category-card-small" 
                  onClick={() => onCategoryClick(category)}
                >
                  <div className="category-icon-small">
                    <category.icon size={24} />
                  </div>
                  <div className="category-info">
                    <h4>{category.name}</h4>
                    <p>{category.services}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CategoriesGrid;