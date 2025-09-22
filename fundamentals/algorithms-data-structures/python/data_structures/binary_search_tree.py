"""
Binary Search Tree (BST) - Árbol Binario de Búsqueda

Un BST es una estructura de datos de árbol donde cada nodo tiene como máximo dos hijos,
y se mantiene la propiedad: todos los valores en el subárbol izquierdo son menores que
el valor del nodo, y todos los valores en el subárbol derecho son mayores.

Operaciones principales:
- insert(value): Insertar un valor
- search(value): Buscar un valor
- delete(value): Eliminar un valor
- inorder(): Recorrido en orden (izquierda, raíz, derecha)
- preorder(): Recorrido preorden (raíz, izquierda, derecha)
- postorder(): Recorrido postorden (izquierda, derecha, raíz)

Complejidad temporal (árbol balanceado):
- Inserción: O(log n)
- Búsqueda: O(log n)
- Eliminación: O(log n)

Complejidad temporal (árbol desbalanceado - peor caso):
- Inserción: O(n)
- Búsqueda: O(n)
- Eliminación: O(n)
"""

from typing import Any, Optional, List, Iterator
from collections import deque


class TreeNode:
    """Nodo del árbol binario de búsqueda."""
    
    def __init__(self, value: Any):
        self.value = value
        self.left: Optional['TreeNode'] = None
        self.right: Optional['TreeNode'] = None
        
    def __str__(self) -> str:
        return str(self.value)


class BinarySearchTree:
    """Implementación de Árbol Binario de Búsqueda."""
    
    def __init__(self):
        """Inicializar BST vacío."""
        self.root: Optional[TreeNode] = None
        self._size = 0
    
    def insert(self, value: Any) -> None:
        """
        Insertar un valor en el BST.
        
        Args:
            value: Valor a insertar
        """
        if self.root is None:
            self.root = TreeNode(value)
            self._size += 1
        else:
            self._insert_recursive(self.root, value)
    
    def _insert_recursive(self, node: TreeNode, value: Any) -> None:
        """Inserción recursiva."""
        if value < node.value:
            if node.left is None:
                node.left = TreeNode(value)
                self._size += 1
            else:
                self._insert_recursive(node.left, value)
        elif value > node.value:
            if node.right is None:
                node.right = TreeNode(value)
                self._size += 1
            else:
                self._insert_recursive(node.right, value)
        # Si value == node.value, no insertamos duplicados
    
    def search(self, value: Any) -> bool:
        """
        Buscar un valor en el BST.
        
        Args:
            value: Valor a buscar
            
        Returns:
            True si el valor existe, False en caso contrario
        """
        return self._search_recursive(self.root, value)
    
    def _search_recursive(self, node: Optional[TreeNode], value: Any) -> bool:
        """Búsqueda recursiva."""
        if node is None:
            return False
        
        if value == node.value:
            return True
        elif value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)
    
    def find_min(self) -> Optional[Any]:
        """Encontrar el valor mínimo en el BST."""
        if self.root is None:
            return None
        
        node = self.root
        while node.left is not None:
            node = node.left
        return node.value
    
    def find_max(self) -> Optional[Any]:
        """Encontrar el valor máximo en el BST."""
        if self.root is None:
            return None
        
        node = self.root
        while node.right is not None:
            node = node.right
        return node.value
    
    def delete(self, value: Any) -> bool:
        """
        Eliminar un valor del BST.
        
        Args:
            value: Valor a eliminar
            
        Returns:
            True si se eliminó el valor, False si no existía
        """
        initial_size = self._size
        self.root = self._delete_recursive(self.root, value)
        return self._size < initial_size
    
    def _delete_recursive(self, node: Optional[TreeNode], value: Any) -> Optional[TreeNode]:
        """Eliminación recursiva."""
        if node is None:
            return None
        
        if value < node.value:
            node.left = self._delete_recursive(node.left, value)
        elif value > node.value:
            node.right = self._delete_recursive(node.right, value)
        else:
            # Nodo a eliminar encontrado
            self._size -= 1
            
            # Caso 1: Nodo sin hijos (hoja)
            if node.left is None and node.right is None:
                return None
            
            # Caso 2: Nodo con un hijo
            elif node.left is None:
                return node.right
            elif node.right is None:
                return node.left
            
            # Caso 3: Nodo con dos hijos
            else:
                # Encontrar el sucesor (mínimo en subárbol derecho)
                successor = self._find_min_node(node.right)
                node.value = successor.value
                node.right = self._delete_recursive(node.right, successor.value)
                self._size += 1  # Compensar la resta extra
        
        return node
    
    def _find_min_node(self, node: TreeNode) -> TreeNode:
        """Encontrar el nodo con valor mínimo."""
        while node.left is not None:
            node = node.left
        return node
    
    def inorder(self) -> List[Any]:
        """
        Recorrido en orden (izquierda, raíz, derecha).
        Retorna los valores en orden ascendente.
        """
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node: Optional[TreeNode], result: List[Any]) -> None:
        """Recorrido en orden recursivo."""
        if node is not None:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)
    
    def preorder(self) -> List[Any]:
        """
        Recorrido preorden (raíz, izquierda, derecha).
        """
        result = []
        self._preorder_recursive(self.root, result)
        return result
    
    def _preorder_recursive(self, node: Optional[TreeNode], result: List[Any]) -> None:
        """Recorrido preorden recursivo."""
        if node is not None:
            result.append(node.value)
            self._preorder_recursive(node.left, result)
            self._preorder_recursive(node.right, result)
    
    def postorder(self) -> List[Any]:
        """
        Recorrido postorden (izquierda, derecha, raíz).
        """
        result = []
        self._postorder_recursive(self.root, result)
        return result
    
    def _postorder_recursive(self, node: Optional[TreeNode], result: List[Any]) -> None:
        """Recorrido postorden recursivo."""
        if node is not None:
            self._postorder_recursive(node.left, result)
            self._postorder_recursive(node.right, result)
            result.append(node.value)
    
    def level_order(self) -> List[Any]:
        """
        Recorrido por niveles (BFS).
        """
        if self.root is None:
            return []
        
        result = []
        queue = deque([self.root])
        
        while queue:
            node = queue.popleft()
            result.append(node.value)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        return result
    
    def height(self) -> int:
        """Calcular la altura del árbol."""
        return self._height_recursive(self.root)
    
    def _height_recursive(self, node: Optional[TreeNode]) -> int:
        """Calcular altura recursivamente."""
        if node is None:
            return -1
        
        left_height = self._height_recursive(node.left)
        right_height = self._height_recursive(node.right)
        
        return max(left_height, right_height) + 1
    
    def is_valid_bst(self) -> bool:
        """Verificar si el árbol es un BST válido."""
        return self._is_valid_bst_recursive(self.root, float('-inf'), float('inf'))
    
    def _is_valid_bst_recursive(self, node: Optional[TreeNode], min_val: float, max_val: float) -> bool:
        """Validar BST recursivamente."""
        if node is None:
            return True
        
        if node.value <= min_val or node.value >= max_val:
            return False
        
        return (self._is_valid_bst_recursive(node.left, min_val, node.value) and
                self._is_valid_bst_recursive(node.right, node.value, max_val))
    
    def size(self) -> int:
        """Obtener el número de nodos en el árbol."""
        return self._size
    
    def is_empty(self) -> bool:
        """Verificar si el árbol está vacío."""
        return self._size == 0
    
    def clear(self) -> None:
        """Limpiar el árbol."""
        self.root = None
        self._size = 0
    
    def to_sorted_list(self) -> List[Any]:
        """Convertir BST a lista ordenada."""
        return self.inorder()
    
    def __len__(self) -> int:
        """Soporte para len()."""
        return self._size
    
    def __bool__(self) -> bool:
        """Soporte para evaluaciones booleanas."""
        return not self.is_empty()
    
    def __contains__(self, value: Any) -> bool:
        """Soporte para operador 'in'."""
        return self.search(value)
    
    def __iter__(self) -> Iterator[Any]:
        """Soporte para iteración (en orden)."""
        return iter(self.inorder())
    
    def print_tree(self) -> None:
        """Imprimir representación visual del árbol."""
        if self.root is None:
            print("Árbol vacío")
            return
        
        self._print_tree_recursive(self.root, "", True)
    
    def _print_tree_recursive(self, node: Optional[TreeNode], prefix: str, is_last: bool) -> None:
        """Imprimir árbol recursivamente."""
        if node is not None:
            print(prefix + ("└── " if is_last else "├── ") + str(node.value))
            
            # Preparar prefijo para los hijos
            extension = "    " if is_last else "│   "
            
            # Determinar si cada hijo es el último
            has_left = node.left is not None
            has_right = node.right is not None
            
            if has_right:
                self._print_tree_recursive(node.right, prefix + extension, not has_left)
            
            if has_left:
                self._print_tree_recursive(node.left, prefix + extension, True)


