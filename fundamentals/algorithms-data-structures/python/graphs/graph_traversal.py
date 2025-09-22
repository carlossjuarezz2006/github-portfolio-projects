"""
Graph Traversal Algorithms - Algoritmos de Recorrido de Grafos

Este módulo implementa los algoritmos fundamentales para recorrer grafos:
- DFS (Depth-First Search) - Búsqueda en Profundidad  
- BFS (Breadth-First Search) - Búsqueda en Anchura

Ambos algoritmos son fundamentales para:
- Explorar todos los nodos de un grafo
- Detectar ciclos
- Encontrar componentes conexas
- Búsqueda de caminos
- Ordenamiento topológico

Complejidad temporal: O(V + E) donde V = vértices, E = aristas
Complejidad espacial: O(V) para almacenar visitados y estructuras auxiliares
"""

from typing import Dict, List, Set, Optional, Callable, Any
from collections import defaultdict, deque
import time


class Graph:
    """
    Implementación de grafo usando lista de adyacencia.
    Soporta tanto grafos dirigidos como no dirigidos.
    """
    
    def __init__(self, directed: bool = False):
        """
        Inicializar el grafo.
        
        Args:
            directed: True para grafo dirigido, False para no dirigido
        """
        self.adjacency_list: Dict[Any, List[Any]] = defaultdict(list)
        self.directed = directed
        self._vertices: Set[Any] = set()
    
    def add_vertex(self, vertex: Any) -> None:
        """Agregar un vértice al grafo."""
        self._vertices.add(vertex)
        if vertex not in self.adjacency_list:
            self.adjacency_list[vertex] = []
    
    def add_edge(self, from_vertex: Any, to_vertex: Any) -> None:
        """
        Agregar una arista al grafo.
        
        Args:
            from_vertex: Vértice origen
            to_vertex: Vértice destino
        """
        # Asegurar que los vértices existan
        self.add_vertex(from_vertex)
        self.add_vertex(to_vertex)
        
        # Agregar la arista
        self.adjacency_list[from_vertex].append(to_vertex)
        
        # Si no es dirigido, agregar arista en ambas direcciones
        if not self.directed:
            self.adjacency_list[to_vertex].append(from_vertex)
    
    def get_vertices(self) -> Set[Any]:
        """Obtener todos los vértices del grafo."""
        return self._vertices.copy()
    
    def get_neighbors(self, vertex: Any) -> List[Any]:
        """Obtener los vecinos de un vértice."""
        return self.adjacency_list[vertex].copy()
    
    def has_vertex(self, vertex: Any) -> bool:
        """Verificar si un vértice existe en el grafo."""
        return vertex in self._vertices
    
    def has_edge(self, from_vertex: Any, to_vertex: Any) -> bool:
        """Verificar si existe una arista entre dos vértices."""
        return to_vertex in self.adjacency_list[from_vertex]
    
    def vertex_count(self) -> int:
        """Obtener el número de vértices."""
        return len(self._vertices)
    
    def edge_count(self) -> int:
        """Obtener el número de aristas."""
        count = sum(len(neighbors) for neighbors in self.adjacency_list.values())
        return count if self.directed else count // 2
    
    def __str__(self) -> str:
        """Representación string del grafo."""
        result = []
        result.append(f"Grafo {'dirigido' if self.directed else 'no dirigido'}")
        result.append(f"Vértices: {self.vertex_count()}, Aristas: {self.edge_count()}")
        result.append("Lista de adyacencia:")
        
        for vertex in sorted(self._vertices):
            neighbors = sorted(self.adjacency_list[vertex])
            result.append(f"  {vertex} -> {neighbors}")
        
        return "\n".join(result)


