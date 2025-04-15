import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon, MessageCircleIcon, TrophyIcon, MedalIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function WeeklyChallenge() {
  const { data: challenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['/api/challenges'],
  });

  const latestChallenge = challenges?.[0];

  const { data: challengeDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['/api/challenges', latestChallenge?.id],
    enabled: !!latestChallenge,
  });

  if (isLoadingChallenges) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </section>
    );
  }

  if (!latestChallenge) {
    return null;
  }

  const daysRemaining = latestChallenge.endDate ? 
    Math.ceil((new Date(latestChallenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Challenge</h2>
        <Link href="/explore?view=challenges" className="text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium">
          View all challenges
        </Link>
      </div>
      
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900 p-6">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-full text-sm font-medium mb-4">
              {daysRemaining && daysRemaining > 0 ? 
                `Ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}` : 
                'Challenge ended'
              }
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{latestChallenge.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{latestChallenge.description}</p>
            <div className="mb-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Participants</span>
                <span className="ml-2 text-gray-700 dark:text-gray-200 font-semibold">
                  {isLoadingDetails ? <Skeleton className="h-4 w-10 inline-block" /> : challengeDetails?.entries?.length || 0}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Word limit</span>
                <span className="ml-2 text-gray-700 dark:text-gray-200 font-semibold">
                  {latestChallenge.wordLimit || 'No limit'}
                </span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href={`/challenge/${latestChallenge.id}/participate`}>
                Participate Now
              </Link>
            </Button>
          </div>
          <div className="md:w-2/3 p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Top Entries</h4>
            
            {isLoadingDetails ? (
              [...Array(3)].map((_, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-6 w-48 mb-1" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            ) : challengeDetails?.entries && challengeDetails.entries.length > 0 ? (
              challengeDetails.entries.slice(0, 3).map((entry, index) => (
                <div key={entry.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarImage src={entry.writing.author?.profileImage} alt={entry.writing.author?.fullName} />
                        <AvatarFallback>{entry.writing.author?.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <span className="font-medium text-gray-900 dark:text-white">{entry.writing.author?.fullName}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {entry.rank && (
                      <div className="flex items-center">
                        <span className={`${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`}>
                          {index === 0 ? (
                            <TrophyIcon className="h-4 w-4 mr-1 inline-block" />
                          ) : (
                            <MedalIcon className="h-4 w-4 mr-1 inline-block" />
                          )}
                        </span>
                        <span className="text-sm font-medium">{index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} place</span>
                      </div>
                    )}
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{entry.writing.title}</h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{entry.writing.description}</p>
                  <div className="flex items-center mt-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary text-sm mr-4 h-auto p-1">
                      <HeartIcon className="h-4 w-4 mr-1" /> {entry.writing.stats?.likes || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary text-sm h-auto p-1">
                      <MessageCircleIcon className="h-4 w-4 mr-1" /> {entry.writing.stats?.comments || 0}
                    </Button>
                    <Link href={`/writing/${entry.writing.id}`} className="ml-auto text-primary hover:text-blue-700 text-sm font-medium">
                      Read Full Entry
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-300 italic">No entries yet. Be the first to participate!</p>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
