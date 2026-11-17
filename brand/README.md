# brand

Sistema de marca de LUMBRA360. Empiece por `brand.html` (ábralo en el navegador; funciona sin conexión) y por `brand-guidelines.md`.

Los archivos `brand.html` y `brand-guidelines.md` se generan a partir de `brand.src.html` y `brand-guidelines.src.md`. Edite las fuentes y regenere:

```bash
python3 brand/scripts/contraste.py
```

```bash
python3 brand/scripts/construir_brand.py <carpeta icons de lucide-static 0.460.0>
```

```bash
python3 brand/scripts/generar_logos.py
```

Los scripts necesitan `fonttools` y `brotli` (`pip install fonttools brotli`). Las carpetas de iconos y fuentes se obtienen con `npm pack lucide-static@0.460.0 @fontsource/newsreader`.