def dfs_recursive(graph: Graph, start_vertex: Any, 
                 visit_callback: Optional[Callable[[Any], None]] = None) -> List[Any]:
    """
    Búsqueda en Profundidad (DFS) usando recursión.
    
    Args:
        graph: Grafo a recorrer
        start_vertex: Vértice de inicio
        visit_callback: Función a llamar cuando se visita un vértice
        
    Returns:
        Lista de vértices en orden de visita
    """
    if not graph.has_vertex(start_vertex):
        return []
    
    visited: Set[Any] = set()
    path: List[Any] = []
    
    def _dfs_helper(vertex: Any) -> None:
        visited.add(vertex)
        path.append(vertex)
        
        if visit_callback:
            visit_callback(vertex)
        
        # Visitar vecinos no visitados
        for neighbor in sorted(graph.get_neighbors(vertex)):
            if neighbor not in visited:
                _dfs_helper(neighbor)
    
    _dfs_helper(start_vertex)
    return path


def dfs_iterative(graph: Graph, start_vertex: Any,
                 visit_callback: Optional[Callable[[Any], None]] = None) -> List[Any]:
    """
    Búsqueda en Profundidad (DFS) usando iteración con stack.
    
    Args:
        graph: Grafo a recorrer
        start_vertex: Vértice de inicio
        visit_callback: Función a llamar cuando se visita un vértice
        
    Returns:
        Lista de vértices en orden de visita
    """
    if not graph.has_vertex(start_vertex):
        return []
    
    visited: Set[Any] = set()
    path: List[Any] = []
    stack: List[Any] = [start_vertex]
    
    while stack:
        vertex = stack.pop()
        
        if vertex not in visited:
            visited.add(vertex)
            path.append(vertex)
            
            if visit_callback:
                visit_callback(vertex)
            
            # Agregar vecinos al stack (en orden reverso para mantener orden)
            neighbors = sorted(graph.get_neighbors(vertex), reverse=True)
            for neighbor in neighbors:
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return path


def bfs(graph: Graph, start_vertex: Any,
        visit_callback: Optional[Callable[[Any], None]] = None) -> List[Any]:
    """
    Búsqueda en Anchura (BFS) usando cola.
    
    Args:
        graph: Grafo a recorrer
        start_vertex: Vértice de inicio
        visit_callback: Función a llamar cuando se visita un vértice
        
    Returns:
        Lista de vértices en orden de visita
    """
    if not graph.has_vertex(start_vertex):
        return []
    
    visited: Set[Any] = set()
    path: List[Any] = []
    queue: deque = deque([start_vertex])
    
    visited.add(start_vertex)
    
    while queue:
        vertex = queue.popleft()
        path.append(vertex)
        
        if visit_callback:
            visit_callback(vertex)
        
        # Agregar vecinos no visitados a la cola
        for neighbor in sorted(graph.get_neighbors(vertex)):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return path


def find_all_paths(graph: Graph, start: Any, end: Any) -> List[List[Any]]:
    """
    Encontrar todos los caminos simples entre dos vértices.
    
    Args:
        graph: Grafo a buscar
        start: Vértice de inicio
        end: Vértice de destino
        
    Returns:
        Lista de todos los caminos encontrados
    """
    if not graph.has_vertex(start) or not graph.has_vertex(end):
        return []
    
    all_paths: List[List[Any]] = []
    
    def _find_paths_helper(current_vertex: Any, current_path: List[Any]) -> None:
        if current_vertex == end:
            all_paths.append(current_path.copy())
            return
        
        for neighbor in graph.get_neighbors(current_vertex):
            if neighbor not in current_path:  # Evitar ciclos
                current_path.append(neighbor)
                _find_paths_helper(neighbor, current_path)
                current_path.pop()  # Backtrack
    
    _find_paths_helper(start, [start])
    return all_paths


def shortest_path_bfs(graph: Graph, start: Any, end: Any) -> Optional[List[Any]]:
    """
    Encontrar el camino más corto entre dos vértices usando BFS.
    
    Args:
        graph: Grafo a buscar
        start: Vértice de inicio
        end: Vértice de destino
        
    Returns:
        Camino más corto o None si no existe
    """
    if not graph.has_vertex(start) or not graph.has_vertex(end):
        return None
    
    if start == end:
        return [start]
    
    visited: Set[Any] = set()
    queue: deque = deque([(start, [start])])  # (vértice, camino)
    visited.add(start)
    
    while queue:
        current_vertex, path = queue.popleft()
        
        for neighbor in graph.get_neighbors(current_vertex):
            if neighbor == end:
                return path + [neighbor]
            
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return None  # No hay camino


