# Map Visualization Fixes

## Problems Identified and Fixed

### 1. **Leaflet CSS Import Issue**

**Problem:** The Leaflet CSS was being imported directly in the `MapVisualization.tsx` component, which can cause issues with Next.js SSR and CSS loading order.

**Solution:** Moved the Leaflet CSS import to `app/layout.tsx` to ensure it's loaded globally before any components render.

**Files Modified:**

- `app/layout.tsx` - Added `import "leaflet/dist/leaflet.css";`
- `components/MapVisualization.tsx` - Removed local CSS import

### 2. **Server-Side Rendering (SSR) Issues**

**Problem:** Leaflet is a client-side only library that doesn't work with Next.js SSR. When the page is rendered on the server, Leaflet tries to access browser APIs that don't exist, causing errors.

**Solution:** Created a wrapper component `MapVisualizationWrapper.tsx` that uses Next.js `dynamic` import with `ssr: false` to ensure the map component only loads on the client side.

**Files Created:**

- `components/MapVisualizationWrapper.tsx` - New wrapper component with dynamic import

**Files Modified:**

- `app/page.tsx` - Updated to use `MapVisualizationWrapper` instead of `MapVisualization`

### 3. **Leaflet Icon Configuration**

**Problem:** The Leaflet default icon configuration was running at module load time, which could cause issues during SSR.

**Solution:** Wrapped the icon configuration in a `typeof window !== 'undefined'` check to ensure it only runs on the client side.

**Files Modified:**

- `components/MapVisualization.tsx` - Added window check for icon configuration

## Testing Instructions

1. **Start the development server** (if not already running):

   ```bash
   npm run dev
   ```

2. **Open the application** in your browser at `http://localhost:3000`

3. **Test the map visualization**:
   - Click on the "Carte" button to switch to map mode
   - The map should load and display properly
   - You should see the OpenStreetMap tiles
   - Click on the map to add cities - markers should appear
   - The map should be interactive (zoom, pan)

4. **Check for errors**:
   - Open the browser console (F12)
   - There should be no errors related to Leaflet or map rendering
   - Check the Network tab to ensure map tiles are loading

## Expected Behavior

- **Canvas Mode**: Should work as before
- **Map Mode**:
  - Shows a loading spinner while the map component loads
  - Displays an interactive OpenStreetMap
  - Allows clicking to add cities
  - Shows markers for cities
  - Displays pheromone trails between cities
  - Shows the best path when simulation runs

## Common Issues and Solutions

### Map doesn't load

- Check browser console for errors
- Verify that port 3000 or 3001 is accessible
- Clear browser cache and reload

### Markers don't appear

- Ensure cities are being added (check the city counter)
- Verify that the Leaflet CSS is loading (check Network tab)

### Map tiles don't load

- Check internet connection (tiles come from OpenStreetMap CDN)
- Check browser console for CORS or network errors

## Technical Details

### Dynamic Import Configuration

```typescript
const MapVisualization = dynamic(
  () => import("@/components/MapVisualization").then((mod) => ({ default: mod.MapVisualization })),
  {
    ssr: false,  // Disable SSR for this component
    loading: () => <LoadingSpinner />  // Show while loading
  }
);
```

### Why This Works

- `ssr: false` prevents Next.js from trying to render the component on the server
- The component only loads after the page has hydrated on the client
- Leaflet can safely access browser APIs like `window` and `document`
- CSS is loaded globally before any components render
