# WCSv2.0 Performance Optimization Guide

## 📊 Current Performance Status

- **Bundle Size**: 192kB First Load JS (drills page)
- **Build Time**: ~36.8s compilation
- **Security Score**: 10/10 (Perfect)
- **Vulnerabilities**: 0 (Clean)
- **Core Web Vitals**: Needs improvement

## 🎯 Optimization Roadmap

This document outlines performance issues identified in the WCSv2.0 web application and provides detailed recommendations for improvement. Each issue is categorized by impact and effort level to help prioritize implementation.

---

## 🚨 Critical Issues (High Impact, Low Effort)

### 1. Image Optimization Issues

#### **Problem**: Unoptimized Images Impacting Performance

- **Location**: `src/components/Hero.tsx`
- **Issue**: Large GIF file (`basketball-flames.gif`) marked as `unoptimized`
- **Impact**: Significant LCP (Largest Contentful Paint) impact
- **Current Size**: Estimated 500KB+ for animated GIF

#### **Recommendations**:

```typescript
// Convert GIF to optimized formats
<Image
  src="/video/basketball-flames.webp" // Primary format
  alt="Basketball flames animation"
  width={384}
  height={384}
  className="w-96 h-96 object-contain"
  priority
  // Remove unoptimized prop
/>
```

#### **Implementation Steps**:

1. Convert GIF to WebP format with fallback
2. Add proper `sizes` attributes to all Image components
3. Compress placeholder images (currently 18KB+ each)
4. Implement lazy loading for below-the-fold images

---

### 2. CSS Performance Issues

#### **Problem**: Redundant and Inefficient CSS

- **Location**: `src/app/globals.css`
- **Issue**: Duplicate `scroll-behavior: smooth` declarations
- **Impact**: Unnecessary CSS parsing and rendering

#### **Current Code**:

```css
/* Smooth scrolling for the entire page */
html {
  scroll-behavior: smooth;
}

/* Smooth scrolling for all elements */
* {
  scroll-behavior: smooth; /* REDUNDANT */
}
```

#### **Recommended Fix**:

```css
/* Smooth scrolling for the entire page */
html {
  scroll-behavior: smooth;
}

/* Remove the universal selector rule */
```

#### **Additional CSS Optimizations**:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.ttf") format("truetype");
  font-weight: 400;
  font-display: swap; /* Add this for better performance */
}

@font-face {
  font-family: "Bebas Neue";
  src: url("/fonts/BebasNeue-Regular.ttf") format("truetype");
  font-display: swap; /* Add this for better performance */
}
```

---

## ⚠️ High Impact Issues (Medium Effort)

### 3. Bundle Size Optimization

#### **Problem**: Large JavaScript Bundle

- **Current Size**: 192kB First Load JS
- **Heavy Dependencies**: Framer Motion (12.23.12), FullCalendar, Swiper
- **Impact**: Slow initial page load, poor mobile performance

#### **Dependencies Analysis**:

```json
{
  "framer-motion": "^12.23.12", // ~50KB
  "@fullcalendar/core": "^6.1.19", // ~30KB
  "@fullcalendar/react": "^6.1.15", // ~20KB
  "swiper": "^12.0.1", // ~25KB
  "react-icons": "^5.5.0" // ~15KB
}
```

#### **Optimization Strategy**:

**A. Code Split Heavy Components**:

```typescript
// Lazy load FullCalendar only when needed
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
  loading: () => <div>Loading calendar...</div>,
});
```

**B. Tree Shake Framer Motion**:

```typescript
// Instead of importing entire library
import { motion } from "framer-motion";

// Import only needed functions
import { motion, AnimatePresence } from "framer-motion";
// Or even better, use CSS animations for simple cases
```

**C. Optimize Icon Imports**:

```typescript
// Instead of importing entire icon library
import { FaBasketball, FaUser } from "react-icons/fa";

