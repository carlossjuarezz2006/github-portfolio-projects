/**
 * Tests for Stack implementation
 */

const { Stack, ArrayStack, balancedParentheses, evaluatePostfix } = require('../../javascript/data_structures/stack');

describe('Stack', () => {
    let stack;

    beforeEach(() => {
        stack = new Stack();
    });

    describe('Basic Operations', () => {
        test('should create empty stack', () => {
            expect(stack.isEmpty()).toBe(true);
            expect(stack.size()).toBe(0);
        });

        test('should push elements correctly', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);

            expect(stack.size()).toBe(3);
            expect(stack.isEmpty()).toBe(false);
            expect(stack.peek()).toBe(3);
        });

        test('should pop elements in LIFO order', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);

            expect(stack.pop()).toBe(3);
            expect(stack.pop()).toBe(2);
            expect(stack.pop()).toBe(1);
            expect(stack.isEmpty()).toBe(true);
        });

        test('should peek without removing element', () => {
            stack.push(42);
            
            expect(stack.peek()).toBe(42);
            expect(stack.size()).toBe(1);
            expect(stack.peek()).toBe(42); // Should still be there
        });

        test('should clear all elements', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);

            stack.clear();

            expect(stack.isEmpty()).toBe(true);
            expect(stack.size()).toBe(0);
        });
    });

    describe('Error Handling', () => {
        test('should throw error when popping empty stack', () => {
            expect(() => stack.pop()).toThrow('Stack underflow: La pila está vacía');
        });

        test('should throw error when peeking empty stack', () => {
            expect(() => stack.peek()).toThrow('Peek en pila vacía');
        });
    });

    describe('Capacity Limited Stack', () => {
        test('should respect capacity limit', () => {
            const limitedStack = new Stack(2);
            
            limitedStack.push(1);
            limitedStack.push(2);
            
            expect(() => limitedStack.push(3)).toThrow('Stack overflow: La pila está llena');
        });

        test('should work normally within capacity', () => {
            const limitedStack = new Stack(3);
            
            limitedStack.push(1);
            limitedStack.push(2);
            limitedStack.push(3);
            
            expect(limitedStack.size()).toBe(3);
            expect(limitedStack.peek()).toBe(3);
        });
    });

    describe('Conversion Methods', () => {
        test('should convert to array correctly', () => {
            stack.push(1);
            stack.push(2);
            stack.push(3);

            const array = stack.toArray();
            expect(array).toEqual([3, 2, 1]); // Top to bottom
        });

        test('should have correct string representation', () => {
            expect(stack.toString()).toBe('Stack: []');

            stack.push(1);
            stack.push(2);
            
            expect(stack.toString()).toBe('Stack: [bottom -> 1 -> 2 <- top]');
        });
    });

    describe('Stack Info', () => {
        test('should provide correct info', () => {
            const info = stack.getInfo();
            
            expect(info.size).toBe(0);
            expect(info.isEmpty).toBe(true);
            expect(info.top).toBe(null);
            expect(info.capacity).toBe(null);
            expect(info.isFull).toBe(false);
        });

        test('should provide correct info with elements', () => {
            stack.push(42);
            const info = stack.getInfo();
            
            expect(info.size).toBe(1);
            expect(info.isEmpty).toBe(false);
            expect(info.top).toBe(42);
        });
    });
});

describe('ArrayStack', () => {
    test('should create stack with fixed capacity', () => {
        const arrayStack = new ArrayStack(3);
        
        expect(arrayStack.isEmpty()).toBe(true);
        expect(arrayStack.isFull()).toBe(false);
        expect(arrayStack.size()).toBe(0);
    });

    test('should handle push and pop operations', () => {
        const arrayStack = new ArrayStack(3);
        
        arrayStack.push('A');
        arrayStack.push('B');
        arrayStack.push('C');
        
        expect(arrayStack.isFull()).toBe(true);
        expect(arrayStack.size()).toBe(3);
        
        expect(arrayStack.pop()).toBe('C');
        expect(arrayStack.pop()).toBe('B');
        expect(arrayStack.pop()).toBe('A');
        
        expect(arrayStack.isEmpty()).toBe(true);
    });

    test('should throw error on overflow', () => {
        const arrayStack = new ArrayStack(2);
        
        arrayStack.push(1);
        arrayStack.push(2);
        
        expect(() => arrayStack.push(3)).toThrow('Stack overflow');
    });

    test('should throw error when creating with invalid capacity', () => {
        expect(() => new ArrayStack(0)).toThrow('La capacidad debe ser positiva');
        expect(() => new ArrayStack(-1)).toThrow('La capacidad debe ser positiva');
    });
});

