#!/usr/bin/env python3
"""
Sorting Algorithms Benchmark

Este script compara el rendimiento de diferentes algoritmos de ordenamiento
con varios tipos de datos y tamaños de entrada.

Algoritmos incluidos:
- Quick Sort (con diferentes estrategias de pivote)
- Merge Sort
- Heap Sort
- Insertion Sort
- Selection Sort
- Bubble Sort
- Python's Timsort (sorted() built-in)

Tipos de datos:
- Aleatorio
- Ya ordenado
- Orden inverso
- Parcialmente ordenado
- Con muchos duplicados

Métricas:
- Tiempo de ejecución
- Número de comparaciones
- Número de intercambios
- Uso de memoria (aproximado)
"""

import time
import random
import sys
import gc
import tracemalloc
import statistics
from typing import List, Dict, Tuple, Callable, Any
from dataclasses import dataclass
from enum import Enum
import matplotlib.pyplot as plt
import pandas as pd


@dataclass
class BenchmarkResult:
    """Resultado de un benchmark individual."""
    algorithm_name: str
    data_type: str
    size: int
    time_ms: float
    comparisons: int
    swaps: int
    memory_mb: float
    is_sorted: bool


class DataType(Enum):
    """Tipos de datos para testing."""
    RANDOM = "random"
    SORTED = "sorted"
    REVERSE = "reverse"
    NEARLY_SORTED = "nearly_sorted"
    MANY_DUPLICATES = "many_duplicates"
    SINGLE_VALUE = "single_value"


