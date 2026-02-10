# ThoughtExpense Frontend

A modern, mobile-first Next.js application for tracking expenses using natural language input powered by AI.

## Features

- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 📱 **Mobile-First** - Optimized for mobile devices, works great on desktop
- 🧠 **Natural Language Input** - Type expenses naturally, AI handles categorization
- 📊 **Visual Analytics** - Charts and graphs for spending insights
- 🔐 **Secure Authentication** - JWT-based auth with protected routes
- ⚡ **Server Components** - Maximizes use of React Server Components
- 🎯 **Production-Ready** - Type-safe, well-structured codebase

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios
- **Charts**: Recharts
- **Notifications**: React Hot Toast
- **Validation**: Zod
- **Date Handling**: date-fns

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/            # Protected dashboard pages
│   │   ├── add/             # Add expenses
│   │   ├── expenses/        # View/edit expenses
│   │   ├── insights/        # AI insights
│   │   └── page.tsx         # Dashboard home
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Textarea.tsx
│   └── dashboard/           # Dashboard-specific components
│       └── DashboardLayout.tsx
├── lib/                     # Utilities
│   ├── api.ts              # API client
│   └── utils.ts            # Helper functions
├── store/                   # State management
│   └── authStore.ts        # Auth state
├── hooks/                   # Custom React hooks
│   └── useProtectedRoute.ts
├── types/                   # TypeScript types
│   └── index.ts
└── public/                  # Static assets

```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update environment variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create production build:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Key Features Explained

### Natural Language Expense Input

Users can type expenses naturally:
- "coffee 5"
- "rent 1200"
- "uber to work 15"
- "bought groceries for 85 dollars"

The AI parses and categorizes automatically with confidence scores.

### Protected Routes

All dashboard routes are protected using the `useProtectedRoute` hook:
- Automatically redirects to login if not authenticated
- Checks authentication on mount
- Persists auth state with Zustand + localStorage

### Mobile-First Design

- Responsive layouts using Tailwind's mobile-first breakpoints
- Touch-optimized UI elements
- Collapsible mobile navigation
- Optimized for small screens first

### Server Components

Maximum use of React Server Components where possible:
- Landing page is fully server-rendered
- Client components only where interactivity is needed
- Reduced JavaScript bundle size

### Type Safety

Full TypeScript coverage:
- All API responses typed
- Props interfaces for all components
- Type-safe state management
- No `any` types in production code

## API Integration

The app integrates with the backend API for:

- **Authentication**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- **Expenses**: `/api/expenses/parse`, `/api/expenses/*`
- **Insights**: `/api/insights/generate`, `/api/insights`
- **Summary**: `/api/expenses/summary`

See `lib/api.ts` for full API client implementation.

## State Management

Using Zustand for minimal, efficient state management:

- **Auth State**: User info, authentication status
- **Persistent**: localStorage sync for auth
- **No unnecessary re-renders**: Subscribe only to needed state

## Styling Conventions

- Tailwind utility classes for all styling
- No custom CSS except in `globals.css`
- Consistent color palette (blue primary, gray neutrals)
- Mobile-first responsive breakpoints
- Reusable component variants

## Performance Optimizations

- Server components by default
- Minimal client-side JavaScript
- Code splitting with Next.js
- Optimized images with Next.js Image
- API response caching

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow TypeScript best practices
2. Use existing component patterns
3. Keep components small and focused
4. Add proper types for all props
5. Test on mobile viewport first

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Create production build
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler check

# Clean
rm -rf .next           # Remove Next.js cache
rm -rf node_modules    # Remove dependencies
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001` |

## Troubleshooting

### API Connection Issues
- Verify backend is running on correct port
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_URL` is correct

### Authentication Issues
- Clear localStorage and cookies
- Check JWT token expiration
- Verify API credentials

### Build Errors
- Delete `.next` folder and rebuild
- Check for TypeScript errors
- Verify all dependencies are installed

## License

MIT

## Support

For issues and questions, please refer to the main project README or create an issue in the repository.
