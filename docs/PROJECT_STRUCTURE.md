# 🏗️ Project Structure - Frontend/Backend Separation

This project has been reorganized with a clear separation between frontend and backend code for better maintainability and scalability.

## 📁 Directory Structure

```
/
├── frontend/                    ← Everything the browser sees
│   ├── components/             ← Reusable UI components
│   │   ├── ui/                ← shadcn/ui components
│   │   ├── auth/              ← Authentication components
│   │   └── dashboard/         ← Dashboard-specific components
│   ├── pages/                 ← Next.js pages/routes
│   │   ├── auth/              ← Authentication pages
│   │   ├── dashboard/         ← Dashboard pages
│   │   ├── pricing/           ← Pricing pages
│   │   └── features/          ← Feature pages
│   ├── hooks/                 ← Custom React hooks
│   ├── styles/                ← CSS and styling files
│   ├── utils/                 ← Frontend utilities
│   └── assets/                ← Static assets (images, icons)
├── backend/                    ← Server-side logic
│   ├── api/                   ← API routes
│   │   ├── ai/                ← AI/OpenAI endpoints
│   │   ├── webhooks/          ← Webhook handlers
│   │   ├── create-checkout-session/  ← Stripe checkout
│   │   ├── cancel-subscription/      ← Subscription management
│   │   ├── credits/           ← Credits management
│   │   └── email/             ← Email API endpoints
│   ├── services/              ← Business logic services
│   ├── middleware/            ← Server middleware
│   ├── database/              ← DB schemas and migrations
│   │   └── migrations/        ← Database migration files
│   ├── auth/                  ← Authentication logic
│   └── utils/                 ← Backend utilities
├── shared/                     ← Code shared between frontend and backend
│   ├── types/                 ← Shared TypeScript types
│   │   └── supabase.ts        ← Database types
│   └── constants/             ← Shared constants
└── config/                     ← Configuration files
    ├── next.config.js         ← Next.js configuration
    ├── tailwind.config.js     ← Tailwind CSS config
    └── components.json        ← shadcn/ui configuration
```

## 🎯 Key Benefits

### **1. Clear Separation of Concerns**
- **Frontend**: UI components, pages, client-side logic
- **Backend**: API routes, business logic, database operations
- **Shared**: Common types and utilities

### **2. Improved Maintainability**
- Easier to locate specific functionality
- Reduced coupling between frontend and backend
- Better code organization

### **3. Team Collaboration**
- Frontend developers can focus on `frontend/` directory
- Backend developers can focus on `backend/` directory
- Clear boundaries reduce merge conflicts

### **4. Scalability**
- Easy to add new features in the appropriate directory
- Modular structure supports microservices migration
- Better separation for testing

## 🚀 Current Features Organized

### **Frontend Features**
- ✅ **Authentication UI** (`frontend/pages/auth/`)
- ✅ **Dashboard Interface** (`frontend/pages/dashboard/`)
- ✅ **Landing Pages** (`frontend/pages/`)
- ✅ **shadcn/ui Components** (`frontend/components/ui/`)
- ✅ **Responsive Design** (Tailwind CSS)

### **Backend Features**
- ✅ **AI Chat API** (`backend/api/ai/chat/`)
- ✅ **Stripe Integration** (`backend/api/create-checkout-session/`)
- ✅ **Webhook Handlers** (`backend/api/webhooks/`)
- ✅ **User Credits System** (`backend/api/credits/`)
- ✅ **Email Services** (`backend/api/email/`)
- ✅ **Database Migrations** (`backend/database/migrations/`)

### **Shared Resources**
- ✅ **TypeScript Types** (`shared/types/`)
- ✅ **Database Schema** (`shared/types/supabase.ts`)
- ✅ **Configuration** (`config/`)

## 🔧 Migration Status

### ✅ **Completed Migrations**
- API routes moved to `backend/api/`
- UI components moved to `frontend/components/`
- Database migrations moved to `backend/database/`
- Shared types moved to `shared/types/`
- Configuration files moved to `config/`

### 🚧 **Next Steps**
1. Update import paths in existing files
2. Move remaining components and pages
3. Update build configuration
4. Create service layer abstractions
5. Add backend utilities and middleware

## 📝 Development Guidelines

### **Adding New Features**

**Frontend Features:**
```bash
# Add new component
frontend/components/NewComponent.tsx

# Add new page
frontend/pages/new-feature/page.tsx

# Add custom hook
frontend/hooks/useNewFeature.ts
```

**Backend Features:**
```bash
# Add new API route
backend/api/new-endpoint/route.ts

# Add business logic
backend/services/NewService.ts

# Add database migration
backend/database/migrations/YYYYMMDD_new_feature.sql
```

**Shared Resources:**
```bash
# Add shared types
shared/types/NewTypes.ts

# Add shared constants
shared/constants/NewConstants.ts
```

## 🛠️ Import Path Updates Needed

After migration, update import paths:

```typescript
// OLD
import { Database } from '@/types/supabase'

// NEW
import { Database } from '@/shared/types/supabase'
```

## 🎉 Benefits Achieved

1. **Better Organization**: Clear separation of frontend and backend code
2. **Improved Developer Experience**: Easier to navigate and find code
3. **Scalability**: Structure supports growth and team expansion
4. **Maintainability**: Reduced coupling and better modularity
5. **Professional Structure**: Industry-standard organization pattern

This reorganization sets up your SaaS project for long-term success and maintainability! 🚀 