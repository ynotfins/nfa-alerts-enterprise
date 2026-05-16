import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-7xl font-bold tracking-tight text-primary">404</h1>
          <div className="space-y-2">
            <p className="text-xl font-medium">Page not found</p>
            <p className="text-base text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="h-12 px-8 text-base">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
