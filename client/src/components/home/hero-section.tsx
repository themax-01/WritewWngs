import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="mb-12">
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Share Your Stories With The World</h1>
            <p className="text-blue-100 mb-6">Join our community of writers and readers. Discover exceptional writing, or share your own stories, poems, and essays.</p>
            <div className="flex space-x-4">
              {!user ? (
                <Button asChild className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition shadow-md">
                  <Link href="/auth">Get Started</Link>
                </Button>
              ) : (
                <Button asChild className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition shadow-md">
                  <Link href="/create">Start Writing</Link>
                </Button>
              )}
              <Button asChild variant="secondary" className="px-6 py-3 bg-blue-700 bg-opacity-30 text-white rounded-lg font-medium hover:bg-opacity-40 transition">
                <Link href="/explore">Explore Writings</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
              alt="Person writing in a notebook" 
              className="rounded-lg shadow-lg max-h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
