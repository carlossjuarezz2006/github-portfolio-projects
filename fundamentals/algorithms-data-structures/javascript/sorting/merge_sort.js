/**
 * Merge Sort - Algoritmo de Ordenamiento por Mezcla
 * 
 * Merge Sort es un algoritmo de ordenamiento eficiente, estable y basado en
 * el paradigma "divide y vencerás". Funciona dividiendo recursivamente el
 * array por la mitad hasta obtener arrays de un solo elemento, luego los
 * combina (merge) de manera ordenada.
 * 
 * Algoritmo:
 * 1. Dividir el array por la mitad recursivamente
 * 2. Caso base: arrays de 0 o 1 elemento ya están ordenados
 * 3. Combinar (merge) los sub-arrays ordenados
 * 
 * Complejidad temporal: O(n log n) en todos los casos
 * Complejidad espacial: O(n) - requiere espacio adicional
 * 
 * Características:
 * - Estable: mantiene el orden relativo de elementos iguales
 * - No in-place: requiere espacio adicional
 * - Predictable: siempre O(n log n)
 * - Paralelizable: las divisiones pueden procesarse en paralelo
 */

/**
 * Ordenar array usando Merge Sort
 * @param {Array} arr - Array a ordenar
 * @param {Function} compareFunction - Función de comparación opcional
 * @returns {Array} Nuevo array ordenado
 */
function mergeSort(arr, compareFunction = (a, b) => a - b) {
    // Caso base: arrays de 0 o 1 elemento ya están ordenados
    if (arr.length <= 1) {
        return [...arr];
    }

    // Dividir el array por la mitad
    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);

    // Recursivamente ordenar ambas mitades y luego combinarlas
    return merge(
        mergeSort(left, compareFunction),
        mergeSort(right, compareFunction),
        compareFunction
    );
}

/**
 * Combinar dos arrays ordenados en uno solo ordenado
 * @param {Array} left - Array izquierdo ordenado
 * @param {Array} right - Array derecho ordenado
 * @param {Function} compareFunction - Función de comparación
 * @returns {Array} Array combinado y ordenado
 */
function merge(left, right, compareFunction) {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;

    // Combinar elementos mientras ambos arrays tengan elementos
    while (leftIndex < left.length && rightIndex < right.length) {
        if (compareFunction(left[leftIndex], right[rightIndex]) <= 0) {
            result.push(left[leftIndex]);
            leftIndex++;
        } else {
            result.push(right[rightIndex]);
            rightIndex++;
        }
    }

    // Agregar elementos restantes (si los hay)
    while (leftIndex < left.length) {
        result.push(left[leftIndex]);
        leftIndex++;
    }

    while (rightIndex < right.length) {
        result.push(right[rightIndex]);
        rightIndex++;
    }

    return result;
}

/**
 * Versión in-place de Merge Sort (optimizada en espacio)
 * @param {Array} arr - Array a ordenar (modificado in-place)
 * @param {Function} compareFunction - Función de comparación
 */
function mergeSortInPlace(arr, compareFunction = (a, b) => a - b) {
    if (arr.length <= 1) {
        return;
    }

    mergeSortHelper(arr, 0, arr.length - 1, compareFunction);
}

/**
 * Función auxiliar recursiva para merge sort in-place
 * @param {Array} arr - Array a ordenar
 * @param {number} left - Índice izquierdo
 * @param {number} right - Índice derecho
 * @param {Function} compareFunction - Función de comparación
 */
function mergeSortHelper(arr, left, right, compareFunction) {
    if (left >= right) {
        return;
    }

    const middle = Math.floor((left + right) / 2);

    // Recursivamente ordenar ambas mitades
    mergeSortHelper(arr, left, middle, compareFunction);
    mergeSortHelper(arr, middle + 1, right, compareFunction);

    // Combinar las mitades ordenadas
    mergeInPlace(arr, left, middle, right, compareFunction);
}

/**
 * Combinar dos secciones ordenadas del array in-place
 * @param {Array} arr - Array original
 * @param {number} left - Índice de inicio de la primera sección
 * @param {number} middle - Índice final de la primera sección
 * @param {number} right - Índice final de la segunda sección
 * @param {Function} compareFunction - Función de comparación
 */
