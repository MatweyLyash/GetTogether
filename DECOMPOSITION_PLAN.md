# Frontend Component Decomposition Plan

## Overview

This document provides a detailed plan for breaking down large page components into smaller, reusable, and maintainable components. Each page file is analyzed for logical sections that can be extracted.

---

## 1. Home Page (`pages/Home/Home.tsx`)

**Current Size:** ~450 lines  
**Target Size:** ~100 lines (page shell) + components

### Components to Extract

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `HeroBanner` | Hero section with search inputs | `onSearch(title, location)` |
| `SearchBar` | Search inputs with icons | `title`, `location`, `onTitleChange`, `onLocationChange`, `onSearch` |
| `CategoriesGrid` | Categories display | `categories`, `isLoading` |
| `CategoryCard` | Single category card | `category`, `onClick` |
| `EventsCarousel` | Upcoming events slider | `events`, `isLoading` |
| `ReviewsSection` | Reviews grid | `reviews`, `events`, `isLoading` |
| `ReviewCard` | Single review card | `review`, `event` |
| `RegistrationCTA` | Call-to-action for unauthenticated users | `onRegisterClick` |

### New Structure
```
components/Home/
├── HeroBanner.tsx
├── SearchBar.tsx
├── CategoriesGrid.tsx
├── CategoryCard.tsx
├── EventsCarousel.tsx
├── ReviewsSection.tsx
├── ReviewCard.tsx
└── RegistrationCTA.tsx
```

---

## 2. Events Page (`pages/Events/Events.tsx`)

**Current Size:** ~500 lines  
**Target Size:** ~80 lines (page shell) + components

### Components to Extract

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `EventsLayout` | Main layout with sidebar | `children`, `filtersOpen`, `onToggleFilters` |
| `FilterSidebar` | Filter controls container | `children`, `isOpen`, `onToggle`, `onReset`, `hasActiveFilters` |
| `FilterSection` | Generic filter section wrapper | `title`, `children` |
| `SearchFilter` | Title and location inputs | `title`, `location`, `onTitleChange`, `onLocationChange` |
| `CategoryFilter` | Category dropdown | `categories`, `selectedCategory`, `onChange` |
| `DateRangeFilter` | Date range pickers | `startDate`, `endDate`, `onStartDateChange`, `onEndDateChange` |
| `TagsFilter` | Tags selection badges | `tags`, `selectedTags`, `onToggleTag` |
| `FilterActions` | Apply/Reset buttons | `onApply`, `onReset`, `isLoading`, `hasFilters` |
| `ActiveFiltersDisplay` | Shows active filter badges | `filters`, `onRemoveFilter` |
| `EventsGrid` | Events list/grid | `events`, `isLoading`, `columns` |
| `EventsEmptyState` | Empty state when no events | `onReset` |

### New Structure
```
components/Events/
├── EventsLayout.tsx
├── FilterSidebar.tsx
├── FilterSection.tsx
├── SearchFilter.tsx
├── CategoryFilter.tsx
├── DateRangeFilter.tsx
├── TagsFilter.tsx
├── FilterActions.tsx
├── ActiveFiltersDisplay.tsx
├── EventsGrid.tsx
└── EventsEmptyState.tsx
```

---

## 3. Event Detail Page (`pages/Event/Event.tsx`)

**Current Size:** ~650 lines  
**Target Size:** ~100 lines (page shell) + components

### Components to Extract

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `EventHeader` | Image, price badge, category, tags | `event`, `imageSrc` |
| `EventImage` | Event image with skeleton | `image`, `title`, `isLoading` |
| `EventPriceBadge` | Price display | `price` |
| `EventTags` | Tags display | `tags`, `category` |
| `EventInfo` | Title, organizer, subscribe buttons | `event`, `isAuthenticated`, `onSubscribe` |
| `OrganizerInfo` | Organizer avatar and name | `organizer`, `onSubscribe` |
| `SubscribeButtons` | Subscribe to organizer/category | `organizerId`, `organizerName`, `categoryId`, `categoryName` |
| `EventStats` | Date, location, capacity, price stats | `event` |
| `EventStatItem` | Single stat item | `icon`, `label`, `value` |
| `EventDescription` | Description section | `description` |
| `TelegramChatLink` | Telegram chat info | `inviteLink` |
| `RegistrationActions` | Registration buttons and flow | `isOrganizer`, `isRegistered`, `registrationStatus`, `onRegister`, `onCancel`, `onGetQR`, `isArchived` |
| `RegistrationStatusBadge` | Status display | `statusId` |
| `ReviewsSection` | Reviews list | `reviews`, `eventId` |
| `ReviewCard` | Single review | `review` |
| `QRCodeModal` | QR code display modal | `isOpen`, `onClose`, `qrCode`, `isLoading` |
| `RegistrationModal` | Registration confirmation | `isOpen`, `onClose`, `onConfirm`, `isLoading` |
| `CancellationModal` | Cancellation confirmation | `isOpen`, `onClose`, `onConfirm`, `isLoading` |

