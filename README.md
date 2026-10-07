# Sitio web vSApp Ltda.

Sitio web corporativo de **vSApp Ltda.**, consultora chilena especialista en soluciones SAP PM (Mantenimiento de Planta), SAP PP (Planificación de Producción) y aplicaciones móviles conectadas a SAP S/4HANA y SAP ECC.

## Arquitectura

Se optó por una **landing única con anclas** (`index.html`) en lugar de un sitio multipágina. Razones:

- El contenido disponible (misión, 4 pilares de servicios, apps móviles, metodología, contacto) cabe cómodamente en un recorrido de scroll continuo, que es precisamente el patrón que usan consultoras boutique de referencia (McKinsey, BCG, Bain) en sus landings de línea de servicio.
- Favorece el efecto de "storytelling" con microanimaciones on-scroll y una navegación fluida por anclas, reforzando la sensación de solidez y narrativa de valor.
- Es más simple de mantener para un equipo pequeño y concentra todo el SEO de la página en una sola URL fuerte.

Si en el futuro se requiere contenido extenso por sección (por ejemplo, casos de éxito detallados o un blog), se recomienda separar esas secciones en páginas propias (`casos.html`, `blog.html`, etc.) manteniendo `index.html` como landing principal.

## Estructura de carpetas

```
00 Página Web/
├── index.html          # Página única con todas las secciones ancladas
├── README.md           # Este archivo
├── css/
│   └── styles.css      # Estilos (variables CSS, layout, responsive, animaciones)
├── js/
│   └── main.js         # Lógica: navbar, scroll, animaciones, formulario, etc.
└── assets/
    └── img/             # Carpeta reservada para imágenes reales (logo, fotos, capturas de la app)
```

> Los mockups de la app móvil en la sección "Aplicaciones móviles" están construidos en **CSS puro** (sin imágenes) como placeholders elegantes. Se recomienda reemplazarlos por capturas reales de la app PM Mobile cuando estén disponibles — ver sección "Cómo reemplazar los mockups" más abajo.

## Paleta de colores

| Uso | Color | Hex |
|---|---|---|
| Azul marino (base, navbar, fondos oscuros) | ■ | `#0A1F3D` |
| Azul marino profundo (overlays, footer) | ■ | `#071527` |
| Gris grafito (texto secundario) | ■ | `#4A5568` |
| Blanco / gris muy claro (fondos alternos) | ■ | `#F7F8FA` / `#FFFFFF` |
| Cian tecnológico (acento, CTAs) | ■ | `#2BB6A3` |
| Cian oscuro (hover/estados activos) | ■ | `#1F8C7E` |

## Tipografía

- **Playfair Display** (serif) para titulares — transmite carácter editorial/consultoría.
- **Inter** (sans-serif) para cuerpo de texto y UI — alta legibilidad en pantalla.

Ambas se cargan vía Google Fonts en el `<head>` de `index.html`.

## Cómo levantar el sitio localmente (VS Code)

1. Abre la carpeta `00 Página Web` en VS Code (`Archivo → Abrir carpeta...`).
2. Instala la extensión **Live Server** (autor: Ritwick Dey) desde el marketplace de extensiones, si no la tienes.
3. Haz clic derecho sobre `index.html` en el explorador de archivos y selecciona **"Open with Live Server"**.
4. El sitio se abrirá automáticamente en `http://127.0.0.1:5500` (o puerto similar) con recarga automática al guardar cambios.

Alternativa sin extensión: puedes abrir `index.html` directamente con doble clic en el explorador de archivos de Windows — el sitio no requiere servidor ni build para funcionar, ya que es HTML/CSS/JS puro sin dependencias de compilación.

## Formulario de contacto

El formulario (`#contacto`) está validado con JavaScript vanilla (nombre, correo, motivo, mensaje) y actualmente **simula el envío** (muestra un mensaje de confirmación sin enviar datos a ningún servidor). Para conectar un envío real, hay dos opciones documentadas directamente en `js/main.js` (función `submitForm`):

1. **Backend propio / servicio de formularios** (recomendado): reemplazar el `setTimeout` simulado por un `fetch()` hacia un endpoint (por ejemplo, un servicio como Formspree, o una función serverless propia).
2. **Mailto directo**: generar un enlace `mailto:contacto@vsapp.cl` con los datos del formulario precargados en el asunto/cuerpo (solución más simple, pero depende del cliente de correo del usuario).

## Cómo reemplazar los mockups de la app móvil por capturas reales

En `index.html`, dentro de la sección `#app-movil`, busca el bloque `<div class="mobile-app__mockups">`. Cada `.phone` contiene un `.phone__screen` con un mockup en CSS puro (`.mockup-screen`). Para usar capturas reales:

1. Coloca las imágenes en `assets/img/` (ej. `app-screen-1.png`, `app-screen-2.png`).
2. Reemplaza el contenido de `.phone__screen` por una etiqueta `<img>` con la captura correspondiente y su `alt` descriptivo.
3. Ajusta `object-fit: cover` y el `border-radius` heredado de `.phone__screen` en `css/styles.css` si es necesario.

## Accesibilidad

- Navegación semántica (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- Enlace de salto al contenido principal (`skip-link`) visible al usar teclado.
- Contraste de color verificado entre texto y fondos (paleta oscura + acento cian sobre blanco/gris claro).
- Formulario con `<label>` asociados, mensajes de error con `role="alert"` y estado de envío con `aria-live="polite"`.
- Soporte de `prefers-reduced-motion` para desactivar animaciones a usuarios que lo prefieran.

## Edición y mantenimiento

Todo el código está comentado por bloques (HTML, CSS y JS) para facilitar cambios futuros sin depender de quien construyó el sitio originalmente. Las variables CSS en `:root` (inicio de `css/styles.css`) centralizan la paleta, tipografía y espaciado — modificar un color ahí lo actualiza en todo el sitio.
