"""
Quick Sort - Algoritmo de Ordenamiento

Quick Sort es un algoritmo de ordenamiento eficiente que utiliza el paradigma
"divide y vencerás". Funciona seleccionando un elemento 'pivote' del array
y particionando los otros elementos en dos sub-arrays según si son menores
o mayores que el pivote.

Algoritmo:
1. Elegir un elemento pivote del array
2. Particionar: reorganizar el array de manera que:
   - Elementos menores que el pivote van antes
   - Elementos mayores que el pivote van después
3. Recursivamente aplicar los pasos anteriores a los sub-arrays

Complejidad temporal:
- Mejor caso: O(n log n) - pivote siempre divide el array por la mitad
- Caso promedio: O(n log n)
- Peor caso: O(n²) - pivote siempre es el menor o mayor elemento

Complejidad espacial: O(log n) - debido a la recursión

Características:
- In-place: Sí (versión básica)
- Estable: No
- Adaptativo: No
"""

import random
import time
from typing import List, Callable, Any
from enum import Enum


class PivotStrategy(Enum):
    """Estrategias para selección de pivote."""
    FIRST = "first"
    LAST = "last"
    MIDDLE = "middle"
    RANDOM = "random"
    MEDIAN_OF_THREE = "median_of_three"


def quick_sort(arr: List[Any], strategy: PivotStrategy = PivotStrategy.RANDOM) -> List[Any]:
    """
    Ordena una lista usando Quick Sort.
    
    Args:
        arr: Lista a ordenar
        strategy: Estrategia para selección de pivote
        
    Returns:
        Nueva lista ordenada
    """
    if len(arr) <= 1:
        return arr.copy()
    
    result = arr.copy()
    _quick_sort_recursive(result, 0, len(result) - 1, strategy)
    return result


def quick_sort_inplace(arr: List[Any], strategy: PivotStrategy = PivotStrategy.RANDOM) -> None:
    """
    Ordena una lista in-place usando Quick Sort.
    
    Args:
        arr: Lista a ordenar (modificada in-place)
        strategy: Estrategia para selección de pivote
    """
    _quick_sort_recursive(arr, 0, len(arr) - 1, strategy)


def _quick_sort_recursive(arr: List[Any], low: int, high: int, strategy: PivotStrategy) -> None:
    """Función recursiva de Quick Sort."""
    if low < high:
        # Particionar el array y obtener el índice del pivote
        pivot_index = _partition(arr, low, high, strategy)
        
        # Recursivamente ordenar elementos antes y después del pivote
        _quick_sort_recursive(arr, low, pivot_index - 1, strategy)
        _quick_sort_recursive(arr, pivot_index + 1, high, strategy)


def _partition(arr: List[Any], low: int, high: int, strategy: PivotStrategy) -> int:
    """
    Partición usando el esquema de Lomuto.
    Coloca el pivote en su posición correcta y retorna su índice.
    """
    pivot_index = _choose_pivot(arr, low, high, strategy)
    
    # Mover el pivote al final para simplificar la partición
    arr[pivot_index], arr[high] = arr[high], arr[pivot_index]
    pivot_value = arr[high]
    
    # Índice del elemento más pequeño
    i = low - 1
    
    for j in range(low, high):
        # Si el elemento actual es menor o igual que el pivote
        if arr[j] <= pivot_value:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    # Colocar el pivote en su posición correcta
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1


def _partition_hoare(arr: List[Any], low: int, high: int, strategy: PivotStrategy) -> int:
    """
    Partición usando el esquema de Hoare (alternativo).
    Más eficiente en número de intercambios.
    """
    pivot_index = _choose_pivot(arr, low, high, strategy)
    pivot_value = arr[pivot_index]
    
    i = low - 1
    j = high + 1
    
    while True:
        # Encontrar elemento desde la izquierda mayor que pivote
        i += 1
        while arr[i] < pivot_value:
            i += 1
        
        # Encontrar elemento desde la derecha menor que pivote
        j -= 1
        while arr[j] > pivot_value:
            j -= 1
        
        # Si los punteros se cruzan, terminar
        if i >= j:
            return j
        
        # Intercambiar elementos
        arr[i], arr[j] = arr[j], arr[i]


