import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, AuthRoute } from './ProtectedRoute'

import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { KeySetup } from '@/pages/KeySetup'
import { KeyReady } from '@/pages/KeyReady'
import { KeyLost } from '@/pages/KeyLost'
import { Conversations } from '@/pages/Conversations'
import { Chat } from '@/pages/Chat'
import { NewConversation } from '@/pages/NewConversation'
import { NotFound } from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    element: <AuthRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    path: '/key-setup',
    element: <KeySetup />,
  },
  {
    path: '/key-ready',
    element: <KeyReady />,
  },
  {
    path: '/key-lost',
    element: <KeyLost />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <Conversations /> },
      { path: '/chat/:userId', element: <Chat /> },
      { path: '/new', element: <NewConversation /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])
