# The Nth Layer — nthlayer.co.uk

Static site built with [Eleventy (11ty)](https://www.11ty.dev/).

## Quick Start

```bash
npm install
npm start        # Dev server at http://localhost:8080
npm run build    # Build to _site/
```

## Images

SVG placeholder logos are included. To download the original raster images from the current WordPress site:

```bash
bash scripts/download-images.sh
```

This fetches the logo PNGs, hero image, headshot, and icons into `src/assets/images/`.

## Structure

```
src/
├── _data/          # Site data (services, use cases)
├── _includes/      # Nunjucks layouts
├── assets/
│   ├── css/        # Stylesheets
│   └── images/     # Static images
├── usecases/       # Use cases page
└── index.njk       # Homepage
```
