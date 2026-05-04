import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { router } from '@/routes'
import { queryClient } from '@/lib/queryClient'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
