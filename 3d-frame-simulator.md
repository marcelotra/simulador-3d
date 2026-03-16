# 3D Frame Simulator Plan

## Overview
A standalone web application for simulating custom picture frames in ultra-realistic 3D. Users can upload their own images, choose frame textures and profiles, add passe-partout (with customizable colors and thicknesses), and select glass types. The system will also perform dynamic calculations for the costs of materials (glass, frame, passe-partout, printing).

## Project Type
WEB

## Success Criteria
- Ultra-realistic 3D preview of frames using React Three Fiber with proper lighting and reflections.
- Procedural frame generation based on technical profiles to support dynamic dimensions.
- Support for custom user image uploads displayed inside the frame.
- Real-time adjustment of frame size, passe-partout margins, and glass materials.
- Real-time calculation of material costs based on measurements.
- High performance (60fps 3D rendering).
- Unique, minimalist UI design, avoiding safe/cliché standard templates.

## Tech Stack
- **Framework:** Vite + React + TypeScript (Optimized for SPA and 3D rendering without SSR overhead for the canvas).
- **3D Engine:** Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`). Provide powerful declarative 3D abstractions.
- **Styling:** Tailwind CSS v4.
- **State Management:** Zustand (Ideal for complex, highly-interactive client-side configuration states).
- **Calculations:** Client-side TypeScript utilities for geometric math and pricing.

## File Structure
```text
src/
├── components/
│   ├── 3d/
│   │   ├── Scene.tsx
│   │   ├── FrameModel.tsx
│   │   ├── Passepartout.tsx
│   │   ├── Glass.tsx
│   │   ├── Lighting.tsx
│   │   └── Controls.tsx
│   ├── ui/
│   │   ├── Sidebar.tsx
│   │   ├── Configurator.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── MaterialSelector.tsx
│   │   └── PriceSummary.tsx
├── store/
│   └── useSimulatorStore.ts
├── utils/
│   ├── calculations.ts
│   └── geometryBuilders.ts
├── App.tsx
└── main.tsx
```

## Task Breakdown

### 1. Initialize Project
- **Agent:** `app-builder`
- **Skills:** `react-best-practices`, `app-builder`
- **INPUT:** Empty project
- **OUTPUT:** Running Vite+React+TS scaffold with Three.js, R3F, Zustand, and Tailwind.
- **VERIFY:** `npm run dev` works and displays a blank canvas.

### 2. State Management & Pricing Logic
- **Agent:** `frontend-specialist`
- **Skills:** `clean-code`
- **INPUT:** Store requirements and calculation rules
- **OUTPUT:** `useSimulatorStore.ts`, `calculations.ts`
- **VERIFY:** State updates correctly calculate the total price based on width/height/materials.

### 3. 3D Canvas & Procedural Frame Geometry
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **INPUT:** Frame texture and 2D technical profile
- **OUTPUT:** `<Canvas>` rendering a procedural 3D frame (extruding the profile along a path) with 45-degree miter joints.
- **VERIFY:** Frame renders interactively and scales dynamically when store dimensions are changed.

### 4. Passe-partout, Glass & Image Integration
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **INPUT:** Image upload UI and material settings
- **OUTPUT:** Inner passe-partout geometry, `MeshPhysicalMaterial` for glass (with transmission), and image texture mapping on the inner canvas.
- **VERIFY:** Image maps correctly inside the frame; glass physically reflects the environment.

### 5. Configurator UI
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `ui-ux-pro-max`
- **INPUT:** UI Design system (sharp geometry, brutalist/minimalist aesthetic)
- **OUTPUT:** Functional sidebar communicating with the Zustand store.
- **VERIFY:** Changing dimensions or materials in UI updates the 3D model and price summary instantly.

## Phase X: Verification
- [ ] **Lint:** `npm run lint` & Type check pass.
- [ ] **UX Audit:** Verify unique aesthetic (No templates, sharp geometric style applied). No purple.
- [ ] **Performance:** 60fps stable during 3D interactions.
- [ ] **Build:** `npm run build` succeeds without TS errors.
