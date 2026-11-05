"""Acceso al API de TMDB con cache en JSON.

Cada respuesta se guarda en cache/<nombre>.json. Si el archivo existe se lee de ahí
y no se toca el API, así que el notebook corre sin API key con el cache del repo.
La API key se lee de la variable de entorno TMDB_API_KEY (nunca va en el código).
"""
import json
import os
import re
import time
from pathlib import Path

import requests

BASE = "https://api.themoviedb.org/3"
DOCUMENTAL = 99
AUTO_PAPEL = re.compile(r"\b(himself|herself|themselves|self)\b", re.IGNORECASE)


class TMDBAPIUtils:
    def __init__(self, api_key=None, cache_dir="cache"):
        self.api_key = api_key if api_key is not None else os.environ.get("TMDB_API_KEY")
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.llamadas_api = 0

    def _get(self, ruta, nombre_cache):
        archivo = self.cache_dir / f"{nombre_cache}.json"
        if archivo.exists():
            return json.loads(archivo.read_text(encoding="utf-8"))
        if not self.api_key:
            raise RuntimeError(f"No hay cache para {archivo.name} y no se definió TMDB_API_KEY")
        # una key v3 va como parámetro; un token v4 ("eyJ...") va en el encabezado
        params, headers = {"language": "en-US"}, {"accept": "application/json"}
        if self.api_key.startswith("eyJ"):
            headers["Authorization"] = f"Bearer {self.api_key}"
        else:
            params["api_key"] = self.api_key
        for intento in range(5):
            r = requests.get(f"{BASE}{ruta}", params=params, headers=headers, timeout=30)
            if r.status_code == 429:
                time.sleep(2 ** intento)
                continue
            r.raise_for_status()
            break
        datos = r.json()
        self.llamadas_api += 1
        archivo.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
        return datos

    def buscar_persona(self, nombre):
        slug = re.sub(r"\W+", "_", nombre.lower()).strip("_")
        datos = self._get(f"/search/person?query={requests.utils.quote(nombre)}", f"search_person_{slug}")
        return datos["results"]

    def get_movie_cast(self, movie_id, limit, exclude_ids=None):
        """Elenco con order entre 0 y limit-1, sin los id de exclude_ids."""
        excluir = set(exclude_ids or [])
        creditos = self._get(f"/movie/{movie_id}/credits", f"movie_{movie_id}_credits")
        return [{"id": c["id"], "name": c["name"], "character": c.get("character", ""), "order": c["order"]}
                for c in creditos.get("cast", [])
                if 0 <= c.get("order", -1) <= limit - 1 and c["id"] not in excluir]

    def get_movie_credits_for_person(self, person_id, start_date=None, end_date=None):
        """Películas (como actor) con fecha en [start_date, end_date] (YYYY-MM-DD).

        Excluye documentales (genre_ids contiene 99), películas sin fecha si hay filtro,
        y papeles en los que la persona se interpreta a sí misma."""
        creditos = self._get(f"/person/{person_id}/movie_credits", f"person_{person_id}_movie_credits")
        salida = []
        for c in creditos.get("cast", []):
            fecha = c.get("release_date") or ""
            if (start_date or end_date) and not fecha:
                continue
            # las fechas YYYY-MM-DD se comparan bien como texto
            if start_date and fecha < start_date:
                continue
            if end_date and fecha > end_date:
                continue
            if DOCUMENTAL in (c.get("genre_ids") or []):
                continue
            if AUTO_PAPEL.search(c.get("character") or ""):
                continue
            salida.append({"id": c["id"], "title": c.get("title", ""), "release_date": fecha, "order": c.get("order")})
        return salida