### New Structure
```
components/Event/
├── EventHeader.tsx
├── EventImage.tsx
├── EventPriceBadge.tsx
├── EventTags.tsx
├── EventInfo.tsx
├── OrganizerInfo.tsx
├── SubscribeButtons.tsx
├── EventStats.tsx
├── EventStatItem.tsx
├── EventDescription.tsx
├── TelegramChatLink.tsx
├── RegistrationActions.tsx
├── RegistrationStatusBadge.tsx
├── ReviewsSection.tsx
├── ReviewCard.tsx
├── QRCodeModal.tsx
├── RegistrationModal.tsx
└── CancellationModal.tsx
```

---

## 4. Login Page (`pages/Login/Login.tsx`)

**Current Size:** ~250 lines  
**Target Size:** ~60 lines (page shell) + components

### Components to Extract

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `AuthContainer` | Main auth layout | `children` |
| `AuthTabs` | Login/Register tabs | `activeTab`, `onTabChange` |
| `LoginForm` | Login form | `login`, `password`, `onLoginChange`, `onPasswordChange`, `onSubmit`, `isLoading` |
| `RegisterForm` | Register form | `login`, `password`, `confirmPassword`, `onChange`, `onSubmit`, `isLoading` |
| `PasswordRequirements` | Password requirements hint | `password` |

### New Structure
```
components/Auth/
├── AuthContainer.tsx
├── AuthTabs.tsx
├── LoginForm.tsx
├── RegisterForm.tsx
└── PasswordRequirements.tsx
```

---

## 5. Cabinet Page (`pages/Cabinet/Cabinet.tsx`)

**Current Size:** ~2100 lines (largest file)  
**Target Size:** ~100 lines (page shell) + components

### Components to Extract

#### Tab 1: My Events
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `MyEventsSection` | Container for events | `registrations`, `isLoading` |
| `FutureEventsList` | Future events | `registrations`, `onNavigate` |
| `PastEventsList` | Past events with reviews | `registrations`, `onNavigate`, `onSubmitReview` |
| `EventRegistrationCard` | Single registration card | `registration`, `type` |
| `ReviewForm` | Review submission | `eventId`, `onSubmit`, `isLoading` |

#### Tab 2: Organizer Requests
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `OrganizerRequestsSection` | Requests container | `requests`, `onCreateRequest` |
| `OrganizerRequestStatus` | Status display | `statusId`, `createdAt` |
| `RequestOrganizerButton` | Create request button | `hasPendingRequest`, `onClick` |

#### Tab 3: Create/Edit Event
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `EventForm` | Full event form | `event`, `categories`, `tags`, `onChange`, `onSubmit`, `isLoading`, `isEditing` |
| `EventFormBasic` | Title, description inputs | `title`, `description`, `onChange` |
| `EventFormDateTime` | Date picker | `date`, `onChange`, `error` |
| `EventFormLocation` | Location input | `location`, `onChange` |
| `EventFormCategory` | Category selector | `categories`, `selectedCategory`, `onChange` |
| `EventFormTags` | Tags selector | `tags`, `selectedTags`, `onChange` |
| `EventFormPricing` | Price and capacity | `price`, `capacity`, `onChange` |
| `EventFormTelegram` | Telegram link input | `telegramLink`, `onChange` |
| `EventFormImage` | Image upload with preview | `image`, `preview`, `onChange`, `onRemove` |
| `EventFormActions` | Submit/cancel buttons | `isEditing`, `isLoading`, `onCancel` |

#### Tab 4: My Events Management
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `OwnEventsTable` | Events table | `events`, `onEdit`, `onDelete` |
| `OwnEventRow` | Single event row | `event`, `onEdit`, `onDelete` |
| `EventRequestsModal` | Registration requests | `eventId`, `requests`, `onResponse`, `isOpen`, `onClose` |
| `EventRequestRow` | Single request | `request`, `onApprove`, `onReject` |

