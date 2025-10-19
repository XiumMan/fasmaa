# Feature Icons Needed for Launch Sequence

## Overview
You need to create **6 custom icons** for the FASMAA launch ceremony features showcase. These will replace the emoji placeholders currently in use.

## Icon Specifications

### Format Requirements:
- **File Format**: SVG (preferred) or PNG with transparent background
- **Size**: 512x512px minimum (will be displayed large on screen)
- **Style**: Clean, modern, technical/medical theme
- **Colors**: Monochrome or with cyan/teal accent (#4ECDC4) to match theme
- **Background**: Transparent

### File Naming Convention:
- Place icons in: `/public/icons/features/`
- Name format: `feature-{number}-{name}.svg` or `.png`

---

## Icon List

### 1. Real-time IPC Surveillance
**File**: `feature-1-surveillance.svg`

**Current Placeholder**: 📊 (bar chart emoji)

**Icon Concept**:
- Hospital building with monitoring waves/signals
- Dashboard with graphs and charts
- Pulse/heartbeat line with data points
- Surveillance camera with medical cross
- Combination of: hospital icon + chart/graph + real-time indicator

**Key Elements**:
- Should convey: monitoring, data tracking, real-time
- Medical/hospital context
- Data visualization aspect

---

### 2. Outbreak Detection
**File**: `feature-2-outbreak.svg`

**Current Placeholder**: 🚨 (alarm emoji)

**Icon Concept**:
- Alert symbol with spreading particles/germs
- Cluster detection visualization (connected dots spreading)
- Warning triangle with bacteria/virus symbols
- Map with outbreak hotspot indicators
- Radar/detection scanning effect

**Key Elements**:
- Should convey: alert, danger, spreading infection
- Detection/scanning aspect
- Urgency and warning

---

### 3. Antimicrobial Stewardship
**File**: `feature-3-stewardship.svg`

**Current Placeholder**: 💊 (pill emoji)

**Icon Concept**:
- Pill/capsule with shield or protective barrier
- Antibiotic molecules with resistance indicator
- Medicine bottle with optimization/efficiency symbols
- Balance/scale with antibiotics and bacteria
- Circuit board pattern with pill (tech-enabled medicine)

**Key Elements**:
- Should convey: medicine, protection, optimization
- Resistance tracking
- Intelligent/smart use of antibiotics

---

### 4. Automated Reporting
**File**: `feature-4-reporting.svg`

**Current Placeholder**: 📄 (document emoji)

**Icon Concept**:
- Document with checkmarks and automated workflow arrows
- Report/clipboard with transmission waves
- Government building receiving data
- Automated pipeline from hospital to ministry
- Document with circular arrows (automation)

**Key Elements**:
- Should convey: automation, reporting, compliance
- Data transmission
- Government/ministry connection

---

### 5. Clinical Decision Support
**File**: `feature-5-clinical.svg`

**Current Placeholder**: ⚕️ (medical symbol emoji)

**Icon Concept**:
- Stethoscope with AI/brain circuit
- Medical cross with information/data indicators
- Doctor silhouette with knowledge/insight symbols
- Medical decision tree/flowchart
- Hand holding medical symbol with guidance arrows

**Key Elements**:
- Should convey: clinical care, decision making, guidance
- Medical expertise
- Data-driven insights

---

### 6. Advanced Analytics
**File**: `feature-6-analytics.svg`

**Current Placeholder**: 📈 (chart increasing emoji)

**Icon Concept**:
- Trend lines with predictive arrows pointing forward
- Crystal ball with data/graphs inside
- Graph with AI/ML nodes
- Magnifying glass over complex data patterns
- Brain made of data points and trend lines

**Key Elements**:
- Should convey: prediction, trends, intelligence
- Advanced data analysis
- Future-looking/predictive

---

## Design Guidelines

### Color Palette:
- **Primary**: Cyan/Teal (#4ECDC4)
- **Secondary**: White or light gray
- **Accent**: Dark slate (#0f172a) for contrast
- **Optional**: Small red accent for alerts/warnings (outbreak icon)

### Style Recommendations:
1. **Line Icons**: Clean line-based icons work well for digital displays
2. **Minimalist**: Avoid too much detail - icons will be enlarged
3. **Consistent Weight**: Keep line thickness consistent across all icons
4. **Recognizable**: Should be understandable at a glance
5. **Professional**: Medical/technical aesthetic, not playful

### Inspiration:
- Think: Hospital dashboards, medical software, data visualization tools
- Reference: Healthcare technology UI, medical device interfaces
- Style similar to: Material Design health icons, Font Awesome medical set

---

## Implementation

Once you create the icons, place them in:
```
/public/icons/features/
```

Then update the features array in `/src/app/launch/page.tsx` (around line 32) to use the new icons:

```javascript
const features = [
  {
    title: "Real-time IPC Surveillance",
    description: "Monitor hospital-acquired infections...",
    icon: <Image src="/icons/features/feature-1-surveillance.svg" alt="Surveillance" width={192} height={192} />,
    // ... or if using Unicode/component:
    icon: "🔍", // Replace with your custom component/SVG
  },
  // ... repeat for all 6 features
];
```

---

## Quick Reference Table

| # | Feature Name | Current | Suggested Main Element |
|---|-------------|---------|----------------------|
| 1 | Real-time Surveillance | 📊 | Hospital + Chart |
| 2 | Outbreak Detection | 🚨 | Alert + Spread Pattern |
| 3 | Antimicrobial Stewardship | 💊 | Pill + Shield |
| 4 | Automated Reporting | 📄 | Document + Automation |
| 5 | Clinical Decision Support | ⚕️ | Medical Symbol + Data |
| 6 | Advanced Analytics | 📈 | Trend + Prediction |

---

## Tools for Icon Creation

### Recommended:
- **Figma** (free, web-based, great for SVG export)
- **Adobe Illustrator** (professional, precise vector control)
- **Inkscape** (free, open-source alternative to Illustrator)
- **Canva** (easy, template-based)

### Online Icon Editors:
- **Iconfinder** - search and customize existing medical icons
- **Flaticon** - download and customize health/medical icon sets
- **SVGRepo** - free SVG medical icons to modify

---

## Timeline
Create these icons at your convenience. The launch sequence will work with the emoji placeholders until custom icons are ready.

**Priority**: Medium (visual polish, not functionality)

---

Good luck with the icon design! 🎨
