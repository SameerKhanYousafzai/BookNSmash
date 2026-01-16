export default function LoadingSkeleton({ type = 'card', count = 1 }) {
    const CardSkeleton = () => (
        <div className="card animate-pulse">
            <div className="bg-gray-300 h-48 w-full" />
            <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="h-4 bg-gray-300 rounded w-5/6" />
            </div>
        </div>
    );

    const ListSkeleton = () => (
        <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4" />
                        <div className="h-4 bg-gray-300 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );

    const skeletons = {
        card: CardSkeleton,
        list: ListSkeleton,
    };

    const SkeletonComponent = skeletons[type] || CardSkeleton;

    return (
        <div className="space-y-6">
            {[...Array(count)].map((_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </div>
    );
}
