"""
Stack (Pila) - Estructura de Datos LIFO (Last In, First Out)

Una pila es una estructura de datos lineal que sigue el principio LIFO.
Los elementos se añaden y eliminan desde el mismo extremo, llamado "top".

Operaciones principales:
- push(item): Añadir un elemento al top
- pop(): Eliminar y retornar el elemento del top
- peek()/top(): Ver el elemento del top sin eliminarlo
- is_empty(): Verificar si la pila está vacía
- size(): Obtener el número de elementos

Complejidad temporal:
- Push: O(1)
- Pop: O(1)
- Peek: O(1)
- Search: O(n)

Aplicaciones:
- Evaluación de expresiones
- Recursión
- Undo operations
- Browser history
- Function calls
"""

from typing import Any, Optional, List
import sys
from pathlib import Path

# Agregar el directorio padre para importar módulos de testing
sys.path.append(str(Path(__file__).parent.parent.parent))


class Stack:
    """Implementación de una Pila usando lista de Python."""
    
    def __init__(self, capacity: Optional[int] = None):
        """
        Inicializar la pila.
        
        Args:
            capacity: Capacidad máxima de la pila (opcional)
        """
        self._items: List[Any] = []
        self._capacity = capacity
    
    def push(self, item: Any) -> None:
        """
        Añadir un elemento al top de la pila.
        
        Args:
            item: Elemento a añadir
            
        Raises:
            OverflowError: Si la pila está llena
        """
        if self._capacity and len(self._items) >= self._capacity:
            raise OverflowError("Stack overflow: La pila está llena")
        
        self._items.append(item)
    
    def pop(self) -> Any:
        """
        Eliminar y retornar el elemento del top.
        
        Returns:
            El elemento eliminado
            
        Raises:
            IndexError: Si la pila está vacía
        """
        if self.is_empty():
            raise IndexError("Stack underflow: La pila está vacía")
        
        return self._items.pop()
    
    def peek(self) -> Any:
        """
        Ver el elemento del top sin eliminarlo.
        
        Returns:
            El elemento del top
            
        Raises:
            IndexError: Si la pila está vacía
        """
        if self.is_empty():
            raise IndexError("Peek en pila vacía")
        
        return self._items[-1]
    
    def is_empty(self) -> bool:
        """Verificar si la pila está vacía."""
        return len(self._items) == 0
    
    def size(self) -> int:
        """Obtener el número de elementos en la pila."""
        return len(self._items)
    
    def clear(self) -> None:
        """Vaciar la pila."""
        self._items.clear()
    
    def to_list(self) -> List[Any]:
        """Convertir la pila a lista (top a bottom)."""
        return self._items[::-1]
    
    def __str__(self) -> str:
        """Representación string de la pila."""
        if self.is_empty():
            return "Stack: []"
        return f"Stack: [bottom -> {' -> '.join(map(str, self._items))} <- top]"
    
    def __len__(self) -> int:
        """Soporte para len()."""
        return self.size()
    
    def __bool__(self) -> bool:
        """Soporte para evaluaciones booleanas."""
        return not self.is_empty()


class ArrayStack:
    """Implementación de pila usando array de tamaño fijo."""
    
    def __init__(self, capacity: int):
        """
        Inicializar pila con capacidad fija.
        
        Args:
            capacity: Tamaño máximo de la pila
        """
        if capacity <= 0:
            raise ValueError("La capacidad debe ser positiva")
        
        self._capacity = capacity
        self._items = [None] * capacity
        self._top = -1
    
    def push(self, item: Any) -> None:
        """Añadir elemento al top."""
        if self._top >= self._capacity - 1:
            raise OverflowError("Stack overflow")
        
        self._top += 1
        self._items[self._top] = item
    
    def pop(self) -> Any:
        """Eliminar y retornar elemento del top."""
        if self._top < 0:
            raise IndexError("Stack underflow")
        
        item = self._items[self._top]
        self._items[self._top] = None  # Limpiar referencia
        self._top -= 1
        return item
    
    def peek(self) -> Any:
        """Ver elemento del top."""
        if self._top < 0:
            raise IndexError("Peek en pila vacía")
        
        return self._items[self._top]
    
    def is_empty(self) -> bool:
        """Verificar si está vacía."""
        return self._top < 0
    
    def is_full(self) -> bool:
        """Verificar si está llena."""
        return self._top >= self._capacity - 1
    
    def size(self) -> int:
        """Obtener número de elementos."""
        return self._top + 1
    
    def __str__(self) -> str:
        """Representación string."""
        if self.is_empty():
            return "ArrayStack: []"
        
        active_items = self._items[:self._top + 1]
        return f"ArrayStack: [bottom -> {' -> '.join(map(str, active_items))} <- top]"