describe('Balanced Parentheses', () => {
    test('should detect balanced parentheses', () => {
        expect(balancedParentheses('()')).toBe(true);
        expect(balancedParentheses('(())')).toBe(true);
        expect(balancedParentheses('()()')).toBe(true);
        expect(balancedParentheses('{[()]}')).toBe(true);
        expect(balancedParentheses('')).toBe(true);
    });

    test('should detect unbalanced parentheses', () => {
        expect(balancedParentheses('(()')).toBe(false);
        expect(balancedParentheses('())')).toBe(false);
        expect(balancedParentheses('{[(])}')).toBe(false);
        expect(balancedParentheses('(((')).toBe(false);
        expect(balancedParentheses('))))')).toBe(false);
    });

    test('should handle mixed characters', () => {
        expect(balancedParentheses('if (x > 0) { return true; }')).toBe(true);
        expect(balancedParentheses('array[index')).toBe(false);
        expect(balancedParentheses('function() { if (true) { return [1, 2, 3]; } }')).toBe(true);
    });
});

describe('Postfix Evaluation', () => {
    test('should evaluate simple postfix expressions', () => {
        expect(evaluatePostfix('3 4 +')).toBe(7);
        expect(evaluatePostfix('5 2 -')).toBe(3);
        expect(evaluatePostfix('6 2 /')).toBe(3);
        expect(evaluatePostfix('4 5 *')).toBe(20);
    });

    test('should evaluate complex postfix expressions', () => {
        expect(evaluatePostfix('3 4 + 2 *')).toBe(14);
        expect(evaluatePostfix('3 4 2 * +')).toBe(11);
        expect(evaluatePostfix('15 7 1 1 + - / 3 * 2 1 1 + + -')).toBe(5);
    });

    test('should handle decimal numbers', () => {
        expect(evaluatePostfix('3.5 2.5 +')).toBe(6);
        expect(evaluatePostfix('10.5 2 /')).toBe(5.25);
    });

    test('should throw error for invalid expressions', () => {
        expect(() => evaluatePostfix('3 +')).toThrow('Expresión postfija inválida');
        expect(() => evaluatePostfix('3 4 + +')).toThrow('Expresión postfija inválida');
        expect(() => evaluatePostfix('')).toThrow('Expresión postfija inválida');
        expect(() => evaluatePostfix('abc')).toThrow('Token inválido: abc');
    });

    test('should throw error for division by zero', () => {
        expect(() => evaluatePostfix('5 0 /')).toThrow('División por cero');
    });

    test('should handle single number', () => {
        expect(evaluatePostfix('42')).toBe(42);
        expect(evaluatePostfix('-5')).toBe(-5);
    });
});

describe('Performance Tests', () => {
    test('should handle large number of operations efficiently', () => {
        const stack = new Stack();
        const n = 10000;

        // Push operations
        const pushStart = Date.now();
        for (let i = 0; i < n; i++) {
            stack.push(i);
        }
        const pushTime = Date.now() - pushStart;

        expect(stack.size()).toBe(n);
        expect(pushTime).toBeLessThan(100); // Should complete in less than 100ms

        // Pop operations
        const popStart = Date.now();
        for (let i = 0; i < n; i++) {
            stack.pop();
        }
        const popTime = Date.now() - popStart;

        expect(stack.isEmpty()).toBe(true);
        expect(popTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('should maintain O(1) performance for basic operations', () => {
        const stack = new Stack();
        
        // Test that operations remain fast even with many elements
        for (let i = 0; i < 1000; i++) {
            stack.push(i);
        }

        const start = Date.now();
        stack.push(1000);
        stack.peek();
        stack.pop();
        const end = Date.now();

        expect(end - start).toBeLessThan(10); // Operations should be nearly instantaneous
    });
});

