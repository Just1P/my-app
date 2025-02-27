// src/components/ui/loading-skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-700/50",
        className
      )}
    />
  );
}

export function SummonerProfileSkeleton() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-blue-900/40 p-6 rounded-2xl shadow-xl w-full max-w-6xl flex flex-col md:flex-row gap-6 animate-fade-in">
      {/* Profile */}
      <div className="w-full md:w-1/3 order-1 md:order-none">
        <div className="bg-slate-800/70 p-6 rounded-xl shadow-md flex flex-col items-center">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="mt-4 w-full flex flex-col items-center">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-6 w-32" />
          </div>
          
          {/* Champions section */}
          <div className="mt-8 w-full space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Match history */}
      <div className="w-full md:w-2/3">
        <div className="flex flex-wrap gap-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>
        
        <Skeleton className="h-8 w-64 mb-4" />
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}