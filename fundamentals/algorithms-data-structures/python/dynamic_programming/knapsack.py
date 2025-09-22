"""
Knapsack Problem - Problema de la Mochila

El problema de la mochila es un clásico problema de optimización combinatoria.
Dado un conjunto de artículos, cada uno con un peso y un valor, y una mochila
con capacidad limitada, el objetivo es maximizar el valor total de los artículos
seleccionados sin exceder la capacidad de peso.

Variantes implementadas:
1. 0/1 Knapsack (cada artículo se puede tomar 0 o 1 vez)
2. Unbounded Knapsack (cada artículo se puede tomar múltiples veces)
3. Fractional Knapsack (se pueden tomar fracciones de artículos - Greedy)

Complejidad:
- 0/1 Knapsack: O(n × W) tiempo, O(n × W) espacio
- Unbounded Knapsack: O(n × W) tiempo, O(W) espacio
- Fractional Knapsack: O(n log n) tiempo, O(1) espacio

Donde n = número de artículos, W = capacidad de la mochila
"""

from typing import List, Tuple, Dict, NamedTuple
import time
from dataclasses import dataclass


@dataclass
class Item:
    """Representa un artículo con peso, valor y nombre opcional."""
    weight: int
    value: int
    name: str = ""
    
    def __post_init__(self):
        if not self.name:
            self.name = f"Item(w={self.weight}, v={self.value})"
    
    @property
    def value_density(self) -> float:
        """Densidad de valor (valor por unidad de peso)."""
        return self.value / self.weight if self.weight > 0 else 0
    
    def __str__(self) -> str:
        return f"{self.name}: peso={self.weight}, valor={self.value}"


class KnapsackSolution(NamedTuple):
    """Resultado de un problema de mochila."""
    max_value: int
    selected_items: List[Item]
    total_weight: int
    items_count: Dict[Item, int]  # Para unbounded knapsack


def knapsack_01_dp(items: List[Item], capacity: int) -> KnapsackSolution:
    """
    Resolver el problema de mochila 0/1 usando programación dinámica.
    
    Args:
        items: Lista de artículos disponibles
        capacity: Capacidad de la mochila
        
    Returns:
        Solución con valor máximo y artículos seleccionados
    """
    n = len(items)
    
    # Tabla DP: dp[i][w] = valor máximo usando primeros i items con capacidad w
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    # Llenar la tabla DP
    for i in range(1, n + 1):
        item = items[i - 1]
        for w in range(capacity + 1):
            # Opción 1: No tomar el artículo actual
            dp[i][w] = dp[i - 1][w]
            
            # Opción 2: Tomar el artículo actual (si cabe)
            if item.weight <= w:
                value_with_item = dp[i - 1][w - item.weight] + item.value
                dp[i][w] = max(dp[i][w], value_with_item)
    
    # Reconstruir la solución
    max_value = dp[n][capacity]
    selected_items = []
    w = capacity
    
    for i in range(n, 0, -1):
        # Si el valor cambió al agregar el artículo i, entonces está en la solución
        if dp[i][w] != dp[i - 1][w]:
            selected_items.append(items[i - 1])
            w -= items[i - 1].weight
    
    selected_items.reverse()  # Orden original
    
    total_weight = sum(item.weight for item in selected_items)
    items_count = {item: 1 for item in selected_items}
    
    return KnapsackSolution(max_value, selected_items, total_weight, items_count)


def knapsack_01_optimized(items: List[Item], capacity: int) -> KnapsackSolution:
    """
    Versión optimizada en espacio del problema 0/1 knapsack.
    Usa solo O(W) espacio en lugar de O(n × W).
    """
    n = len(items)
    
    # Solo necesitamos dos filas: anterior y actual
    prev = [0] * (capacity + 1)
    curr = [0] * (capacity + 1)
    
    # Para reconstruir la solución, necesitamos guardar qué artículos tomamos
    taken = [[False for _ in range(capacity + 1)] for _ in range(n)]
    
    for i in range(n):
        item = items[i]
        for w in range(capacity + 1):
            # Opción 1: No tomar el artículo actual
            curr[w] = prev[w]
            taken[i][w] = False
            
            # Opción 2: Tomar el artículo actual (si cabe)
            if item.weight <= w:
                value_with_item = prev[w - item.weight] + item.value
                if value_with_item > curr[w]:
                    curr[w] = value_with_item
                    taken[i][w] = True
        
        # Intercambiar filas
        prev, curr = curr, prev
    
    max_value = prev[capacity]
    
    # Reconstruir solución
    selected_items = []
    w = capacity
    for i in range(n - 1, -1, -1):
        if taken[i][w]:
            selected_items.append(items[i])
            w -= items[i].weight
    
    selected_items.reverse()
    total_weight = sum(item.weight for item in selected_items)
    items_count = {item: 1 for item in selected_items}
    
    return KnapsackSolution(max_value, selected_items, total_weight, items_count)


