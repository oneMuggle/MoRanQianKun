# Settings Panel Desktop-Mobile Unification Spec

## ADDED Requirements

### Requirement: Mobile Settings SHALL include all desktop Settings tabs

The mobile Settings modal uses `SettingsPanel` with `navMode='pills'` prop to render all setting tabs in a mobile-friendly vertical pill navigation layout.

#### Scenario: Mobile Settings shows IntegratedModelSettings tab

- **WHEN** mobile user navigates to Settings and selects "integrated_models" tab
- **THEN** mobile displays IntegratedModelSettings panel with complete configuration options

#### Scenario: Mobile Settings shows NpcManager tab

- **WHEN** mobile user navigates to Settings and selects "npc" tab  
- **THEN** mobile displays NpcManager panel for NPC CRUD operations

### Requirement: Mobile and Desktop Settings SHALL share identical Props API

The `SettingsPanel` component receives identical props for both desktop and mobile, differentiated only by the `navMode` prop:
- `navMode='sidebar'` for desktop (horizontal sidebar navigation)
- `navMode='pills'` for mobile (vertical pill navigation)

#### Scenario: Both modals receive same onSaveApi prop

- **WHEN** desktop Settings calls onSaveApi with API config
- **AND** mobile Settings calls onSaveApi with API config  
- **THEN** both receive identical prop signatures

### Requirement: SaveLoad modal SHALL be unified across devices

The SaveLoad functionality uses separate desktop/mobile components with device-appropriate layouts:
- Desktop: `SaveLoadModal.tsx` - three-column layout with import/export ZIP support
- Mobile: `MobileSaveLoadModal.tsx` - single-column touch-friendly layout

This is intentional design difference for optimal user experience on each device type.

#### Scenario: SaveLoad uses responsive component

- **WHEN** user opens SaveLoad modal on desktop
- **THEN** SaveLoadModal renders with three-column layout
- **WHEN** user opens SaveLoad modal on mobile
- **THEN** MobileSaveLoadModal renders with touch-friendly single-column layout

---

## Implementation Details

### Settings Panel

**Component**: `components/features/Settings/SettingsPanel.tsx`

**Props Interface** (identical for both devices):
```typescript
interface SettingsPanelProps {
    navMode: 'sidebar' | 'pills';
    tabs: SettingsTabItem[];
    activeTab: SettingsTabId;
    onTabChange: (tab: SettingsTabId) => void;
    onClose: () => void;
    apiConfig: 接口设置结构;
    visualConfig: 视觉设置结构;
    // ... all other props identical
}
```

**Tab Definitions**: `components/features/Settings/tabDefinitions.ts`
- `desktopTabs`: 23 setting tabs for desktop
- `mobileTabs`: 23 setting tabs for mobile (same tabs, shorter labels)

### SaveLoad Components

**Desktop**: `components/features/SaveLoad/SaveLoadModal.tsx`
- Three-column layout: character panel | save list | details panel
- Import/export ZIP functionality
- Save protection toggle

**Mobile**: `components/features/SaveLoad/MobileSaveLoadModal.tsx`
- Single-column card list layout
- Touch-friendly operation menu
- Essential save/load/delete functionality

---

## Verification Checklist

- [x] Mobile Settings includes all 23 setting tabs
- [x] IntegratedModelSettings panel accessible on mobile
- [x] NpcManager panel accessible on mobile  
- [x] SettingsPanel props identical for desktop and mobile
- [x] SaveLoad has device-appropriate implementations
- [x] Tab labels shorter in mobileTabs for UI consistency
