/**
 * Stack (Pila) - Estructura de Datos LIFO (Last In, First Out)
 * 
 * Una pila es una estructura de datos lineal que sigue el principio LIFO.
 * Los elementos se añaden y eliminan desde el mismo extremo, llamado "top".
 * 
 * Operaciones principales:
 * - push(item): Añadir un elemento al top
 * - pop(): Eliminar y retornar el elemento del top
 * - peek()/top(): Ver el elemento del top sin eliminarlo
 * - isEmpty(): Verificar si la pila está vacía
 * - size(): Obtener el número de elementos
 * 
 * Complejidad temporal:
 * - Push: O(1)
 * - Pop: O(1)
 * - Peek: O(1)
 * - Search: O(n)
 * 
 * Aplicaciones:
 * - Evaluación de expresiones
 * - Recursión
 * - Undo operations
 * - Browser history
 * - Function calls
 */

class Stack {
    /**
     * Crear una nueva pila
     * @param {number} capacity - Capacidad máxima opcional
     */
    constructor(capacity = null) {
        this._items = [];
        this._capacity = capacity;
    }

    /**
     * Añadir un elemento al top de la pila
     * @param {*} item - Elemento a añadir
     * @throws {Error} Si la pila está llena
     */
    push(item) {
        if (this._capacity && this._items.length >= this._capacity) {
            throw new Error("Stack overflow: La pila está llena");
        }
        this._items.push(item);
    }

    /**
     * Eliminar y retornar el elemento del top
     * @returns {*} El elemento eliminado
     * @throws {Error} Si la pila está vacía
     */
    pop() {
        if (this.isEmpty()) {
            throw new Error("Stack underflow: La pila está vacía");
        }
        return this._items.pop();
    }

    /**
     * Ver el elemento del top sin eliminarlo
     * @returns {*} El elemento del top
     * @throws {Error} Si la pila está vacía
     */
    peek() {
        if (this.isEmpty()) {
            throw new Error("Peek en pila vacía");
        }
        return this._items[this._items.length - 1];
    }

    /**
     * Verificar si la pila está vacía
     * @returns {boolean} True si está vacía
     */
    isEmpty() {
        return this._items.length === 0;
    }

    /**
     * Obtener el número de elementos
     * @returns {number} Tamaño de la pila
     */
    size() {
        return this._items.length;
    }

    /**
     * Vaciar la pila
     */
    clear() {
        this._items = [];
    }

    /**
     * Convertir a array (top a bottom)
     * @returns {Array} Array con elementos de la pila
     */
    toArray() {
        return [...this._items].reverse();
    }

    /**
     * Representación string de la pila
     * @returns {string} Representación de la pila
     */
    toString() {
        if (this.isEmpty()) {
            return "Stack: []";
        }
        return `Stack: [bottom -> ${this._items.join(' -> ')} <- top]`;
    }

    /**
     * Obtener información de la pila
     * @returns {Object} Información detallada
     */
    getInfo() {
        return {
            size: this.size(),
            isEmpty: this.isEmpty(),
            top: this.isEmpty() ? null : this.peek(),
            capacity: this._capacity,
            isFull: this._capacity ? this.size() >= this._capacity : false
        };
    }
}

/**
 * Implementación de pila usando array de tamaño fijo
 */
class ArrayStack {
    /**
     * Crear pila con capacidad fija
     * @param {number} capacity - Tamaño máximo
     */
    constructor(capacity) {
        if (capacity <= 0) {
            throw new Error("La capacidad debe ser positiva");
        }
        
        this._capacity = capacity;
        this._items = new Array(capacity);
        this._top = -1;
    }

    /**
     * Añadir elemento al top
     * @param {*} item - Elemento a añadir
     */
    push(item) {
        if (this.isFull()) {
            throw new Error("Stack overflow");
        }
        this._items[++this._top] = item;
    }

    /**
     * Eliminar y retornar elemento del top
     * @returns {*} Elemento eliminado
     */
    pop() {
        if (this.isEmpty()) {
            throw new Error("Stack underflow");
        }
        const item = this._items[this._top];
        this._items[this._top] = null; // Limpiar referencia
        this._top--;
        return item;
    }

