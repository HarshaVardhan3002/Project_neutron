import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const projects = [
  {
    title: 'Enterprise SaaS Platform',
    category: 'Web Application',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'dashboard analytics'
  },
  {
    title: 'Consumer Mobile App',
    category: 'Mobile App',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'mobile interface'
  },
  {
    title: 'AI-Powered Chatbot',
    category: 'AI/ML',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'chatbot conversation'
  },
  {
    title: 'E-commerce Website',
    category: 'Website',
    imageUrl: 'https://placehold.co/800x600',
    aiHint: 'online shopping'
  }
];

export default function WorkSection() {
  return (
    <section id="work" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">Transforming Visions into Reality</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            We are proud of the work we do. Here are some of our recent projects that have made an impact.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="overflow-hidden group relative border-none shadow-xl">
              <Image
                src={project.imageUrl}
                alt={project.title}
                width={800}
                height={600}
                data-ai-hint={project.aiHint}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <p className="text-sm font-semibold text-primary-foreground/80 mb-1">{project.category}</p>
                <h3 className="text-2xl font-bold text-primary-foreground font-headline">{project.title}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
