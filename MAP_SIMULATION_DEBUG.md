# Map Simulation Debugging Guide

## Problem Description

The simulation works on the `/map` page but not on the home page when in map visualization mode.

## Key Differences Between /map and Home Page

### /map Page

- Uses `MapBoard` component
- Uses `@/utils/aco` ACO solver
- City structure: `{ id: string, name: string, lat: number, lng: number }`
- Requires minimum 3 cities to start
- Uses OSRM API for real driving distances (with Haversine fallback)
- Simulation runs with `window.setInterval` at 100ms intervals

### Home Page

- Uses `MapVisualization` component (wrapped in `MapVisualizationWrapper`)
- Uses `@/lib/AntColony` ACO solver
- City structure: `{ id: number, x: number, y: number }` where x=lng, y=lat
- Requires minimum 2 cities to start
- Uses Euclidean distance calculation
- Simulation runs with `setInterval` at 100ms intervals

## Recent Fixes Applied

### 1. Map Click Handler

**File**: `components/MapVisualization.tsx`

- Added `isRunning` check to prevent adding cities during simulation
- Added separate useEffect to update click handler when `isRunning` changes

### 2. Map Size Invalidation

**File**: `components/MapVisualization.tsx`

- Added `map.invalidateSize()` call after initialization
- Fixes common Leaflet issue where map doesn't render properly when initially hidden

### 3. SSR Fixes (from previous session)

- Moved Leaflet CSS to global layout
- Created wrapper with dynamic import
- Added window check for icon configuration

## Potential Issues to Check

### Issue 1: Map Not Visible When Switching Modes

**Symptoms**: Map appears blank or partially rendered
**Solution**: Already fixed with `invalidateSize()` call

### Issue 2: Simulation Running But Not Visible

**Symptoms**: Iteration counter increases but no visual changes on map
**Possible Causes**:

- Pheromone lines not rendering
- Best path not updating
- Markers not updating

**Check**:

1. Open browser console
2. Switch to map mode
3. Add 2-3 cities by clicking
4. Click play button
5. Watch for:
   - Iteration counter increasing
   - Best distance changing
   - Console errors

### Issue 3: Cities Not Being Added

**Symptoms**: Clicking on map doesn't add cities
**Possible Causes**:

- Click handler not attached
- Coordinates not being passed correctly
- Map not initialized

**Check**:

1. Click on map
2. Check if city counter increases
3. Check if markers appear

### Issue 4: Simulation Not Starting

**Symptoms**: Play button doesn't start simulation
**Possible Causes**:

- Not enough cities (need at least 2)
- AntColony not initialized
- isRunning state not updating

**Check**:

1. Add 2+ cities
2. Click play
3. Check if iteration counter increases
4. Check browser console for errors

## Testing Checklist

### Canvas Mode (Should Work)

- [ ] Can add cities by clicking
- [ ] Cities appear as circles
- [ ] Play button starts simulation
- [ ] Iteration counter increases
- [ ] Best path appears as green line
- [ ] Pheromone trails appear as blue lines
- [ ] Reset button works

### Map Mode (Testing)

- [ ] Map tiles load properly
- [ ] Can add cities by clicking
- [ ] Cities appear as markers
- [ ] Play button starts simulation
- [ ] Iteration counter increases
- [ ] Best path appears as green polyline
- [ ] Pheromone trails appear as colored polylines
- [ ] Reset button works
- [ ] Cannot add cities while simulation is running

## Debug Commands

### Check if simulation is running

```javascript
// In browser console
console.log("Is Running:", document.querySelector("[data-running]"));
```

### Check city count

```javascript
// In browser console
console.log("Cities:", window.cities);
```

### Force map resize

```javascript
// In browser console
window.dispatchEvent(new Event("resize"));
```

## Next Steps if Still Not Working

1. **Add Console Logging**
   - Add `console.log` in `handlePlayPause` to verify it's being called
   - Add `console.log` in simulation loop to verify iterations are running
   - Add `console.log` in MapVisualization to verify props are updating

2. **Check React DevTools**
   - Verify `isRunning` state changes when play is clicked
   - Verify `bestPath` and `pheromones` are updating
   - Verify props are being passed to MapVisualization

3. **Compare with /map Page**
   - Check if there are any additional configurations
   - Check if there are any missing dependencies

## Code Locations

- Home page: `app/page.tsx`
- Map visualization: `components/MapVisualization.tsx`
- Map wrapper: `components/MapVisualizationWrapper.tsx`
- ACO algorithm: `lib/AntColony.ts`
- /map page (working): `app/map/page.tsx`
- MapBoard (working): `components/MapBoard.tsx`
