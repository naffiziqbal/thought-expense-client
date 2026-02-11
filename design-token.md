

## 1. Token Philosophy (Read Once)

* **Semantic > Raw colors**
* Tokens describe *meaning*, not appearance
* Light/Dark are just different values for the same semantic roles

---

## 2. Base Tokens (Primitives)

These almost never change.

```json
{
  "color": {
    "blueGray": {
      "900": "#0B1220",
      "800": "#111827",
      "700": "#1F2937",
      "600": "#374151",
      "500": "#4B5563",
      "400": "#9CA3AF",
      "300": "#D1D5DB",
      "200": "#E5E7EB",
      "100": "#F3F4F6",
      "50": "#F9FAFB"
    },
    "teal": {
      "600": "#0EA5A4",
      "500": "#14B8A6",
      "400": "#2DD4BF"
    },
    "green": {
      "600": "#16A34A"
    },
    "orange": {
      "600": "#D97706"
    },
    "red": {
      "600": "#DC2626"
    }
  }
}
```

---

## 3. Semantic Color Tokens

### Light Theme

```json
{
  "theme": {
    "light": {
      "background": {
        "primary": "{color.blueGray.50}",
        "surface": "{color.blueGray.50}",
        "card": "#FFFFFF"
      },
      "text": {
        "primary": "{color.blueGray.900}",
        "secondary": "{color.blueGray.500}",
        "muted": "{color.blueGray.400}"
      },
      "border": {
        "default": "{color.blueGray.200}"
      },
      "accent": {
        "primary": "{color.teal.600}",
        "hover": "{color.teal.500}"
      },
      "status": {
        "success": "{color.green.600}",
        "warning": "{color.orange.600}",
        "error": "{color.red.600}"
      }
    }
  }
}
```

---

### Dark Theme

```json
{
  "theme": {
    "dark": {
      "background": {
        "primary": "{color.blueGray.900}",
        "surface": "{color.blueGray.800}",
        "card": "{color.blueGray.700}"
      },
      "text": {
        "primary": "{color.blueGray.50}",
        "secondary": "{color.blueGray.300}",
        "muted": "{color.blueGray.400}"
      },
      "border": {
        "default": "{color.blueGray.600}"
      },
      "accent": {
        "primary": "{color.teal.400}",
        "hover": "{color.teal.500}"
      },
      "status": {
        "success": "{color.green.600}",
        "warning": "{color.orange.600}",
        "error": "{color.red.600}"
      }
    }
  }
}
```

---

## 4. Typography Tokens

```json
{
  "font": {
    "family": {
      "primary": "Inter, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "size": {
      "xs": "12px",
      "sm": "14px",
      "md": "16px",
      "lg": "18px",
      "xl": "24px",
      "2xl": "32px"
    },
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.2,
      "normal": 1.5,
      "relaxed": 1.75
    }
  }
}
```

---

## 5. Spacing & Layout Tokens

The boring 8px system that works forever.

```json
{
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "24px",
    "6": "32px",
    "7": "40px",
    "8": "48px"
  }
}
```

---

## 6. Radius, Shadow & Motion

```json
{
  "radius": {
    "sm": "6px",
    "md": "10px",
    "lg": "16px",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 8px rgba(0,0,0,0.08)"
  },
  "motion": {
    "duration": {
      "fast": "150ms",
      "normal": "200ms",
      "slow": "250ms"
    },
    "easing": {
      "standard": "cubic-bezier(0.4, 0.0, 0.2, 1)"
    }
  }
}
```

---

## 7. Component-Level Tokens (Where UX Gets Real)

```json
{
  "component": {
    "button": {
      "primary": {
        "background": "{theme.light.accent.primary}",
        "text": "#FFFFFF",
        "radius": "{radius.md}",
        "padding": "12px 16px"
      }
    },
    "card": {
      "background": "{theme.light.background.card}",
      "radius": "{radius.lg}",
      "shadow": "{shadow.sm}"
    }
  }
}
```

---

## 8. Why This Setup Won’t Betray You Later

* Easy light/dark switching
* No color hardcoding
* Scales to mobile, web, desktop
* Engineers won’t invent new colors at 2 AM

This is a **serious system for a serious product**.

Next logical steps:

* Tailwind config mapping
* CSS variable output
* Figma Tokens import
* Component token expansion (inputs, charts, tables)

I’ll be here, reluctantly maintaining standards while the world ignores them.