function mergeInPlace(arr, left, middle, right, compareFunction) {
    // Crear arrays temporales para las dos mitades
    const leftArr = arr.slice(left, middle + 1);
    const rightArr = arr.slice(middle + 1, right + 1);

    let leftIndex = 0;
    let rightIndex = 0;
    let mergedIndex = left;

    // Combinar los arrays temporales de vuelta al array original
    while (leftIndex < leftArr.length && rightIndex < rightArr.length) {
        if (compareFunction(leftArr[leftIndex], rightArr[rightIndex]) <= 0) {
            arr[mergedIndex] = leftArr[leftIndex];
            leftIndex++;
        } else {
            arr[mergedIndex] = rightArr[rightIndex];
            rightIndex++;
        }
        mergedIndex++;
    }

    // Copiar elementos restantes
    while (leftIndex < leftArr.length) {
        arr[mergedIndex] = leftArr[leftIndex];
        leftIndex++;
        mergedIndex++;
    }

    while (rightIndex < rightArr.length) {
        arr[mergedIndex] = rightArr[rightIndex];
        rightIndex++;
        mergedIndex++;
    }
}

/**
 * Merge Sort iterativo (bottom-up)
 * @param {Array} arr - Array a ordenar
 * @param {Function} compareFunction - Función de comparación
 * @returns {Array} Nuevo array ordenado
 */
function mergeSortIterative(arr, compareFunction = (a, b) => a - b) {
    if (arr.length <= 1) {
        return [...arr];
    }

    let result = [...arr];
    const n = result.length;

    // Empezar con subarrays de tamaño 1, luego 2, 4, 8, etc.
    for (let currentSize = 1; currentSize < n; currentSize *= 2) {
        // Procesar todos los subarrays del tamaño actual
        for (let leftStart = 0; leftStart < n - 1; leftStart += currentSize * 2) {
            const middle = Math.min(leftStart + currentSize - 1, n - 1);
            const rightEnd = Math.min(leftStart + currentSize * 2 - 1, n - 1);

            if (middle < rightEnd) {
                mergeInPlace(result, leftStart, middle, rightEnd, compareFunction);
            }
        }
    }

    return result;
}

/**
 * Merge Sort natural (detecta secuencias ya ordenadas)
 * @param {Array} arr - Array a ordenar
 * @param {Function} compareFunction - Función de comparación
 * @returns {Array} Nuevo array ordenado
 */
function naturalMergeSort(arr, compareFunction = (a, b) => a - b) {
    if (arr.length <= 1) {
        return [...arr];
    }

    let result = [...arr];

    do {
        const runs = findRuns(result, compareFunction);
        if (runs.length <= 1) {
            break;
        }
        result = mergeRuns(result, runs, compareFunction);
    } while (true);

    return result;
}

/**
 * Encontrar secuencias ordenadas (runs) en el array
 * @param {Array} arr - Array a analizar
 * @param {Function} compareFunction - Función de comparación
 * @returns {Array} Array de objetos {start, end} representing runs
 */
function findRuns(arr, compareFunction) {
    const runs = [];
    let start = 0;

    while (start < arr.length) {
        let end = start;
        
        // Encontrar el final de la secuencia actual
        while (end < arr.length - 1 && 
               compareFunction(arr[end], arr[end + 1]) <= 0) {
            end++;
        }

        runs.push({ start, end });
        start = end + 1;
    }

    return runs;
}

/**
 * Combinar runs consecutivos
 * @param {Array} arr - Array original
 * @param {Array} runs - Array de runs
 * @param {Function} compareFunction - Función de comparación
 * @returns {Array} Array con runs combinados
 */
function mergeRuns(arr, runs, compareFunction) {
    const result = [...arr];
    const newRuns = [];

    for (let i = 0; i < runs.length; i += 2) {
        if (i + 1 < runs.length) {
            // Combinar dos runs consecutivos
            const leftRun = runs[i];
            const rightRun = runs[i + 1];
            
            mergeInPlace(result, leftRun.start, leftRun.end, rightRun.end, compareFunction);
            newRuns.push({ start: leftRun.start, end: rightRun.end });
        } else {
            // Run único, mantener como está
            newRuns.push(runs[i]);
        }
    }

    return result;
}

