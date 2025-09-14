import { Search, PenTool, Server, Rocket } from 'lucide-react';
import React from 'react';

const approachSteps = [
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Discover',
    description: 'We dive deep into your business, market, and user needs to uncover key insights and opportunities.'
  },
  {
    icon: <PenTool className="w-8 h-8" />,
    title: 'Design',
    description: 'We create wireframes, prototypes, and stunning visual designs that are both user-friendly and impactful.'
  },
  {
    icon: <Server className="w-8 h-8" />,
    title: 'Develop',
    description: 'Our engineers build your product with clean, efficient code, ensuring scalability and performance.'
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    title: 'Deploy',
    description: 'We handle the launch process, and provide ongoing support to ensure your product thrives in the market.'
  }
];

export default function ApproachSection() {
  return (
    <section id="approach" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-bold animated-gradient-text">Our Unique Approach to Innovation</h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
            Our iterative process is designed for clarity, speed, and exceptional outcomes. We collaborate closely with you at every stage.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-12 bottom-12 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {approachSteps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-6 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="flex-shrink-0 p-4 bg-primary/10 rounded-full text-primary">
                  {step.icon}
                </div>
                <div className={`${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  <h3 className="text-2xl font-headline font-bold mb-2">
                    <span className="text-primary text-3xl mr-2">0{index + 1}</span>
                    {step.title}
                  </h3>
                  <p className="text-foreground/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