def demo():
    """Demostración de las funcionalidades del BST."""
    print("=== Demostración de Binary Search Tree ===\n")
    
    bst = BinarySearchTree()
    
    # Insertar elementos
    print("1. Inserción de elementos:")
    values = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]
    
    for value in values:
        bst.insert(value)
        print(f"Insertado {value}, tamaño: {len(bst)}")
    
    print(f"\nÁrbol resultante:")
    bst.print_tree()
    
    # Búsquedas
    print("\n2. Búsquedas:")
    search_values = [25, 55, 70, 100]
    for value in search_values:
        found = bst.search(value)
        print(f"Buscar {value}: {'Encontrado' if found else 'No encontrado'}")
    
    # Recorridos
    print("\n3. Recorridos:")
    print(f"En orden (ascendente): {bst.inorder()}")
    print(f"Preorden: {bst.preorder()}")
    print(f"Postorden: {bst.postorder()}")
    print(f"Por niveles: {bst.level_order()}")
    
    # Valores mínimo y máximo
    print(f"\n4. Valores extremos:")
    print(f"Mínimo: {bst.find_min()}")
    print(f"Máximo: {bst.find_max()}")
    print(f"Altura: {bst.height()}")
    
    # Eliminaciones
    print("\n5. Eliminaciones:")
    delete_values = [10, 30, 50]  # Casos: hoja, un hijo, dos hijos
    
    for value in delete_values:
        print(f"\nEliminando {value}...")
        deleted = bst.delete(value)
        print(f"{'Eliminado' if deleted else 'No encontrado'}")
        print(f"En orden después de eliminar: {bst.inorder()}")
        bst.print_tree()
    
    # Verificar si es BST válido
    print(f"\n6. Validación:")
    print(f"¿Es BST válido? {bst.is_valid_bst()}")
    
    # Uso de operadores
    print(f"\n7. Operadores:")
    print(f"25 in bst: {25 in bst}")
    print(f"100 in bst: {100 in bst}")
    print(f"Tamaño con len(): {len(bst)}")
    
    # Iteración
    print(f"\n8. Iteración:")
    print("Valores usando for loop:", end=" ")
    for value in bst:
        print(value, end=" ")
    print()


if __name__ == "__main__":
    demo()