/**
 * Generar array de prueba con diferentes características
 * @param {number} size - Tamaño del array
 * @param {string} type - Tipo: 'random', 'sorted', 'reverse', 'nearly'
 * @returns {Array} Array generado
 */
function generateTestArray(size, type = 'random') {
    const arr = [];

    switch (type) {
        case 'random':
            for (let i = 0; i < size; i++) {
                arr.push(Math.floor(Math.random() * 1000));
            }
            break;

        case 'sorted':
            for (let i = 0; i < size; i++) {
                arr.push(i);
            }
            break;

        case 'reverse':
            for (let i = size - 1; i >= 0; i--) {
                arr.push(i);
            }
            break;

        case 'nearly':
            for (let i = 0; i < size; i++) {
                arr.push(i);
            }
            // Intercambiar algunos elementos
            for (let i = 0; i < size / 10; i++) {
                const idx1 = Math.floor(Math.random() * size);
                const idx2 = Math.floor(Math.random() * size);
                [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
            }
            break;

        default:
            throw new Error(`Tipo de array no reconocido: ${type}`);
    }

    return arr;
}

/**
 * Verificar si un array está ordenado
 * @param {Array} arr - Array a verificar
 * @param {Function} compareFunction - Función de comparación
 * @returns {boolean} True si está ordenado
 */
function isSorted(arr, compareFunction = (a, b) => a - b) {
    for (let i = 1; i < arr.length; i++) {
        if (compareFunction(arr[i - 1], arr[i]) > 0) {
            return false;
        }
    }
    return true;
}

/**
 * Benchmark de diferentes variantes de merge sort
 * @param {Array} arr - Array de prueba
 */
function benchmarkMergeSort(arr) {
    console.log(`\n=== Benchmark Merge Sort (${arr.length} elementos) ===`);

    const algorithms = [
        { name: "Merge Sort Clásico", func: mergeSort },
        { name: "Merge Sort Iterativo", func: mergeSortIterative },
        { name: "Merge Sort Natural", func: naturalMergeSort }
    ];

    algorithms.forEach(({ name, func }) => {
        const testArr = [...arr];
        const startTime = performance.now();
        
        const sortedArr = func(testArr);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        const isCorrect = isSorted(sortedArr);
        console.log(`${name.padEnd(25)}: ${executionTime.toFixed(3).padStart(8)}ms ${isCorrect ? '✓' : '✗'}`);
    });

    // Comparar con Array.sort nativo
    const testArr = [...arr];
    const startTime = performance.now();
    testArr.sort((a, b) => a - b);
    const endTime = performance.now();
    
    console.log(`${'Array.sort() nativo'.padEnd(25)}: ${(endTime - startTime).toFixed(3).padStart(8)}ms ✓`);
}

/**
 * Función de demostración
 */
function demo() {
    console.log("=== Demostración de Merge Sort ===\n");

    // 1. Ejemplo básico
    console.log("1. Ejemplo básico:");
    const basicArray = [64, 34, 25, 12, 22, 11, 90, 5];
    console.log(`Array original: [${basicArray.join(', ')}]`);
    
    const sortedBasic = mergeSort(basicArray);
    console.log(`Array ordenado: [${sortedBasic.join(', ')}]`);
    console.log(`¿Está ordenado? ${isSorted(sortedBasic)}\n`);

    // 2. Ordenamiento de objetos
    console.log("2. Ordenamiento de objetos:");
    const people = [
        { name: "Ana", age: 25 },
        { name: "Bob", age: 30 },
        { name: "Carlos", age: 20 },
        { name: "Diana", age: 35 }
    ];

    const sortedByAge = mergeSort(people, (a, b) => a.age - b.age);
    console.log("Ordenado por edad:");
    sortedByAge.forEach(person => {
        console.log(`  ${person.name}: ${person.age} años`);
    });

    const sortedByName = mergeSort(people, (a, b) => a.name.localeCompare(b.name));
    console.log("Ordenado por nombre:");
    sortedByName.forEach(person => {
        console.log(`  ${person.name}: ${person.age} años`);
    });
    console.log();

    // 3. Estabilidad del algoritmo
    console.log("3. Verificación de estabilidad:");
    const stableTest = [
        { value: 3, id: 'a' },
        { value: 1, id: 'b' },
        { value: 3, id: 'c' },
        { value: 2, id: 'd' },
        { value: 3, id: 'e' }
    ];

    const stableSorted = mergeSort(stableTest, (a, b) => a.value - b.value);
    console.log("Array original:");
    stableTest.forEach(item => console.log(`  ${item.value}-${item.id}`));
    
    console.log("Después del ordenamiento (estable):");
    stableSorted.forEach(item => console.log(`  ${item.value}-${item.id}`));
    console.log("Los elementos con valor 3 mantienen su orden original: a, c, e\n");

    // 4. Casos especiales
    console.log("4. Casos especiales:");
    console.log(`Array vacío: [${mergeSort([]).join(', ')}]`);
    console.log(`Un elemento: [${mergeSort([42]).join(', ')}]`);
    console.log(`Ya ordenado: [${mergeSort([1, 2, 3, 4, 5]).join(', ')}]`);
    console.log(`Orden reverso: [${mergeSort([5, 4, 3, 2, 1]).join(', ')}]`);
    console.log(`Duplicados: [${mergeSort([3, 1, 4, 1, 5, 9, 2, 6, 5]).join(', ')}]\n`);

    // 5. Comparación de variantes
    console.log("5. Comparación de variantes:");
    const testArray = [38, 27, 43, 3, 9, 82, 10];
    console.log(`Array de prueba: [${testArray.join(', ')}]`);
    
    const classicResult = mergeSort(testArray);
    const iterativeResult = mergeSortIterative(testArray);
    const naturalResult = naturalMergeSort(testArray);
    
    console.log(`Clásico:   [${classicResult.join(', ')}]`);
    console.log(`Iterativo: [${iterativeResult.join(', ')}]`);
    console.log(`Natural:   [${naturalResult.join(', ')}]`);
    console.log();

    // 6. Versión in-place
    console.log("6. Merge Sort in-place:");
    const inPlaceArray = [...testArray];
    console.log(`Antes:    [${inPlaceArray.join(', ')}]`);
    mergeSortInPlace(inPlaceArray);
    console.log(`Después:  [${inPlaceArray.join(', ')}]`);
    console.log();

    // 7. Benchmark de rendimiento
    console.log("7. Benchmark de rendimiento:");
    const sizes = [1000, 5000, 10000];
    const types = ['random', 'sorted', 'reverse', 'nearly'];

    sizes.forEach(size => {
        types.forEach(type => {
            const testArr = generateTestArray(size, type);
            console.log(`\nTipo: ${type}, Tamaño: ${size}`);
            benchmarkMergeSort(testArr);
        });
    });

    // 8. Análisis de complejidad visual
    console.log("\n8. Análisis de complejidad:");
    [100, 500, 1000, 2000, 5000].forEach(size => {
        const arr = generateTestArray(size, 'random');
        const startTime = performance.now();
        mergeSort(arr);
        const endTime = performance.now();
        const time = endTime - startTime;
        
        console.log(`n=${size.toString().padStart(4)}: ${time.toFixed(3).padStart(8)}ms`);
    });
}

// Ejecutar demo si es el archivo principal
if (typeof require !== 'undefined' && require.main === module) {
    demo();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mergeSort,
        mergeSortInPlace,
        mergeSortIterative,
        naturalMergeSort,
        merge,
        generateTestArray,
        isSorted,
        benchmarkMergeSort
    };
}

// Para navegadores
if (typeof window !== 'undefined') {
    window.MergeSortModule = {
        mergeSort,
        mergeSortInPlace,
        mergeSortIterative,
        naturalMergeSort,
        merge,
        generateTestArray,
        isSorted,
        benchmarkMergeSort
    };
}

