import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TodosLeadsSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='flex gap-3'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-40' />
        </div>
      </div>

      {/* Metrics Skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i}>
            <CardContent className='p-4'>
              <Skeleton className='h-4 w-24 mb-2' />
              <Skeleton className='h-8 w-16' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Skeleton */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <TableHead key={i}>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map(j => (
                  <TableCell key={j}>
                    {j === 1 ? (
                      <div className='flex items-center gap-3'>
                        <Skeleton className='h-10 w-10 rounded-full' />
                        <div className='space-y-1'>
                          <Skeleton className='h-4 w-32' />
                          <Skeleton className='h-3 w-24' />
                        </div>
                      </div>
                    ) : (
                      <Skeleton className='h-4 w-20' />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}



