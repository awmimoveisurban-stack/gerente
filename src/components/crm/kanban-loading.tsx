import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const KanbanLoading = memo(function KanbanLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-purple-200/50 dark:border-gray-700/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-purple-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-96 bg-purple-100 dark:bg-gray-700" />
            <Skeleton className="h-4 w-48 bg-purple-100 dark:bg-gray-700" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-80 bg-purple-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-28 bg-purple-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-28 bg-purple-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-28 bg-purple-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/30 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-8 w-32 bg-gray-300 dark:bg-gray-700" />
                <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-2 w-full bg-gray-200 dark:bg-gray-700 mt-2" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50">
          <div className="space-y-1">
            <Skeleton className="h-6 w-48 bg-green-200 dark:bg-green-700" />
            <Skeleton className="h-4 w-64 bg-green-100 dark:bg-green-700" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-8 w-8 rounded-lg bg-gray-300 dark:bg-gray-700" />
                  <Skeleton className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-3 w-16 bg-gray-100 dark:bg-gray-700" />
                  <Skeleton className="h-1 w-full bg-gray-200 dark:bg-gray-700 mt-2" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg bg-blue-300 dark:bg-blue-700" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48 bg-blue-200 dark:bg-blue-700" />
                  <Skeleton className="h-3 w-64 bg-blue-100 dark:bg-blue-700" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-8 w-16 bg-blue-200 dark:bg-blue-700" />
                <Skeleton className="h-3 w-20 bg-blue-100 dark:bg-blue-700" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-lg bg-gray-300 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                </div>
                <Skeleton className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <Skeleton className="h-4 w-20 bg-gray-100 dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});