#### Tab 5: Achievements
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `AchievementsSection` | Achievements grid | `achievements`, `isLoading` |
| `AchievementCard` | Single achievement | `achievement`, `progress` |
| `AchievementProgress` | Progress display | `current`, `required`, `percentage` |

#### Tab 6: Settings
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `SettingsSection` | Settings container | `user` |
| `TelegramLinkForm` | Telegram linking | `telegram`, `onChange`, `onLink`, `isLoading` |
| `TelegramGuideModal` | Linking instructions | `isOpen`, `onClose` |

#### Shared
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `CabinetTabs` | Tab navigation | `activeTab`, `onChange`, `isOrganizer`, `isAdmin` |
| `CabinetLayout` | Page layout | `children`, `tabs` |
| `DeleteConfirmationModal` | Generic delete modal | `isOpen`, `onClose`, `onConfirm`, `itemName`, `isLoading` |

### New Structure
```
components/Cabinet/
├── CabinetTabs.tsx
├── CabinetLayout.tsx
├── DeleteConfirmationModal.tsx
│
├── MyEvents/
│   ├── MyEventsSection.tsx
│   ├── FutureEventsList.tsx
│   ├── PastEventsList.tsx
│   ├── EventRegistrationCard.tsx
│   └── ReviewForm.tsx
│
├── OrganizerRequests/
│   ├── OrganizerRequestsSection.tsx
│   ├── OrganizerRequestStatus.tsx
│   └── RequestOrganizerButton.tsx
│
├── EventForm/
│   ├── EventForm.tsx
│   ├── EventFormBasic.tsx
│   ├── EventFormDateTime.tsx
│   ├── EventFormLocation.tsx
│   ├── EventFormCategory.tsx
│   ├── EventFormTags.tsx
│   ├── EventFormPricing.tsx
│   ├── EventFormTelegram.tsx
│   ├── EventFormImage.tsx
│   └── EventFormActions.tsx
│
├── OwnEvents/
│   ├── OwnEventsTable.tsx
│   ├── OwnEventRow.tsx
│   ├── EventRequestsModal.tsx
│   └── EventRequestRow.tsx
│
├── Achievements/
│   ├── AchievementsSection.tsx
│   ├── AchievementCard.tsx
│   └── AchievementProgress.tsx
│
└── Settings/
    ├── SettingsSection.tsx
    ├── TelegramLinkForm.tsx
    └── TelegramGuideModal.tsx
```

---

## 6. Admin Page (`pages/Admin/Admin.tsx`)

**Current Size:** ~1700 lines  
**Target Size:** ~100 lines (page shell) + components

### Components to Extract

#### Tab 1: Categories
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `CategoriesSection` | Categories container | `categories`, `onAdd`, `onRename`, `onDelete` |
| `AddCategoryForm` | Add form | `value`, `onChange`, `onAdd`, `isLoading` |
| `CategoryRow` | Category item | `category`, `onRename`, `onDelete` |
| `DeleteCategoryModal` | Delete confirmation | `isOpen`, `onClose`, `onConfirm`, `categoryName`, `isLoading` |

#### Tab 2: Users
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `UsersSection` | Users container | `users`, `filters`, `onBan`, `onUnassignOrganizer` |
| `UsersFilters` | Role filter and search | `roleFilter`, `searchQuery`, `onChange` |
| `UsersTable` | Users table | `users`, `onBan`, `onUnassignOrganizer` |
| `UserRow` | Single user row | `user`, `isCurrentUser`, `onBan`, `onUnassignOrganizer` |

#### Tab 3: Organizer Requests
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `OrganizerRequestsSection` | Requests container | `requests`, `onResponse` |
| `OrganizerRequestRow` | Request row | `request`, `onApprove`, `onReject` |

#### Tab 4: Events (Admin)
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `AdminEventsSection` | Events container | `events`, `onUpdate`, `onDelete` |
| `AdminEventsTable` | Events table | `events`, `onEdit`, `onDelete` |
| `AdminEventRow` | Event row | `event`, `onEdit`, `onDelete` |
| `EditEventModal` | Edit event form | `event`, `categories`, `onSave`, `onClose`, `isLoading` |
| `DeleteEventModal` | Delete confirmation | `isOpen`, `onClose`, `onConfirm`, `eventTitle`, `isLoading` |