def knapsack_unbounded(items: List[Item], capacity: int) -> KnapsackSolution:
    """
    Resolver el problema de mochila ilimitada (unbounded knapsack).
    Cada artículo se puede usar múltiples veces.
    
    Args:
        items: Lista de artículos disponibles
        capacity: Capacidad de la mochila
        
    Returns:
        Solución con valor máximo y artículos seleccionados
    """
    # dp[w] = valor máximo que se puede obtener con capacidad w
    dp = [0] * (capacity + 1)
    parent = [-1] * (capacity + 1)  # Para reconstruir la solución
    
    for w in range(1, capacity + 1):
        for i, item in enumerate(items):
            if item.weight <= w:
                value_with_item = dp[w - item.weight] + item.value
                if value_with_item > dp[w]:
                    dp[w] = value_with_item
                    parent[w] = i
    
    max_value = dp[capacity]
    
    # Reconstruir solución
    selected_items = []
    items_count: Dict[Item, int] = {item: 0 for item in items}
    w = capacity
    
    while w > 0 and parent[w] != -1:
        item_index = parent[w]
        item = items[item_index]
        selected_items.append(item)
        items_count[item] += 1
        w -= item.weight
    
    selected_items.reverse()
    total_weight = sum(item.weight for item in selected_items)
    
    return KnapsackSolution(max_value, selected_items, total_weight, items_count)


def knapsack_fractional(items: List[Item], capacity: int) -> Tuple[float, List[Tuple[Item, float]]]:
    """
    Resolver el problema de mochila fraccionaria usando algoritmo greedy.
    Se pueden tomar fracciones de artículos.
    
    Args:
        items: Lista de artículos disponibles
        capacity: Capacidad de la mochila
        
    Returns:
        Tupla con (valor_máximo, lista_de_(artículo, fracción_tomada))
    """
    # Ordenar artículos por densidad de valor (descendente)
    sorted_items = sorted(items, key=lambda x: x.value_density, reverse=True)
    
    max_value = 0.0
    selected_items: List[Tuple[Item, float]] = []
    remaining_capacity = capacity
    
    for item in sorted_items:
        if remaining_capacity == 0:
            break
        
        if item.weight <= remaining_capacity:
            # Tomar el artículo completo
            max_value += item.value
            selected_items.append((item, 1.0))
            remaining_capacity -= item.weight
        else:
            # Tomar fracción del artículo
            fraction = remaining_capacity / item.weight
            max_value += item.value * fraction
            selected_items.append((item, fraction))
            remaining_capacity = 0
    
    return max_value, selected_items


def knapsack_recursive_memoized(items: List[Item], capacity: int) -> KnapsackSolution:
    """
    Versión recursiva con memoización del problema 0/1 knapsack.
    Útil para entender la estructura recursiva del problema.
    """
    memo: Dict[Tuple[int, int], int] = {}
    
    def knapsack_helper(index: int, remaining_capacity: int) -> int:
        # Caso base
        if index == len(items) or remaining_capacity == 0:
            return 0
        
        # Verificar memo
        if (index, remaining_capacity) in memo:
            return memo[(index, remaining_capacity)]
        
        # Opción 1: No tomar el artículo actual
        result = knapsack_helper(index + 1, remaining_capacity)
        
        # Opción 2: Tomar el artículo actual (si cabe)
        if items[index].weight <= remaining_capacity:
            value_with_item = items[index].value + knapsack_helper(
                index + 1, remaining_capacity - items[index].weight
            )
            result = max(result, value_with_item)
        
        memo[(index, remaining_capacity)] = result
        return result
    
    max_value = knapsack_helper(0, capacity)
    
    # Para simplicidad, usamos la versión DP para reconstruir la solución
    # En la práctica, también se puede hacer recursivamente
    dp_solution = knapsack_01_dp(items, capacity)
    
    return KnapsackSolution(
        max_value,
        dp_solution.selected_items,
        dp_solution.total_weight,
        dp_solution.items_count
    )


def print_solution(solution: KnapsackSolution, title: str = "Solución") -> None:
    """Imprimir solución de manera legible."""
    print(f"\n=== {title} ===")
    print(f"Valor máximo: {solution.max_value}")
    print(f"Peso total: {solution.total_weight}")
    print("Artículos seleccionados:")
    
    for item in solution.selected_items:
        count = solution.items_count.get(item, 1)
        if count == 1:
            print(f"  - {item}")
        else:
            print(f"  - {item} (x{count})")


def print_fractional_solution(value: float, items: List[Tuple[Item, float]], title: str = "Solución Fraccionaria") -> None:
    """Imprimir solución fraccionaria de manera legible."""
    print(f"\n=== {title} ===")
    print(f"Valor máximo: {value:.2f}")
    
    total_weight = 0.0
    print("Artículos seleccionados:")
    
    for item, fraction in items:
        weight_taken = item.weight * fraction
        value_taken = item.value * fraction
        total_weight += weight_taken
        
        if fraction == 1.0:
            print(f"  - {item} (completo)")
        else:
            print(f"  - {item} (fracción: {fraction:.3f}, peso: {weight_taken:.1f}, valor: {value_taken:.1f})")
    
    print(f"Peso total: {total_weight:.1f}")