def _choose_pivot(arr: List[Any], low: int, high: int, strategy: PivotStrategy) -> int:
    """Seleccionar pivote según la estrategia especificada."""
    if strategy == PivotStrategy.FIRST:
        return low
    elif strategy == PivotStrategy.LAST:
        return high
    elif strategy == PivotStrategy.MIDDLE:
        return (low + high) // 2
    elif strategy == PivotStrategy.RANDOM:
        return random.randint(low, high)
    elif strategy == PivotStrategy.MEDIAN_OF_THREE:
        return _median_of_three(arr, low, high)
    else:
        return high  # Default


def _median_of_three(arr: List[Any], low: int, high: int) -> int:
    """
    Seleccionar la mediana de tres elementos: primero, medio y último.
    Ayuda a evitar el peor caso en arrays ya ordenados.
    """
    mid = (low + high) // 2
    
    if arr[low] > arr[mid]:
        arr[low], arr[mid] = arr[mid], arr[low]
    
    if arr[mid] > arr[high]:
        arr[mid], arr[high] = arr[high], arr[mid]
    
    if arr[low] > arr[mid]:
        arr[low], arr[mid] = arr[mid], arr[low]
    
    return mid


def quick_sort_3way(arr: List[Any]) -> List[Any]:
    """
    Quick Sort de 3 vías para arrays con muchos duplicados.
    Optimización para cuando hay muchos elementos iguales.
    
    Particiona el array en tres partes:
    - Elementos menores que el pivote
    - Elementos iguales al pivote
    - Elementos mayores que el pivote
    """
    if len(arr) <= 1:
        return arr.copy()
    
    result = arr.copy()
    _quick_sort_3way_recursive(result, 0, len(result) - 1)
    return result


def _quick_sort_3way_recursive(arr: List[Any], low: int, high: int) -> None:
    """Función recursiva para Quick Sort de 3 vías."""
    if low >= high:
        return
    
    # Particionar en 3 partes
    lt, gt = _partition_3way(arr, low, high)
    
    # Recursivamente ordenar las partes < y > pivote
    _quick_sort_3way_recursive(arr, low, lt - 1)
    _quick_sort_3way_recursive(arr, gt + 1, high)


def _partition_3way(arr: List[Any], low: int, high: int) -> tuple:
    """
    Partición de 3 vías que retorna los límites de la región igual al pivote.
    
    Returns:
        (lt, gt): donde arr[low:lt] < pivot, arr[lt:gt+1] == pivot, arr[gt+1:high+1] > pivot
    """
    pivot_value = arr[low]
    lt = low      # arr[low:lt] < pivot
    i = low + 1   # arr[lt:i] == pivot
    gt = high     # arr[gt+1:high+1] > pivot
    
    while i <= gt:
        if arr[i] < pivot_value:
            arr[lt], arr[i] = arr[i], arr[lt]
            lt += 1
            i += 1
        elif arr[i] > pivot_value:
            arr[i], arr[gt] = arr[gt], arr[i]
            gt -= 1
            # No incrementamos i porque el elemento intercambiado aún no ha sido procesado
        else:
            i += 1
    
    return lt, gt


def quick_select(arr: List[Any], k: int) -> Any:
    """
    Encuentra el k-ésimo elemento más pequeño usando Quick Select.
    
    Args:
        arr: Lista de elementos
        k: Posición del elemento a encontrar (0-indexado)
        
    Returns:
        El k-ésimo elemento más pequeño
    """
    if not 0 <= k < len(arr):
        raise ValueError(f"k debe estar entre 0 y {len(arr)-1}")
    
    arr_copy = arr.copy()
    return _quick_select_recursive(arr_copy, 0, len(arr_copy) - 1, k)