def balanced_parentheses(expression: str) -> bool:
    """
    Verificar si los paréntesis en una expresión están balanceados.
    
    Args:
        expression: Cadena con paréntesis a verificar
        
    Returns:
        True si están balanceados, False en caso contrario
    """
    stack = Stack()
    opening = {'(', '[', '{'}
    closing = {')', ']', '}'}
    pairs = {'(': ')', '[': ']', '{': '}'}
    
    for char in expression:
        if char in opening:
            stack.push(char)
        elif char in closing:
            if stack.is_empty():
                return False
            
            last_opening = stack.pop()
            if pairs[last_opening] != char:
                return False
    
    return stack.is_empty()


def evaluate_postfix(expression: str) -> float:
    """
    Evaluar una expresión en notación postfija.
    
    Args:
        expression: Expresión postfija separada por espacios
        
    Returns:
        Resultado de la evaluación
        
    Example:
        >>> evaluate_postfix("3 4 + 2 *")
        14.0
    """
    stack = Stack()
    operators = {'+', '-', '*', '/'}
    
    tokens = expression.split()
    
    for token in tokens:
        if token in operators:
            if stack.size() < 2:
                raise ValueError("Expresión postfija inválida")
            
            b = stack.pop()
            a = stack.pop()
            
            if token == '+':
                result = a + b
            elif token == '-':
                result = a - b
            elif token == '*':
                result = a * b
            elif token == '/':
                if b == 0:
                    raise ZeroDivisionError("División por cero")
                result = a / b
            
            stack.push(result)
        else:
            try:
                stack.push(float(token))
            except ValueError:
                raise ValueError(f"Token inválido: {token}")
    
    if stack.size() != 1:
        raise ValueError("Expresión postfija inválida")
    
    return stack.pop()


def demo():
    """Demostración de las funcionalidades de la pila."""
    print("=== Demostración de Stack ===\n")
    
    # Stack básica
    print("1. Stack básica:")
    stack = Stack()
    
    print(f"Pila vacía: {stack}")
    print(f"¿Está vacía? {stack.is_empty()}")
    
    # Añadir elementos
    for i in [1, 2, 3, 4, 5]:
        stack.push(i)
        print(f"Push {i}: {stack}")
    
    print(f"Tamaño: {stack.size()}")
    print(f"Top element (peek): {stack.peek()}")
    
    # Eliminar elementos
    while not stack.is_empty():
        popped = stack.pop()
        print(f"Pop {popped}: {stack}")
    
    print()
    
    # Stack con capacidad limitada
    print("2. Stack con capacidad limitada:")
    limited_stack = Stack(capacity=3)
    
    for i in range(3):
        limited_stack.push(i)
        print(f"Push {i}: {limited_stack}")
    
    try:
        limited_stack.push(3)
    except OverflowError as e:
        print(f"Error al hacer push: {e}")
    
    print()
    
    # Paréntesis balanceados
    print("3. Verificación de paréntesis balanceados:")
    expressions = [
        "((()))",
        "(()())",
        "(()",
        "())",
        "{[()]}",
        "{[(])}"
    ]
    
    for expr in expressions:
        is_balanced = balanced_parentheses(expr)
        print(f"'{expr}' -> {'Balanceado' if is_balanced else 'No balanceado'}")
    
    print()
    
    # Evaluación postfija
    print("4. Evaluación de expresiones postfijas:")
    postfix_expressions = [
        "3 4 +",
        "3 4 + 2 *",
        "3 4 2 * +",
        "15 7 1 1 + - / 3 * 2 1 1 + + -"
    ]
    
    for expr in postfix_expressions:
        try:
            result = evaluate_postfix(expr)
            print(f"'{expr}' = {result}")
        except Exception as e:
            print(f"Error evaluando '{expr}': {e}")


if __name__ == "__main__":
    demo()