// Import specific icons only
import FaBasketball from "react-icons/fa/FaBasketball";
import FaUser from "react-icons/fa/FaUser";
```

---

### 4. Real-time Connection Optimization

#### **Problem**: Multiple WebSocket Connections

- **Current State**: Each page creates separate Supabase channels
- **Impact**: Increased memory usage, connection overhead
- **Locations**:
  - `src/components/dashboard/MessageBoard.tsx`
  - `src/app/coaches/dashboard/page.tsx`
  - `src/app/teams/[id]/page.tsx`

#### **Current Implementation Issues**:

```typescript
// Multiple separate channels being created
const channel1 = supabase.channel("coach-messages");
const channel2 = supabase.channel("team_schedules");
const channel3 = supabase.channel("team_updates");
```

#### **Recommended Solution**:

Create a centralized real-time manager:

```typescript
// src/lib/realtimeManager.ts
class RealtimeManager {
  private channels: Map<string, any> = new Map();

  subscribe(table: string, filters: any, callback: Function) {
    const channelKey = `${table}_${JSON.stringify(filters)}`;

    if (this.channels.has(channelKey)) {
      return this.channels.get(channelKey);
    }

    const channel = supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: filters,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelKey, channel);
    return channel;
  }

  unsubscribe(channelKey: string) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelKey);
    }
  }
}

export const realtimeManager = new RealtimeManager();
```

---

## 🔧 Medium Impact Issues (Medium Effort)

### 5. Data Fetching Optimization

#### **Problem**: N+1 Query Pattern and Over-fetching

- **Location**: `src/lib/actions.ts`
- **Issue**: Multiple separate API calls instead of optimized queries
- **Impact**: Slower page loads, increased database load

#### **Current Issues**:

```typescript
// Multiple separate calls
const [coachesData, schedulesData, updatesData] = await Promise.all([
  fetchCoachesByTeamId(teamId),
  fetchSchedulesByTeamId(teamId),
  fetchTeamUpdates(teamId),
]);
```

#### **Recommended Solution**:

Implement React Query for caching and data synchronization:

```typescript
// src/lib/queries.ts
import { useQuery } from "@tanstack/react-query";