def _quick_select_recursive(arr: List[Any], low: int, high: int, k: int) -> Any:
    """Función recursiva para Quick Select."""
    if low == high:
        return arr[low]
    
    pivot_index = _partition(arr, low, high, PivotStrategy.RANDOM)
    
    if k == pivot_index:
        return arr[k]
    elif k < pivot_index:
        return _quick_select_recursive(arr, low, pivot_index - 1, k)
    else:
        return _quick_select_recursive(arr, pivot_index + 1, high, k)


def benchmark_strategies(arr: List[int]) -> None:
    """Comparar el rendimiento de diferentes estrategias de pivote."""
    strategies = [
        PivotStrategy.FIRST,
        PivotStrategy.LAST,
        PivotStrategy.MIDDLE,
        PivotStrategy.RANDOM,
        PivotStrategy.MEDIAN_OF_THREE
    ]
    
    print("Benchmark de estrategias de pivote:")
    print(f"Array de {len(arr)} elementos")
    print("-" * 60)
    
    for strategy in strategies:
        arr_copy = arr.copy()
        start_time = time.time()
        
        quick_sort_inplace(arr_copy, strategy)
        
        end_time = time.time()
        execution_time = (end_time - start_time) * 1000  # en ms
        
        print(f"{strategy.value:20}: {execution_time:8.3f} ms")


def demo():
    """Demostración de Quick Sort y sus variantes."""
    print("=== Demostración de Quick Sort ===\n")
    
    # Array de ejemplo
    arr = [64, 34, 25, 12, 22, 11, 90, 5, 77, 30]
    print(f"Array original: {arr}")
    
    # Quick Sort básico
    print("\n1. Quick Sort básico:")
    for strategy in [PivotStrategy.FIRST, PivotStrategy.RANDOM, PivotStrategy.MEDIAN_OF_THREE]:
        sorted_arr = quick_sort(arr, strategy)
        print(f"  {strategy.value:20}: {sorted_arr}")
    
    # Quick Sort de 3 vías
    print("\n2. Quick Sort de 3 vías (para arrays con duplicados):")
    arr_with_duplicates = [5, 2, 8, 2, 9, 1, 5, 5, 2, 8, 1]
    print(f"Array con duplicados: {arr_with_duplicates}")
    sorted_3way = quick_sort_3way(arr_with_duplicates)
    print(f"Resultado 3-way:      {sorted_3way}")
    
    # Quick Select
    print("\n3. Quick Select (encontrar k-ésimo elemento):")
    test_arr = [7, 10, 4, 3, 20, 15]
    print(f"Array: {test_arr}")
    for k in range(len(test_arr)):
        kth_element = quick_select(test_arr, k)
        print(f"  {k+1}º elemento más pequeño: {kth_element}")
    
    # Casos especiales
    print("\n4. Casos especiales:")
    
    # Array vacío
    empty = []
    print(f"Array vacío: {quick_sort(empty)}")
    
    # Array con un elemento
    single = [42]
    print(f"Un elemento: {quick_sort(single)}")
    
    # Array ya ordenado
    sorted_arr = [1, 2, 3, 4, 5]
    print(f"Ya ordenado: {quick_sort(sorted_arr)}")
    
    # Array ordenado inversamente
    reverse_sorted = [5, 4, 3, 2, 1]
    print(f"Orden inverso: {quick_sort(reverse_sorted)}")
    
    # Benchmark
    print("\n5. Benchmark de estrategias:")
    large_arr = list(range(1000, 0, -1))  # Array grande ordenado inversamente
    benchmark_strategies(large_arr)
    
    print("\n6. Comparación con otros algoritmos:")
    test_sizes = [100, 1000, 5000]
    
    for size in test_sizes:
        # Generar array aleatorio
        random_arr = [random.randint(1, 1000) for _ in range(size)]
        
        # Quick Sort
        start = time.time()
        quick_sort(random_arr)
        quick_time = (time.time() - start) * 1000
        
        # Python built-in sort (Timsort)
        start = time.time()
        sorted(random_arr)
        builtin_time = (time.time() - start) * 1000
        
        print(f"Tamaño {size:5}: Quick Sort: {quick_time:6.2f}ms, "
              f"Built-in: {builtin_time:6.2f}ms")


if __name__ == "__main__":
    demo()