#### Tab 5: Achievements
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `AchievementsSection` | Achievements container | `achievements`, `categories`, `onCreate`, `onUpdate`, `onDelete` |
| `AchievementForm` | Create/edit form | `achievement`, `categories`, `onChange`, `onSubmit`, `isLoading` |
| `AchievementRow` | Achievement item | `achievement`, `onEdit`, `onDelete` |
| `AchievementImagePreview` | Image preview | `imageSrc` |

#### Tab 6: Tags
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `TagsSection` | Tags container | `tags`, `onAdd`, `onRename`, `onDelete` |
| `AddTagForm` | Add form | `value`, `onChange`, `onAdd`, `isLoading` |
| `TagRow` | Tag item | `tag`, `onRename`, `onDelete` |
| `DeleteTagModal` | Delete confirmation | `isOpen`, `onClose`, `onConfirm`, `tagName`, `isLoading` |

#### Shared
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `AdminTabs` | Tab navigation | `activeTab`, `onChange`, `isMobile` |
| `AdminLayout` | Page layout | `children`, `title` |
| `MobileTabSelector` | Mobile dropdown | `activeTab`, `onChange`, `tabs` |

### New Structure
```
components/Admin/
├── AdminTabs.tsx
├── AdminLayout.tsx
├── MobileTabSelector.tsx
│
├── Categories/
│   ├── CategoriesSection.tsx
│   ├── AddCategoryForm.tsx
│   ├── CategoryRow.tsx
│   └── DeleteCategoryModal.tsx
│
├── Users/
│   ├── UsersSection.tsx
│   ├── UsersFilters.tsx
│   ├── UsersTable.tsx
│   ├── UserRow.tsx
│   └── RoleBadge.tsx
│
├── OrganizerRequests/
│   ├── OrganizerRequestsSection.tsx
│   └── OrganizerRequestRow.tsx
│
├── Events/
│   ├── AdminEventsSection.tsx
│   ├── AdminEventsTable.tsx
│   ├── AdminEventRow.tsx
│   ├── EditEventModal.tsx
│   └── DeleteEventModal.tsx
│
├── Achievements/
│   ├── AchievementsSection.tsx
│   ├── AchievementForm.tsx
│   ├── AchievementRow.tsx
│   └── AchievementImagePreview.tsx
│
└── Tags/
    ├── TagsSection.tsx
    ├── AddTagForm.tsx
    ├── TagRow.tsx
    └── DeleteTagModal.tsx
```

---

## 7. Scanner Page (`pages/Scanner/Scanner.tsx`)

**Current Size:** ~200 lines  
**Target Size:** ~50 lines (page shell) + components

### Components to Extract

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `ScannerContainer` | Scanner layout | `children` |
| `QRCodeReader` | Camera viewfinder | `onScan`, `isActive` |
| `ScanResult` | Success result display | `result` |
| `ScanError` | Error display | `error` |
| `ScannerActions` | Reset button | `onReset`, `isLoading` |

### New Structure
```
components/Scanner/
├── ScannerContainer.tsx
├── QRCodeReader.tsx
├── ScanResult.tsx
├── ScanError.tsx
└── ScannerActions.tsx
```

---

## Implementation Priority

| Priority | Page | Reason |
|----------|------|--------|
| 1 | Cabinet | Largest file (2100 lines), most complex |
| 2 | Admin | Second largest (1700 lines), many tabs |
| 3 | Event Detail | Complex registration flow, many modals |
| 4 | Events | Heavy filtering logic |
| 5 | Home | Good candidate for reusable components |
| 6 | Login | Simple, but good first step |
| 7 | Scanner | Smallest, lowest priority |

---

## Benefits of Decomposition

1. **Maintainability** - Smaller files are easier to understand and modify
2. **Reusability** - Components like `EventCard`, `ReviewCard`, `DeleteModal` can be reused
3. **Testability** - Isolated components are easier to unit test
4. **Performance** - Smaller components can be memoized individually
5. **Team Collaboration** - Multiple developers can work on different components
6. **Code Review** - Smaller changes are easier to review

---

## Guidelines for Implementation

1. **Extract incrementally** - One component at a time, with tests
2. **Maintain props interfaces** - Define clear TypeScript interfaces
3. **Use composition** - Pass children where appropriate
4. **Keep business logic in pages** - Components should be presentational
5. **Share common components** - Move shared UI to `components/common/`
6. **Document props** - Add JSDoc comments for complex props
