import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const LeadsLoadingSkeleton = memo(function LeadsLoadingSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Loading */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-blue-200/50 dark:border-gray-700/50'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <Skeleton className='h-10 w-10 rounded-xl' />
              <Skeleton className='h-8 w-48' />
            </div>
            <Skeleton className='h-4 w-80' />
          </div>
          <div className='flex gap-3 w-full md:w-auto'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-32' />
          </div>
        </div>
      </div>

      {/* Metrics Loading */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-blue-200/50 dark:border-gray-700/50'
          >
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <Skeleton className='h-4 w-24 mb-2' />
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-3 w-20' />
              </div>
              <Skeleton className='h-12 w-12 rounded-xl' />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Loading */}
      <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Skeleton className='h-6 w-6 rounded-lg' />
                <Skeleton className='h-6 w-32' />
              </div>
              <Skeleton className='h-4 w-64' />
            </div>
            <Skeleton className='h-8 w-20' />
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <Skeleton className='h-10 flex-1' />
            <Skeleton className='h-10 w-48' />
          </div>
        </CardContent>
      </Card>

      {/* Status Summary Loading */}
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4'>
        {Array.from({ length: 7 }).map((_, index) => (
          <Card
            key={index}
            className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'
          >
            <CardContent className='p-4 text-center'>
              <Skeleton className='h-8 w-8 mx-auto mb-2 rounded-full' />
              <Skeleton className='h-4 w-16 mx-auto mb-1' />
              <Skeleton className='h-6 w-8 mx-auto' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Loading */}
      <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Skeleton className='h-6 w-6 rounded-lg' />
                <Skeleton className='h-6 w-32' />
              </div>
              <Skeleton className='h-4 w-64' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='overflow-x-auto'>
            <div className='space-y-4'>
              {/* Table Header */}
              <div className='grid grid-cols-7 gap-4 pb-2 border-b border-gray-200 dark:border-gray-700'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16 ml-auto' />
              </div>
              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='grid grid-cols-7 gap-4 py-4'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div>
                      <Skeleton className='h-4 w-24 mb-1' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-4 w-4' />
                      <Skeleton className='h-3 w-20' />
                    </div>
                    <Skeleton className='h-3 w-16' />
                  </div>
                  <Skeleton className='h-8 w-full' />
                  <div className='text-right'>
                    <Skeleton className='h-4 w-16 ml-auto' />
                  </div>
                  <Skeleton className='h-6 w-20' />
                  <div className='space-y-1'>
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='h-3 w-16' />
                  </div>
                  <div className='flex items-center gap-2 justify-end'>
                    <Skeleton className='h-8 w-8' />
                    <Skeleton className='h-8 w-8' />
                    <Skeleton className='h-8 w-8' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
