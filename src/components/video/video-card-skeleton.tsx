import { Skeleton } from '@/components/ui/skeleton'

export function VideoCardSkeleton() {
  return (
    <div>
      <div className="aspect-video overflow-hidden rounded-lg">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  )
}