    /**
     * Ver elemento del top
     * @returns {*} Elemento del top
     */
    peek() {
        if (this.isEmpty()) {
            throw new Error("Peek en pila vacía");
        }
        return this._items[this._top];
    }

    /**
     * Verificar si está vacía
     * @returns {boolean}
     */
    isEmpty() {
        return this._top < 0;
    }

    /**
     * Verificar si está llena
     * @returns {boolean}
     */
    isFull() {
        return this._top >= this._capacity - 1;
    }

    /**
     * Obtener número de elementos
     * @returns {number}
     */
    size() {
        return this._top + 1;
    }

    toString() {
        if (this.isEmpty()) {
            return "ArrayStack: []";
        }
        const activeItems = this._items.slice(0, this._top + 1);
        return `ArrayStack: [bottom -> ${activeItems.join(' -> ')} <- top]`;
    }
}

/**
 * Verificar si los paréntesis en una expresión están balanceados
 * @param {string} expression - Expresión a verificar
 * @returns {boolean} True si están balanceados
 */
function balancedParentheses(expression) {
    const stack = new Stack();
    const opening = new Set(['(', '[', '{']);
    const closing = new Set([')', ']', '}']);
    const pairs = { '(': ')', '[': ']', '{': '}' };

    for (const char of expression) {
        if (opening.has(char)) {
            stack.push(char);
        } else if (closing.has(char)) {
            if (stack.isEmpty()) {
                return false;
            }
            
            const lastOpening = stack.pop();
            if (pairs[lastOpening] !== char) {
                return false;
            }
        }
    }

    return stack.isEmpty();
}

/**
 * Evaluar expresión en notación postfija
 * @param {string} expression - Expresión postfija separada por espacios
 * @returns {number} Resultado de la evaluación
 */
function evaluatePostfix(expression) {
    const stack = new Stack();
    const operators = new Set(['+', '-', '*', '/']);
    const tokens = expression.trim().split(/\s+/);

    for (const token of tokens) {
        if (operators.has(token)) {
            if (stack.size() < 2) {
                throw new Error("Expresión postfija inválida");
            }

            const b = stack.pop();
            const a = stack.pop();
            let result;

            switch (token) {
                case '+':
                    result = a + b;
                    break;
                case '-':
                    result = a - b;
                    break;
                case '*':
                    result = a * b;
                    break;
                case '/':
                    if (b === 0) {
                        throw new Error("División por cero");
                    }
                    result = a / b;
                    break;
            }

            stack.push(result);
        } else {
            const num = parseFloat(token);
            if (isNaN(num)) {
                throw new Error(`Token inválido: ${token}`);
            }
            stack.push(num);
        }
    }

    if (stack.size() !== 1) {
        throw new Error("Expresión postfija inválida");
    }

    return stack.pop();
}

/**
 * Convertir expresión infija a postfija
 * @param {string} expression - Expresión infija
 * @returns {string} Expresión postfija
 */
function infixToPostfix(expression) {
    const stack = new Stack();
    const output = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const operators = new Set(['+', '-', '*', '/']);

    // Remover espacios y tokenizar
    const tokens = expression.replace(/\s+/g, '').match(/[+\-*/()]|\d+(\.\d+)?/g) || [];

    for (const token of tokens) {
        if (!isNaN(parseFloat(token))) {
            // Es un número
            output.push(token);
        } else if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (!stack.isEmpty() && stack.peek() !== '(') {
                output.push(stack.pop());
            }
            if (!stack.isEmpty()) {
                stack.pop(); // Remover '('
            }
        } else if (operators.has(token)) {
            while (!stack.isEmpty() && 
                   stack.peek() !== '(' && 
                   precedence[stack.peek()] >= precedence[token]) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    }

    while (!stack.isEmpty()) {
        output.push(stack.pop());
    }

    return output.join(' ');
}

/**
 * Función de demostración
 */