def has_cycle_directed(graph: Graph) -> bool:
    """
    Detectar si un grafo dirigido tiene ciclos usando DFS.
    
    Args:
        graph: Grafo dirigido a verificar
        
    Returns:
        True si tiene ciclos, False en caso contrario
    """
    if not graph.directed:
        raise ValueError("Esta función es solo para grafos dirigidos")
    
    # Estados: 0 = no visitado, 1 = visitando, 2 = visitado
    state: Dict[Any, int] = defaultdict(int)
    
    def _has_cycle_helper(vertex: Any) -> bool:
        if state[vertex] == 1:  # Nodo siendo visitado - ciclo detectado
            return True
        if state[vertex] == 2:  # Ya visitado completamente
            return False
        
        state[vertex] = 1  # Marcar como visitando
        
        for neighbor in graph.get_neighbors(vertex):
            if _has_cycle_helper(neighbor):
                return True
        
        state[vertex] = 2  # Marcar como visitado completamente
        return False
    
    # Verificar desde cada vértice no visitado
    for vertex in graph.get_vertices():
        if state[vertex] == 0:
            if _has_cycle_helper(vertex):
                return True
    
    return False


def has_cycle_undirected(graph: Graph) -> bool:
    """
    Detectar si un grafo no dirigido tiene ciclos usando DFS.
    
    Args:
        graph: Grafo no dirigido a verificar
        
    Returns:
        True si tiene ciclos, False en caso contrario
    """
    if graph.directed:
        raise ValueError("Esta función es solo para grafos no dirigidos")
    
    visited: Set[Any] = set()
    
    def _has_cycle_helper(vertex: Any, parent: Optional[Any]) -> bool:
        visited.add(vertex)
        
        for neighbor in graph.get_neighbors(vertex):
            if neighbor not in visited:
                if _has_cycle_helper(neighbor, vertex):
                    return True
            elif neighbor != parent:  # Arista de retorno encontrada
                return True
        
        return False
    
    # Verificar cada componente conexa
    for vertex in graph.get_vertices():
        if vertex not in visited:
            if _has_cycle_helper(vertex, None):
                return True
    
    return False


def connected_components(graph: Graph) -> List[List[Any]]:
    """
    Encontrar todas las componentes conexas de un grafo no dirigido.
    
    Args:
        graph: Grafo no dirigido
        
    Returns:
        Lista de componentes conexas (cada una es una lista de vértices)
    """
    if graph.directed:
        raise ValueError("Esta función es solo para grafos no dirigidos")
    
    visited: Set[Any] = set()
    components: List[List[Any]] = []
    
    def _dfs_component(vertex: Any, component: List[Any]) -> None:
        visited.add(vertex)
        component.append(vertex)
        
        for neighbor in graph.get_neighbors(vertex):
            if neighbor not in visited:
                _dfs_component(neighbor, component)
    
    for vertex in graph.get_vertices():
        if vertex not in visited:
            component: List[Any] = []
            _dfs_component(vertex, component)
            components.append(sorted(component))
    
    return components


