# af.dev — Hugo Site

Blog y portfolio personal de Andrés Fuentes con tema oscuro de terminal.

## Stack

- **Hugo** (static site generator)
- **Tema personalizado** `af-theme` — sin dependencias externas
- **GitHub Pages** vía GitHub Actions

## Estructura

```
├── config.toml                  # Configuración del sitio
├── content/
│   ├── _index.md               # Home
│   ├── about.md                # Página whoami
│   ├── posts/                  # Posts del blog
│   └── projects/               # Proyectos
└── themes/af-theme/
    ├── layouts/                # Plantillas HTML
    ├── static/css/main.css     # CSS completo del sitio
    └── static/js/graph.js      # Grafo de conocimiento (vanilla JS)
```

## Despliegue en GitHub Pages

### 1. Crear el repositorio

Creá un repositorio en GitHub con el nombre `af-simicic.github.io` (o el que prefieras).

### 2. Subir el código

```bash
git init
git add .
git commit -m "feat: initial hugo site"
git branch -M main
git remote add origin https://github.com/af-simicic/af-simicic.github.io.git
git push -u origin main
```

### 3. Configurar GitHub Pages

En tu repositorio → **Settings → Pages**:
- Source: **GitHub Actions**

El workflow `.github/workflows/hugo-deploy.yml` se encargará de hacer el build y despliegue automáticamente en cada push a `main`.

### 4. URL final

El sitio estará disponible en:
```
https://af-simicic.github.io/
```

## Desarrollo local

Necesitás Hugo instalado (v0.110+):

```bash
# Instalar Hugo (Ubuntu/Debian)
apt install hugo
# O con snap
snap install hugo

# Servidor de desarrollo
hugo server -D

# Build para producción
hugo --minify
```

## Agregar un nuevo post

```bash
hugo new posts/titulo-del-post.md
```

Frontmatter de referencia:

```yaml
---
title: "Título del post"
date: 2026-01-01
categories: ["gnu-linux"]   # gnu-linux | redes | seguridad | data-science | ia
tags: ["tag1", "tag2"]
summary: "Descripción breve visible en la home y listados."
related: ["slug-de-otro-post"]  # opcional — aparece en "→ Relaciones"
---
```

Luego agregá el nodo en `themes/af-theme/static/js/graph.js` en el array `NODES` y los edges en `EDGES`.

## Shortcodes disponibles

```
{{</* nota */>}}
Texto informativo.
{{</* /nota */>}}

{{</* advertencia */>}}
Texto de advertencia.
{{</* /advertencia */>}}

{{</* tip */>}}
Consejo práctico.
{{</* /tip */>}}
```