function demo() {
    console.log("=== Demostración de Stack ===\n");

    // 1. Stack básica
    console.log("1. Stack básica:");
    const stack = new Stack();

    console.log(`Pila vacía: ${stack.toString()}`);
    console.log(`¿Está vacía? ${stack.isEmpty()}`);

    // Añadir elementos
    for (const item of [1, 2, 3, 4, 5]) {
        stack.push(item);
        console.log(`Push ${item}: ${stack.toString()}`);
    }

    console.log(`Tamaño: ${stack.size()}`);
    console.log(`Top element (peek): ${stack.peek()}`);
    console.log(`Info: ${JSON.stringify(stack.getInfo(), null, 2)}`);

    // Eliminar elementos
    while (!stack.isEmpty()) {
        const popped = stack.pop();
        console.log(`Pop ${popped}: ${stack.toString()}`);
    }

    console.log("\n");

    // 2. Stack con capacidad limitada
    console.log("2. Stack con capacidad limitada:");
    const limitedStack = new Stack(3);

    for (let i = 0; i < 3; i++) {
        limitedStack.push(i);
        console.log(`Push ${i}: ${limitedStack.toString()}`);
    }

    try {
        limitedStack.push(3);
    } catch (error) {
        console.log(`Error al hacer push: ${error.message}`);
    }

    console.log("\n");

    // 3. Paréntesis balanceados
    console.log("3. Verificación de paréntesis balanceados:");
    const expressions = [
        "((()))",
        "(()())",
        "(()",
        "())",
        "{[()]}",
        "{[(])}"
    ];

    expressions.forEach(expr => {
        const isBalanced = balancedParentheses(expr);
        console.log(`'${expr}' -> ${isBalanced ? 'Balanceado' : 'No balanceado'}`);
    });

    console.log("\n");

    // 4. Evaluación postfija
    console.log("4. Evaluación de expresiones postfijas:");
    const postfixExpressions = [
        "3 4 +",
        "3 4 + 2 *",
        "3 4 2 * +",
        "15 7 1 1 + - / 3 * 2 1 1 + + -"
    ];

    postfixExpressions.forEach(expr => {
        try {
            const result = evaluatePostfix(expr);
            console.log(`'${expr}' = ${result}`);
        } catch (error) {
            console.log(`Error evaluando '${expr}': ${error.message}`);
        }
    });

    console.log("\n");

    // 5. Conversión infija a postfija
    console.log("5. Conversión de infija a postfija:");
    const infixExpressions = [
        "3 + 4",
        "(3 + 4) * 2",
        "3 + 4 * 2",
        "3 * 4 + 2"
    ];

    infixExpressions.forEach(expr => {
        try {
            const postfix = infixToPostfix(expr);
            const result = evaluatePostfix(postfix);
            console.log(`'${expr}' -> '${postfix}' = ${result}`);
        } catch (error) {
            console.log(`Error con '${expr}': ${error.message}`);
        }
    });

    console.log("\n");

    // 6. ArrayStack
    console.log("6. ArrayStack (capacidad fija):");
    const arrayStack = new ArrayStack(4);

    for (let i = 1; i <= 4; i++) {
        arrayStack.push(`Item${i}`);
        console.log(`Push Item${i}: ${arrayStack.toString()}`);
    }

    console.log(`¿Está llena? ${arrayStack.isFull()}`);

    try {
        arrayStack.push("Item5");
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }

    // Performance test
    console.log("\n7. Test de rendimiento:");
    const perfStack = new Stack();
    const iterations = 100000;

    const startTime = Date.now();
    for (let i = 0; i < iterations; i++) {
        perfStack.push(i);
    }
    for (let i = 0; i < iterations; i++) {
        perfStack.pop();
    }
    const endTime = Date.now();

    console.log(`${iterations * 2} operaciones (push + pop) en ${endTime - startTime}ms`);
}

// Ejecutar demo si es el archivo principal
if (typeof require !== 'undefined' && require.main === module) {
    demo();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Stack,
        ArrayStack,
        balancedParentheses,
        evaluatePostfix,
        infixToPostfix
    };
}

// Para navegadores
if (typeof window !== 'undefined') {
    window.StackModule = {
        Stack,
        ArrayStack,
        balancedParentheses,
        evaluatePostfix,
        infixToPostfix
    };
}

