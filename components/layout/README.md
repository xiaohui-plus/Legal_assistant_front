# Layout Components

This directory contains the main layout components for the Legal Assistant App UI.

## Components

### Sidebar.vue
- **Purpose**: Left navigation sidebar with brand logo and navigation menu
- **Features**:
  - Brand logo area with indigo gradient
  - Navigation menu items (Legal Consultation, Document Generation, Case Search, History)
  - Active state styling with indigo-50 background
  - Hover effects with slate-50 background
  - Bottom version info card with gradient background
  - Uses Iconify heroicons

### Header.vue
- **Purpose**: Top header with glass morphism effect
- **Features**:
  - Sticky positioning with backdrop blur
  - Current conversation title display
  - Share report button
  - User avatar with click handler
  - Responsive design

### RightSidebar.vue
- **Purpose**: Right sidebar container for knowledge cards and case lists
- **Features**:
  - Knowledge cards section with related laws
  - Typical cases section with case summaries
  - Bottom certification footer
  - Scrollable content with hidden scrollbar
  - Fixed positioning

## Usage

```vue
<template>
  <div class="layout-container">
    <Sidebar />
    <div class="main-content">
      <Header :title="pageTitle" />
      <!-- Main content here -->
    </div>
    <RightSidebar />
  </div>
</template>
```

## Design System

- **Colors**: Based on Tailwind CSS indigo and slate color palettes
- **Typography**: Uses consistent font sizes and weights
- **Spacing**: 4px base unit system (8rpx, 16rpx, 24rpx, etc.)
- **Borders**: Consistent border radius (8rpx, 12rpx, 16rpx, 32rpx)
- **Shadows**: Layered shadow system for depth
- **Icons**: Heroicons via Iconify

## Dependencies

- `@iconify/vue`: For icon components
- Heroicons icon set