class SortingBenchmark:
    """Clase principal para ejecutar benchmarks de algoritmos de ordenamiento."""
    
    def __init__(self):
        self.results: List[BenchmarkResult] = []
        self.comparison_count = 0
        self.swap_count = 0
        
    def reset_counters(self):
        """Reset contadores de comparaciones e intercambios."""
        self.comparison_count = 0
        self.swap_count = 0
    
    def compare(self, a: Any, b: Any) -> int:
        """Comparación con contador."""
        self.comparison_count += 1
        if a < b:
            return -1
        elif a > b:
            return 1
        return 0
    
    def swap(self, arr: List[Any], i: int, j: int):
        """Intercambio con contador."""
        if i != j:
            self.swap_count += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    def generate_data(self, size: int, data_type: DataType) -> List[int]:
        """Generar datos de prueba según el tipo especificado."""
        if data_type == DataType.RANDOM:
            return [random.randint(1, size) for _ in range(size)]
        
        elif data_type == DataType.SORTED:
            return list(range(1, size + 1))
        
        elif data_type == DataType.REVERSE:
            return list(range(size, 0, -1))
        
        elif data_type == DataType.NEARLY_SORTED:
            arr = list(range(1, size + 1))
            # Desordenar aproximadamente 10% de los elementos
            for _ in range(size // 10):
                i, j = random.randint(0, size - 1), random.randint(0, size - 1)
                arr[i], arr[j] = arr[j], arr[i]
            return arr
        
        elif data_type == DataType.MANY_DUPLICATES:
            # Solo usar valores del 1 al 10% del tamaño
            values = list(range(1, max(1, size // 10) + 1))
            return [random.choice(values) for _ in range(size)]
        
        elif data_type == DataType.SINGLE_VALUE:
            return [42] * size
        
        else:
            raise ValueError(f"Tipo de datos no soportado: {data_type}")
    
    def bubble_sort(self, arr: List[int]) -> List[int]:
        """Bubble Sort con contadores."""
        arr = arr.copy()
        n = len(arr)
        
        for i in range(n):
            swapped = False
            for j in range(0, n - i - 1):
                if self.compare(arr[j], arr[j + 1]) > 0:
                    self.swap(arr, j, j + 1)
                    swapped = True
            if not swapped:
                break
        
        return arr
    
    def selection_sort(self, arr: List[int]) -> List[int]:
        """Selection Sort con contadores."""
        arr = arr.copy()
        n = len(arr)
        
        for i in range(n):
            min_idx = i
            for j in range(i + 1, n):
                if self.compare(arr[j], arr[min_idx]) < 0:
                    min_idx = j
            if min_idx != i:
                self.swap(arr, i, min_idx)
        
        return arr
    
    def insertion_sort(self, arr: List[int]) -> List[int]:
        """Insertion Sort con contadores."""
        arr = arr.copy()
        
        for i in range(1, len(arr)):
            key = arr[i]
            j = i - 1
            
            while j >= 0 and self.compare(arr[j], key) > 0:
                arr[j + 1] = arr[j]
                j -= 1
                self.swap_count += 1  # Contar como intercambio
            
            arr[j + 1] = key
        
        return arr
    
    def merge_sort(self, arr: List[int]) -> List[int]:
        """Merge Sort con contadores."""
        if len(arr) <= 1:
            return arr.copy()
        
        mid = len(arr) // 2
        left = self.merge_sort(arr[:mid])
        right = self.merge_sort(arr[mid:])
        
        return self.merge(left, right)
    
    def merge(self, left: List[int], right: List[int]) -> List[int]:
        """Merge para merge sort."""
        result = []
        i = j = 0
        
        while i < len(left) and j < len(right):
            if self.compare(left[i], right[j]) <= 0:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
            self.swap_count += 1  # Contar como operación de movimiento
        
        result.extend(left[i:])
        result.extend(right[j:])
        self.swap_count += len(left[i:]) + len(right[j:])
        
        return result
    
    def quick_sort(self, arr: List[int]) -> List[int]:
        """Quick Sort con contadores."""
        arr = arr.copy()
        self._quick_sort_helper(arr, 0, len(arr) - 1)
        return arr
    
    def _quick_sort_helper(self, arr: List[int], low: int, high: int):
        """Helper recursivo para quick sort."""
        if low < high:
            pi = self._partition(arr, low, high)
            self._quick_sort_helper(arr, low, pi - 1)
            self._quick_sort_helper(arr, pi + 1, high)
    
    def _partition(self, arr: List[int], low: int, high: int) -> int:
        """Partición para quick sort."""
        # Elegir pivote aleatorio para evitar peor caso
        pivot_idx = random.randint(low, high)
        self.swap(arr, pivot_idx, high)
        
        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            if self.compare(arr[j], pivot) <= 0:
                i += 1
                self.swap(arr, i, j)
        
        self.swap(arr, i + 1, high)
        return i + 1
    
    def heap_sort(self, arr: List[int]) -> List[int]:
        """Heap Sort con contadores."""
        arr = arr.copy()
        n = len(arr)
        
        # Construir max heap
        for i in range(n // 2 - 1, -1, -1):
            self._heapify(arr, n, i)
        
        # Extraer elementos uno por uno
        for i in range(n - 1, 0, -1):
            self.swap(arr, 0, i)
            self._heapify(arr, i, 0)
        
        return arr
    
    def _heapify(self, arr: List[int], n: int, i: int):
        """Heapify para heap sort."""
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        if left < n and self.compare(arr[left], arr[largest]) > 0:
            largest = left
        
        if right < n and self.compare(arr[right], arr[largest]) > 0:
            largest = right
        
        if largest != i:
            self.swap(arr, i, largest)
            self._heapify(arr, n, largest)
    
    def python_sort(self, arr: List[int]) -> List[int]:
        """Python built-in sort (Timsort)."""
        # No podemos contar comparaciones/intercambios para Timsort
        return sorted(arr)
    
    def is_sorted(self, arr: List[int]) -> bool:
        """Verificar si el array está ordenado."""
        return all(arr[i] <= arr[i + 1] for i in range(len(arr) - 1))
    
    def measure_memory(self, func: Callable, arr: List[int]) -> Tuple[List[int], float]:
        """Medir uso de memoria durante la ejecución."""
        tracemalloc.start()
        
        result = func(arr)
        
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        return result, peak / 1024 / 1024  # Convertir a MB
    
    def benchmark_algorithm(self, algorithm_name: str, algorithm_func: Callable,
                          data: List[int], data_type: str) -> BenchmarkResult:
        """Ejecutar benchmark para un algoritmo específico."""
        size = len(data)
        self.reset_counters()
        
        # Garbage collection antes del benchmark
        gc.collect()
        
        # Medir memoria y tiempo
        start_time = time.perf_counter()
        result, memory_mb = self.measure_memory(algorithm_func, data)
        end_time = time.perf_counter()
        
        time_ms = (end_time - start_time) * 1000
        
        # Para Timsort, no tenemos contadores internos
        if algorithm_name == "Timsort":
            comparisons = -1  # Indicar que no está disponible
            swaps = -1
        else:
            comparisons = self.comparison_count
            swaps = self.swap_count
        
        is_correct = self.is_sorted(result)
        
        return BenchmarkResult(
            algorithm_name=algorithm_name,
            data_type=data_type,
            size=size,
            time_ms=time_ms,
            comparisons=comparisons,
            swaps=swaps,
            memory_mb=memory_mb,
            is_sorted=is_correct
        )
    
    def run_benchmark(self, sizes: List[int], data_types: List[DataType],
                     repetitions: int = 3) -> List[BenchmarkResult]:
        """Ejecutar benchmark completo."""
        algorithms = [
            ("Bubble Sort", self.bubble_sort),
            ("Selection Sort", self.selection_sort),
            ("Insertion Sort", self.insertion_sort),
            ("Merge Sort", self.merge_sort),
            ("Quick Sort", self.quick_sort),
            ("Heap Sort", self.heap_sort),
            ("Timsort", self.python_sort),
        ]
        
        results = []
        total_tests = len(sizes) * len(data_types) * len(algorithms) * repetitions
        current_test = 0
        
        for size in sizes:
            for data_type in data_types:
                print(f"\nTesting size {size}, type {data_type.value}:")
                
                for algorithm_name, algorithm_func in algorithms:
                    # Saltar algoritmos lentos para tamaños grandes
                    if size > 1000 and algorithm_name in ["Bubble Sort", "Selection Sort"]:
                        print(f"  {algorithm_name}: Skipped (too slow for large data)")
                        continue
                    
                    times = []
                    all_results = []
                    
                    for rep in range(repetitions):
                        current_test += 1
                        data = self.generate_data(size, data_type)
                        
                        result = self.benchmark_algorithm(
                            algorithm_name, algorithm_func, data, data_type.value
                        )
                        
                        times.append(result.time_ms)
                        all_results.append(result)
                        
                        print(f"  {algorithm_name}: {result.time_ms:.3f}ms "
                              f"({current_test}/{total_tests})", end='\r')
                    
                    # Usar la mediana de los tiempos
                    median_time = statistics.median(times)
                    best_result = min(all_results, key=lambda x: x.time_ms)
                    best_result.time_ms = median_time
                    
                    results.append(best_result)
                    print(f"  {algorithm_name}: {median_time:.3f}ms ✓" + " " * 20)
        
        self.results.extend(results)
        return results
    
    def generate_report(self, results: List[BenchmarkResult]):
        """Generar reporte detallado de los resultados."""
        print("\n" + "="*80)
        print("SORTING ALGORITHMS BENCHMARK REPORT")
        print("="*80)
        
        # Agrupar por tamaño
        sizes = sorted(set(r.size for r in results))
        
        for size in sizes:
            size_results = [r for r in results if r.size == size]
            
            print(f"\n{'Size: ' + str(size):^80}")
            print("-" * 80)
            print(f"{'Algorithm':<15} {'Type':<15} {'Time (ms)':<12} {'Comparisons':<12} {'Swaps':<12} {'Memory (MB)':<12}")
            print("-" * 80)
            
            for result in sorted(size_results, key=lambda x: (x.data_type, x.time_ms)):
                comparisons_str = str(result.comparisons) if result.comparisons >= 0 else "N/A"
                swaps_str = str(result.swaps) if result.swaps >= 0 else "N/A"
                
                print(f"{result.algorithm_name:<15} {result.data_type:<15} "
                      f"{result.time_ms:<12.3f} {comparisons_str:<12} {swaps_str:<12} "
                      f"{result.memory_mb:<12.3f}")
        
        # Resumen de mejores algoritmos
        print(f"\n{'BEST ALGORITHMS BY DATA TYPE':^80}")
        print("-" * 80)
        
        data_types = set(r.data_type for r in results)
        
        for data_type in sorted(data_types):
            type_results = [r for r in results if r.data_type == data_type]
            
            # Agrupar por tamaño y encontrar el mejor
            for size in sizes:
                size_type_results = [r for r in type_results if r.size == size]
                if size_type_results:
                    best = min(size_type_results, key=lambda x: x.time_ms)
                    print(f"{data_type} (n={size}): {best.algorithm_name} "
                          f"({best.time_ms:.3f}ms)")
    
    def plot_results(self, results: List[BenchmarkResult], save_path: str = None):
        """Generar gráficos de los resultados."""
        try:
            # Agrupar datos para gráficos
            df = pd.DataFrame([
                {
                    'Algorithm': r.algorithm_name,
                    'Data Type': r.data_type,
                    'Size': r.size,
                    'Time (ms)': r.time_ms,
                    'Comparisons': r.comparisons,
                    'Swaps': r.swaps
                }
                for r in results
            ])
            
            # Crear subplots
            fig, axes = plt.subplots(2, 2, figsize=(15, 12))
            fig.suptitle('Sorting Algorithms Benchmark Results', fontsize=16)
            
            # Gráfico 1: Tiempo vs Tamaño para datos aleatorios
            random_data = df[df['Data Type'] == 'random']
            if not random_data.empty:
                for algorithm in random_data['Algorithm'].unique():
                    alg_data = random_data[random_data['Algorithm'] == algorithm]
                    axes[0, 0].plot(alg_data['Size'], alg_data['Time (ms)'], 
                                   marker='o', label=algorithm)
                
                axes[0, 0].set_xlabel('Input Size')
                axes[0, 0].set_ylabel('Time (ms)')
                axes[0, 0].set_title('Performance on Random Data')
                axes[0, 0].legend()
                axes[0, 0].set_yscale('log')
            
            # Gráfico 2: Comparación por tipo de dato
            if len(df['Size'].unique()) > 0:
                size_to_plot = max(df['Size'].unique())
                size_data = df[df['Size'] == size_to_plot]
                
                pivot_data = size_data.pivot(index='Algorithm', columns='Data Type', values='Time (ms)')
                pivot_data.plot(kind='bar', ax=axes[0, 1])
                axes[0, 1].set_title(f'Performance by Data Type (n={size_to_plot})')
                axes[0, 1].set_ylabel('Time (ms)')
                axes[0, 1].tick_params(axis='x', rotation=45)
            
            # Gráfico 3: Comparaciones vs Intercambios
            valid_data = df[(df['Comparisons'] >= 0) & (df['Swaps'] >= 0)]
            if not valid_data.empty:
                for algorithm in valid_data['Algorithm'].unique():
                    alg_data = valid_data[valid_data['Algorithm'] == algorithm]
                    axes[1, 0].scatter(alg_data['Comparisons'], alg_data['Swaps'], 
                                     label=algorithm, alpha=0.7)
                
                axes[1, 0].set_xlabel('Comparisons')
                axes[1, 0].set_ylabel('Swaps')
                axes[1, 0].set_title('Comparisons vs Swaps')
                axes[1, 0].legend()
                axes[1, 0].set_xscale('log')
                axes[1, 0].set_yscale('log')
            
            # Gráfico 4: Eficiencia relativa
            if not random_data.empty and len(random_data) > 0:
                # Normalizar tiempos respecto al algoritmo más rápido
                for size in random_data['Size'].unique():
                    size_data = random_data[random_data['Size'] == size]
                    fastest_time = size_data['Time (ms)'].min()
                    
                    for idx in size_data.index:
                        df.loc[idx, 'Relative Performance'] = size_data.loc[idx, 'Time (ms)'] / fastest_time
                
                normalized_data = df[df['Data Type'] == 'random'].dropna(subset=['Relative Performance'])
                if not normalized_data.empty:
                    pivot_norm = normalized_data.pivot(index='Size', columns='Algorithm', values='Relative Performance')
                    pivot_norm.plot(ax=axes[1, 1], marker='o')
                    axes[1, 1].set_xlabel('Input Size')
                    axes[1, 1].set_ylabel('Relative Performance (1 = fastest)')
                    axes[1, 1].set_title('Relative Performance (Random Data)')
                    axes[1, 1].set_yscale('log')
            
            plt.tight_layout()
            
            if save_path:
                plt.savefig(save_path, dpi=300, bbox_inches='tight')
                print(f"\nGráficos guardados en: {save_path}")
            
            plt.show()
            
        except ImportError:
            print("Matplotlib o Pandas no disponibles. Saltando generación de gráficos.")
        except Exception as e:
            print(f"Error generando gráficos: {e}")


def main():
    """Función principal del benchmark."""
    print("Iniciando Sorting Algorithms Benchmark...")
    print("="*50)
    
    benchmark = SortingBenchmark()
    
    # Configurar tamaños y tipos de datos
    sizes = [100, 500, 1000, 2000]  # Tamaños moderados para incluir algoritmos lentos
    data_types = [
        DataType.RANDOM,
        DataType.SORTED,
        DataType.REVERSE,
        DataType.NEARLY_SORTED,
        DataType.MANY_DUPLICATES
    ]
    
    # Ejecutar benchmark
    results = benchmark.run_benchmark(sizes, data_types, repetitions=3)
    
    # Generar reporte
    benchmark.generate_report(results)
    
    # Generar gráficos
    benchmark.plot_results(results, "sorting_benchmark_results.png")
    
    # Guardar resultados en CSV
    try:
        df = pd.DataFrame([
            {
                'Algorithm': r.algorithm_name,
                'Data_Type': r.data_type,
                'Size': r.size,
                'Time_ms': r.time_ms,
                'Comparisons': r.comparisons,
                'Swaps': r.swaps,
                'Memory_MB': r.memory_mb,
                'Is_Sorted': r.is_sorted
            }
            for r in results
        ])
        
        df.to_csv('sorting_benchmark_results.csv', index=False)
        print(f"\nResultados guardados en: sorting_benchmark_results.csv")
        
    except Exception as e:
        print(f"Error guardando CSV: {e}")
    
    print("\nBenchmark completado!")


if __name__ == "__main__":
    # Configurar semilla para reproducibilidad
    random.seed(42)
    
    # Verificar dependencias opcionales
    try:
        import matplotlib.pyplot as plt
        import pandas as pd
    except ImportError:
        print("Advertencia: matplotlib y/o pandas no están instalados.")
        print("Los gráficos y export CSV no estarán disponibles.")
        print("Instalar con: pip install matplotlib pandas")
    
    main()