def generate_test_items() -> List[Item]:
    """Generar conjunto de artículos de prueba."""
    return [
        Item(10, 60, "Diamante"),
        Item(20, 100, "Oro"),
        Item(30, 120, "Plata"),
        Item(40, 80, "Bronce"),
        Item(15, 75, "Rubí"),
        Item(25, 90, "Esmeralda"),
        Item(5, 20, "Perla"),
        Item(35, 140, "Zafiro")
    ]


def benchmark_algorithms(items: List[Item], capacity: int) -> None:
    """Comparar el rendimiento de diferentes algoritmos."""
    print(f"\n=== Benchmark (n={len(items)}, capacidad={capacity}) ===")
    
    algorithms = [
        ("DP Clásico", knapsack_01_dp),
        ("DP Optimizado", knapsack_01_optimized),
        ("Recursivo con Memo", knapsack_recursive_memoized),
    ]
    
    for name, algorithm in algorithms:
        start_time = time.time()
        solution = algorithm(items, capacity)
        end_time = time.time()
        
        execution_time = (end_time - start_time) * 1000  # ms
        print(f"{name:20}: {execution_time:8.3f} ms (valor: {solution.max_value})")


def demo():
    """Demostración de los algoritmos de mochila."""
    print("=== Demostración del Problema de la Mochila ===")
    
    # Crear conjunto de artículos de prueba
    items = generate_test_items()
    capacity = 100
    
    print(f"\nArtículos disponibles (capacidad de mochila: {capacity}):")
    for i, item in enumerate(items, 1):
        print(f"{i:2}. {item} (densidad: {item.value_density:.2f})")
    
    # Resolver con diferentes algoritmos
    print("\n" + "="*60)
    
    # 1. Mochila 0/1 con programación dinámica
    solution_01 = knapsack_01_dp(items, capacity)
    print_solution(solution_01, "Mochila 0/1 (DP Clásico)")
    
    # 2. Mochila 0/1 optimizada
    solution_opt = knapsack_01_optimized(items, capacity)
    print_solution(solution_opt, "Mochila 0/1 (DP Optimizado)")
    
    # 3. Mochila ilimitada
    solution_unbounded = knapsack_unbounded(items, capacity)
    print_solution(solution_unbounded, "Mochila Ilimitada")
    
    # 4. Mochila fraccionaria
    value_fractional, items_fractional = knapsack_fractional(items, capacity)
    print_fractional_solution(value_fractional, items_fractional)
    
    # 5. Versión recursiva con memoización
    solution_recursive = knapsack_recursive_memoized(items, capacity)
    print_solution(solution_recursive, "Mochila 0/1 (Recursivo con Memo)")
    
    # Comparar resultados
    print(f"\n=== Comparación de Resultados ===")
    print(f"0/1 Knapsack (DP):      {solution_01.max_value}")
    print(f"0/1 Knapsack (Opt):     {solution_opt.max_value}")
    print(f"Unbounded Knapsack:     {solution_unbounded.max_value}")
    print(f"Fractional Knapsack:    {value_fractional:.2f}")
    print(f"Recursive + Memo:       {solution_recursive.max_value}")
    
    # Casos especiales
    print(f"\n=== Casos Especiales ===")
    
    # Capacidad muy pequeña
    small_capacity = 15
    small_solution = knapsack_01_dp(items, small_capacity)
    print(f"Capacidad pequeña ({small_capacity}): valor = {small_solution.max_value}")
    
    # Capacidad muy grande
    large_capacity = 500
    large_solution = knapsack_01_dp(items, large_capacity)
    print(f"Capacidad grande ({large_capacity}): valor = {large_solution.max_value}")
    
    # Sin artículos
    empty_solution = knapsack_01_dp([], capacity)
    print(f"Sin artículos: valor = {empty_solution.max_value}")
    
    # Un solo artículo
    single_item = [Item(50, 200, "Único")]
    single_solution = knapsack_01_dp(single_item, capacity)
    print(f"Un solo artículo: valor = {single_solution.max_value}")
    
    # Benchmark de rendimiento
    benchmark_algorithms(items, capacity)
    
    # Análisis de complejidad con diferentes tamaños
    print(f"\n=== Análisis de Escalabilidad ===")
    sizes = [10, 20, 50]
    test_capacity = 100
    
    for size in sizes:
        # Generar artículos aleatorios
        test_items = [
            Item(weight=i+1, value=(i+1)*2, name=f"Item{i}")
            for i in range(size)
        ]
        
        start_time = time.time()
        solution = knapsack_01_dp(test_items, test_capacity)
        end_time = time.time()
        
        execution_time = (end_time - start_time) * 1000
        print(f"n={size:2}: {execution_time:6.2f} ms (valor: {solution.max_value})")


if __name__ == "__main__":
    demo()

