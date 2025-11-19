export default function ClientesLoading() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
                <div className="h-10 w-full sm:w-40 bg-muted animate-pulse rounded-md" />
            </div>

            <div className="border rounded-lg p-6">
                <div className="space-y-4">
                    <div className="h-10 w-full bg-muted animate-pulse rounded-md" />

                    <div className="space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            </div>
        </div>
    );
}