def demo():
    """Demostración de los algoritmos de recorrido de grafos."""
    print("=== Demostración de Recorrido de Grafos ===\n")
    
    # Crear grafo no dirigido
    print("1. Grafo no dirigido:")
    graph = Graph(directed=False)
    
    # Agregar aristas
    edges = [
        ('A', 'B'), ('A', 'C'), ('B', 'D'), ('B', 'E'),
        ('C', 'F'), ('D', 'E'), ('E', 'F'), ('F', 'G')
    ]
    
    for from_v, to_v in edges:
        graph.add_edge(from_v, to_v)
    
    print(graph)
    print()
    
    # DFS
    print("2. Recorridos desde vértice 'A':")
    dfs_result_recursive = dfs_recursive(graph, 'A')
    dfs_result_iterative = dfs_iterative(graph, 'A')
    bfs_result = bfs(graph, 'A')
    
    print(f"DFS (recursivo): {dfs_result_recursive}")
    print(f"DFS (iterativo): {dfs_result_iterative}")
    print(f"BFS:             {bfs_result}")
    print()
    
    # Búsqueda de caminos
    print("3. Búsqueda de caminos de A a G:")
    all_paths = find_all_paths(graph, 'A', 'G')
    shortest_path = shortest_path_bfs(graph, 'A', 'G')
    
    print(f"Todos los caminos:")
    for i, path in enumerate(all_paths, 1):
        print(f"  Camino {i}: {' -> '.join(path)}")
    
    print(f"Camino más corto: {' -> '.join(shortest_path) if shortest_path else 'No existe'}")
    print()
    
    # Detección de ciclos
    print("4. Detección de ciclos:")
    has_cycle = has_cycle_undirected(graph)
    print(f"¿Tiene ciclos?: {has_cycle}")
    
    # Crear grafo sin ciclos para comparar
    tree = Graph(directed=False)
    tree_edges = [('A', 'B'), ('A', 'C'), ('B', 'D'), ('B', 'E'), ('C', 'F')]
    for from_v, to_v in tree_edges:
        tree.add_edge(from_v, to_v)
    
    print(f"Grafo árbol (sin ciclos): {has_cycle_undirected(tree)}")
    print()
    
    # Componentes conexas
    print("5. Componentes conexas:")
    # Agregar algunos vértices aislados
    isolated_graph = Graph(directed=False)
    for from_v, to_v in edges:
        isolated_graph.add_edge(from_v, to_v)
    
    # Agregar componente separada
    isolated_graph.add_edge('X', 'Y')
    isolated_graph.add_edge('Y', 'Z')
    isolated_graph.add_vertex('W')  # Vértice aislado
    
    components = connected_components(isolated_graph)
    print(f"Componentes conexas:")
    for i, component in enumerate(components, 1):
        print(f"  Componente {i}: {component}")
    print()
    
    # Grafo dirigido
    print("6. Grafo dirigido:")
    directed_graph = Graph(directed=True)
    directed_edges = [
        ('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'B'),  # Ciclo: B -> C -> D -> B
        ('A', 'E'), ('E', 'F')
    ]
    
    for from_v, to_v in directed_edges:
        directed_graph.add_edge(from_v, to_v)
    
    print(directed_graph)
    print()
    
    print("Recorridos desde 'A':")
    dfs_directed = dfs_recursive(directed_graph, 'A')
    bfs_directed = bfs(directed_graph, 'A')
    print(f"DFS: {dfs_directed}")
    print(f"BFS: {bfs_directed}")
    
    print(f"¿Tiene ciclos?: {has_cycle_directed(directed_graph)}")
    print()
    
    # Benchmark
    print("7. Benchmark de rendimiento:")
    
    # Crear grafo grande
    large_graph = Graph(directed=False)
    n = 1000
    
    # Crear grafo en forma de grid
    for i in range(n):
        for j in range(n):
            if i < n - 1:  # Conectar hacia abajo
                large_graph.add_edge(i * n + j, (i + 1) * n + j)
            if j < n - 1:  # Conectar hacia la derecha
                large_graph.add_edge(i * n + j, i * n + j + 1)
    
    start_vertex = 0
    
    # Benchmark DFS
    start_time = time.time()
    dfs_result = dfs_iterative(large_graph, start_vertex)
    dfs_time = time.time() - start_time
    
    # Benchmark BFS
    start_time = time.time()
    bfs_result = bfs(large_graph, start_vertex)
    bfs_time = time.time() - start_time
    
    print(f"Grafo de {large_graph.vertex_count()} vértices, {large_graph.edge_count()} aristas")
    print(f"DFS visitó {len(dfs_result)} nodos en {dfs_time:.4f} segundos")
    print(f"BFS visitó {len(bfs_result)} nodos en {bfs_time:.4f} segundos")


if __name__ == "__main__":
    demo()

