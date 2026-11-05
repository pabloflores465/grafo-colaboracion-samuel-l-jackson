"""Grafo no dirigido y con pesos."""
import numpy as np


class Graph:
    def __init__(self):
        self.nodes = {}   # id -> nombre, en orden de inserción
        self.edges = {}   # (id_menor, id_mayor) -> peso

    @staticmethod
    def _clave(a, b):
        return (a, b) if a <= b else (b, a)

    def add_node(self, nodo):
        """nodo = (id, nombre); no hace nada si el id ya existe."""
        id_, nombre = nodo
        if id_ not in self.nodes:
            self.nodes[id_] = nombre

    def add_edge(self, a, b):
        """Agrega la arista (a, b) con peso 1, o le suma 1 si ya existe."""
        if a == b:
            raise ValueError("no se permiten lazos")
        if a not in self.nodes or b not in self.nodes:
            raise KeyError("ambos nodos deben existir antes de unirlos")
        k = self._clave(a, b)
        self.edges[k] = self.edges.get(k, 0) + 1

    def total_nodes(self):
        return len(self.nodes)

    def total_edges(self):
        return len(self.edges)

    def degree(self):
        """Número de aristas que tocan a cada nodo (sin pesos)."""
        g = dict.fromkeys(self.nodes, 0)
        for a, b in self.edges:
            g[a] += 1
            g[b] += 1
        return g

    def max_degree_nodes(self):
        """{id: grado} con el nodo (o todos los nodos empatados) de grado máximo."""
        g = self.degree()
        if not g:
            return {}
        m = max(g.values())
        return {n: d for n, d in g.items() if d == m}

    def adjacency(self):
        """(A, ids): matriz de adyacencia con pesos y los id en el orden de sus filas."""
        ids = list(self.nodes)
        pos = {n: i for i, n in enumerate(ids)}
        A = np.zeros((len(ids), len(ids)))
        for (a, b), w in self.edges.items():
            A[pos[a], pos[b]] = A[pos[b], pos[a]] = w
        return A, ids
