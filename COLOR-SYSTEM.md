# F1 Dashboard Color System 2026

Paleta oficial de colores para los 11 equipos de Fórmula 1 en la temporada 2026.

## Equipos Constructores

### Red Bull Racing
- **Hex**: `#E30118`
- **RGB**: `(227, 1, 24)`
- **Secondary**: `#FDD900` (Amarillo)
- **Tertiary**: `#C0BFBF` (Plata)
- **Name**: Rojo Red Bull

### McLaren
- **Hex**: `#FF8700`
- **RGB**: `(255, 135, 0)`
- **Secondary**: `#000000` (Negro)
- **Name**: Papaya Naranja

### Scuderia Ferrari
- **Hex**: `#DC0000`
- **RGB**: `(220, 0, 0)`
- **Secondary**: `#FFFFFF` (Blanco)
- **Name**: Rojo Corsa

### Mercedes-AMG F1
- **Hex**: `#00D4BE`
- **RGB**: `(0, 212, 190)`
- **Secondary**: `#000000` (Negro)
- **Tertiary**: `#C1C3B9` (Plata)
- **Name**: Turquesa/Plateado

### Williams Racing
- **Hex**: `#0082FA`
- **RGB**: `(0, 130, 250)`
- **Secondary**: `#FFFFFF` (Blanco)
- **Name**: Azul Royale

### Aston Martin F1
- **Hex**: `#006F62`
- **RGB**: `(0, 111, 98)`
- **Secondary**: `#FF9F00` (Naranja)
- **Name**: Verde Británico

### Alpine F1
- **Hex**: `#0082FA`
- **RGB**: `(0, 130, 250)`
- **Secondary**: `#FFB300` (Dorado)
- **Name**: Azul Renault

### Haas F1
- **Hex**: `#000000`
- **RGB**: `(0, 0, 0)`
- **Secondary**: `#FFFFFF` (Blanco)
- **Tertiary**: `#EB6E1A` (Rojo/Toyota)
- **Name**: Negro y Blanco

### Racing Bulls
- **Hex**: `#FFFFFF`
- **RGB**: `(255, 255, 255)`
- **Secondary**: `#0082FA` (Azul)
- **Name**: Blanco y Azul

### Audi F1
- **Hex**: `#8B8B8B`
- **RGB**: `(139, 139, 139)`
- **Secondary**: `#DC0000` (Rojo)
- **Tertiary**: `#000000` (Negro)
- **Name**: Plata/Gris con Rojo

### Cadillac F1
- **Hex**: `#FFFFFF`
- **RGB**: `(255, 255, 255)`
- **Secondary**: `#000000` (Negro)
- **Name**: Blanco y Negro (diseño dos caras)

## UI Base Colors

```css
:root {
  /* Surface */
  --surface-base: #080808;
  --surface-elevated: #0a0a0a;
  --surface-hover: #0f0f0f;
  --surface-pressed: #141414;

  /* Text */
  --text-primary: #f0f0f0;
  --text-secondary: #8a8a8a;
  --text-tertiary: #444;

  /* Borders */
  --border-default: #1f1f1f;
  --border-subtle: #141414;
  --border-dark: #0f0f0f;

  /* Status */
  --status-success: #00d25b;
  --status-warning: #ffc906;
  --status-error: #e10600;
  --status-info: #ff9500;

  /* Timing/Monospace */
  --timing-family: 'JetBrains Mono', monospace;
}
```

## Uso en Componentes

### En Vue Components
```vue
<script setup>
import { getTeamColor } from '~/utils/team-colors'

const teamColor = getTeamColor('Ferrari')
</script>

<template>
  <div :style="{ backgroundColor: teamColor }" />
</template>
```

### CSS Personalizado
Todas las tablas y tarjetas usan:
- Texto primario: `#f0f0f0`
- Fondos: `#0a0a0a` con bordes `#1f1f1f`
- Hover: `#0f0f0f`
- Énfasis de colores: RGB específicos de cada equipo

## Notas

- Todos los colores siguen la paleta oficial 2026 de la FIA
- Colores secundarios para acentos y variantes (eg. bandera a cuadros)
- Sistema pensado para dark mode (tema por defecto del dashboard)
- Colores de status (verde, naranja, rojo) consistentes con F1 broadcasting
