# Grafo de colaboración de Samuel L. Jackson

Parte individual del proyecto final de Análisis y Ciencia de Datos (UNIS) — Rodolfo Flores.

Se construye con el API de TMDB el grafo de actores que comparten película con Samuel L. Jackson
(`limit = 5`, ventana 1975-01-01 a 2025-12-31) y se estudia con el espectro de su Laplaciano normalizado:
componentes, brecha espectral, clustering espectral, vector de Fiedler y centralidad. Al final se verifica que
$A = BB^\top$ fuera de la diagonal, el puente con el kernel del *random forest* de la parte grupal.

| Archivo | Contenido |
|---|---|
| `grafo_colaboracion.ipynb` | Notebook completo (I.2 a I.7) |
| `grafo.py` | Clase `Graph` (no dirigido, con pesos) |
| `tmdb_utils.py` | Clase `TMDBAPIUtils` con cache en JSON |
| `cache/` | Respuestas del API; el notebook corre sin API key |
| `figuras/grafo.png` | Figura del grafo |

## Correr

```bash
pip install -r requirements.txt
jupyter nbconvert --to notebook --execute --inplace grafo_colaboracion.ipynb
```

La API key **no** está en el repositorio. Solo hace falta para volver a descargar el cache:
`export TMDB_API_KEY=...` antes de correr el notebook.
