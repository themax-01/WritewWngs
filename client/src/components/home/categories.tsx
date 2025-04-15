import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Define image URLs for category backgrounds
  const categoryImages: Record<string, string> = {
    'Fiction': 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'Science Fiction': 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'Fantasy': 'https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'Mystery': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'Poetry': 'https://images.unsplash.com/photo-1551965445-5e76b17d9179?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'Essays': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
    'Memoir': 'https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
              <Skeleton className="aspect-square w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.map((category: string) => (
            <Link 
              key={category} 
              href={`/explore?category=${encodeURIComponent(category)}`}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 transition hover:shadow-lg group"
            >
              <div className="aspect-w-1 aspect-h-1 relative">
                <img 
                  src={categoryImages[category] || `https://source.unsplash.com/random/400x400?${category.toLowerCase()}`} 
                  alt={category} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 className="text-white font-bold group-hover:text-primary transition">{category}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