export const useTeamData = (teamId: string) => {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => fetchTeamWithAllData(teamId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Optimized single query
export async function fetchTeamWithAllData(teamId: string) {
  const { data, error } = await supabase
    .from("teams")
    .select(
      `
      *,
      team_coaches(
        coaches(first_name, last_name, image_url)
      ),
      schedules(*),
      team_updates(*)
    `
    )
    .eq("id", teamId)
    .single();

  return data;
}
```

---

### 6. Animation Performance

#### **Problem**: Heavy JavaScript Animations

- **Location**: `src/components/LogoMarquee.tsx`, `src/components/ValuesSection.tsx`
- **Issue**: Continuous 45-second animation with 22 logo images
- **Impact**: CPU usage, battery drain on mobile devices

#### **Current Implementation**:

```typescript
// Heavy JavaScript animation
<motion.div
  animate={{ x: ["0%", "-100%"] }}
  transition={{ duration: 45, ease: "linear", repeat: Infinity }}
>
```

#### **Recommended Solution**:

Replace with CSS animations for better performance:

```css
/* CSS-based marquee animation */
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.marquee {
  animation: marquee 45s linear infinite;
  will-change: transform; /* Optimize for animations */
}

.marquee:hover {
  animation-play-state: paused;
}
```

---

## 🔍 Low Impact Issues (Low Effort)

### 7. Memory Leak Prevention

#### **Problem**: Potential Memory Leaks

- **Locations**: Multiple useEffect hooks across components
- **Issue**: Event listeners and subscriptions not properly cleaned up

#### **Current Issues**:

```typescript
// Missing cleanup in some components
useEffect(() => {
  const handleScroll = () => {
    /* ... */
  };
  window.addEventListener("scroll", handleScroll);
  // Missing cleanup
}, []);
```

#### **Recommended Fix**:

```typescript
useEffect(() => {
  const handleScroll = () => {
    /* ... */
  };
  window.addEventListener("scroll", handleScroll);

  // Always return cleanup function
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
```

---

### 8. Font Loading Optimization

#### **Problem**: Blocking Font Loading

- **Location**: `src/app/globals.css`
- **Issue**: Fonts loaded without `font-display: swap`
- **Impact**: Layout shift and slower text rendering

#### **Current Implementation**:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.ttf") format("truetype");
  font-weight: 400;
}
```

#### **Recommended Fix**:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.ttf") format("truetype");
  font-weight: 400;
  font-display: swap; /* Add this */
}
```

---

## 🚀 Advanced Optimizations (High Effort, High Impact)

### 9. Service Worker Implementation

#### **Purpose**: Offline functionality and aggressive caching

#### **Benefits**:

- Faster subsequent page loads
- Offline functionality
- Reduced server load

#### **Implementation**:

```typescript
// public/sw.js
const CACHE_NAME = "wcs-v1";
const urlsToCache = [
  "/",
  "/static/css/main.css",
  "/static/js/main.js",
  "/fonts/Inter-Regular.ttf",
  "/fonts/BebasNeue-Regular.ttf",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});
```

---

### 10. Database Query Optimization

#### **Problem**: Inefficient Database Queries

#### **Current Issues**:

- Complex nested joins
- No query caching
- Over-fetching data

#### **Recommended Solutions**:

**A. Add Database Indexes**:

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_schedules_team_id ON schedules(team_id);
CREATE INDEX idx_team_updates_team_id ON team_updates(team_id);
CREATE INDEX idx_coach_messages_created_at ON coach_messages(created_at);
```

**B. Implement Query Caching**:

```typescript
// src/lib/cache.ts
const cache = new Map();

export function getCachedData(key: string, fetcher: Function, ttl = 300000) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

---

## 📋 Implementation Priority Matrix

### Phase 1: Quick Wins (1-2 days)

1. ✅ Fix CSS redundancy in `globals.css`
2. ✅ Add `font-display: swap` to font declarations
3. ✅ Optimize image loading with proper `sizes` attributes
4. ✅ Convert GIF to WebP format

### Phase 2: Bundle Optimization (3-5 days)

1. ✅ Implement code splitting for heavy components
2. ✅ Tree shake Framer Motion imports
3. ✅ Optimize icon imports
4. ✅ Lazy load FullCalendar

### Phase 3: Data Layer (1-2 weeks)

1. ✅ Implement React Query for caching
2. ✅ Optimize database queries
3. ✅ Centralize real-time connections
4. ✅ Add query caching layer

### Phase 4: Advanced Features (2-3 weeks)

1. ✅ Implement Service Worker
2. ✅ Add database indexes
3. ✅ Optimize animations with CSS
4. ✅ Implement resource preloading

---

## 📊 Expected Performance Improvements

### Bundle Size Reduction

- **Current**: 192kB First Load JS
- **Target**: 120-140kB First Load JS
- **Improvement**: 25-30% reduction

### Core Web Vitals

- **LCP**: Improve from current to <2.5s
- **FID**: Improve to <100ms
- **CLS**: Maintain <0.1

### Loading Performance

- **Initial Load**: 20-30% faster
- **Subsequent Loads**: 50-70% faster (with caching)
- **Mobile Performance**: Significant improvement

---

## 🔧 Monitoring and Measurement

### Tools to Implement

1. **Web Vitals Monitoring**: Already implemented with Vercel Analytics
2. **Bundle Analyzer**: Add `@next/bundle-analyzer` for ongoing monitoring
3. **Performance Budget**: Set limits for bundle size and loading times
4. **Real User Monitoring**: Track actual user performance metrics

### Key Metrics to Track

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Bundle size per route

---

## 📝 Implementation Notes

### Testing Strategy

1. **Performance Testing**: Use Lighthouse CI for automated testing
2. **Load Testing**: Test with realistic data volumes
3. **Mobile Testing**: Test on actual mobile devices
4. **Network Testing**: Test on slow 3G connections

### Rollout Strategy

1. **Feature Flags**: Implement feature flags for gradual rollout
2. **A/B Testing**: Test performance improvements with subset of users
3. **Monitoring**: Closely monitor performance metrics during rollout
4. **Rollback Plan**: Prepare rollback strategy if issues arise

---

## 🎯 Success Criteria

### Performance Targets

- [ ] Bundle size reduced by 25-30%
- [ ] LCP improved to <2.5s
- [ ] FID improved to <100ms
- [ ] CLS maintained at <0.1
- [ ] Mobile performance score >90

### User Experience Goals

- [ ] Faster page loads
- [ ] Smoother animations
- [ ] Better mobile experience
- [ ] Reduced data usage
- [ ] Improved accessibility

---

_Last Updated: January 2025_
_Version: 1.0_
_Status: Ready for Implementation_
