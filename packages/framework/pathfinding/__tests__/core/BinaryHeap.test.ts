import { describe, it, expect, beforeEach } from 'vitest';
import { BinaryHeap } from '../../src/core/BinaryHeap';

describe('BinaryHeap', () => {
    let heap: BinaryHeap<number>;

    beforeEach(() => {
        heap = new BinaryHeap<number>((a, b) => a - b);
    });

    // =========================================================================
    // Basic Operations
    // =========================================================================

    describe('basic operations', () => {
        it('should start empty', () => {
            expect(heap.isEmpty).toBe(true);
            expect(heap.size).toBe(0);
        });

        it('should push and pop single element', () => {
            heap.push(5);
            expect(heap.isEmpty).toBe(false);
            expect(heap.size).toBe(1);
            expect(heap.pop()).toBe(5);
            expect(heap.isEmpty).toBe(true);
        });

        it('should return undefined when popping empty heap', () => {
            expect(heap.pop()).toBeUndefined();
        });

        it('should peek without removing', () => {
            heap.push(5);
            expect(heap.peek()).toBe(5);
            expect(heap.size).toBe(1);
        });

        it('should return undefined when peeking empty heap', () => {
            expect(heap.peek()).toBeUndefined();
        });
    });

    // =========================================================================
    // Min-Heap Property
    // =========================================================================

    describe('min-heap property', () => {
        it('should always pop minimum element', () => {
            heap.push(5);
            heap.push(3);
            heap.push(7);
            heap.push(1);
            heap.push(9);

            expect(heap.pop()).toBe(1);
            expect(heap.pop()).toBe(3);
            expect(heap.pop()).toBe(5);
            expect(heap.pop()).toBe(7);
            expect(heap.pop()).toBe(9);
        });

        it('should handle duplicate values', () => {
            heap.push(3);
            heap.push(3);
            heap.push(3);

            expect(heap.pop()).toBe(3);
            expect(heap.pop()).toBe(3);
            expect(heap.pop()).toBe(3);
            expect(heap.isEmpty).toBe(true);
        });

        it('should handle already sorted input', () => {
            heap.push(1);
            heap.push(2);
            heap.push(3);
            heap.push(4);
            heap.push(5);

            expect(heap.pop()).toBe(1);
            expect(heap.pop()).toBe(2);
            expect(heap.pop()).toBe(3);
            expect(heap.pop()).toBe(4);
            expect(heap.pop()).toBe(5);
        });

        it('should handle reverse sorted input', () => {
            heap.push(5);
            heap.push(4);
            heap.push(3);
            heap.push(2);
            heap.push(1);

            expect(heap.pop()).toBe(1);
            expect(heap.pop()).toBe(2);
            expect(heap.pop()).toBe(3);
            expect(heap.pop()).toBe(4);
            expect(heap.pop()).toBe(5);
        });
    });

    // =========================================================================
    // Update Operation
    // =========================================================================

    describe('update operation', () => {
        it('should update element position after value change', () => {
            interface Item { value: number }
            const itemHeap = new BinaryHeap<Item>((a, b) => a.value - b.value);

            const item1 = { value: 5 };
            const item2 = { value: 3 };
            const item3 = { value: 7 };

            itemHeap.push(item1);
            itemHeap.push(item2);
            itemHeap.push(item3);

            // Change item1 to be smallest
            item1.value = 1;
            itemHeap.update(item1);

            expect(itemHeap.pop()).toBe(item1);
            expect(itemHeap.pop()).toBe(item2);
            expect(itemHeap.pop()).toBe(item3);
        });

        it('should handle update of non-existent element gracefully', () => {
            heap.push(1);
            heap.push(2);
            heap.update(999); // Should not throw
            expect(heap.size).toBe(2);
        });
    });

    // =========================================================================
    // Contains Operation
    // =========================================================================

    describe('contains operation', () => {
        it('should check if element exists', () => {
            heap.push(1);
            heap.push(2);
            heap.push(3);

            expect(heap.contains(2)).toBe(true);
            expect(heap.contains(5)).toBe(false);
        });

        it('should return false for empty heap', () => {
            expect(heap.contains(1)).toBe(false);
        });
    });

    // =========================================================================
    // Clear Operation
    // =========================================================================

    describe('clear operation', () => {
        it('should clear all elements', () => {
            heap.push(1);
            heap.push(2);
            heap.push(3);

            heap.clear();

            expect(heap.isEmpty).toBe(true);
            expect(heap.size).toBe(0);
        });
    });

    // =========================================================================
    // Custom Comparator
    // =========================================================================

    describe('custom comparator', () => {
        it('should work as max-heap with reversed comparator', () => {
            const maxHeap = new BinaryHeap<number>((a, b) => b - a);

            maxHeap.push(5);
            maxHeap.push(3);
            maxHeap.push(7);
            maxHeap.push(1);
            maxHeap.push(9);

            expect(maxHeap.pop()).toBe(9);
            expect(maxHeap.pop()).toBe(7);
            expect(maxHeap.pop()).toBe(5);
            expect(maxHeap.pop()).toBe(3);
            expect(maxHeap.pop()).toBe(1);
        });

        it('should work with object comparator', () => {
            interface Task { priority: number; name: string }
            const taskHeap = new BinaryHeap<Task>((a, b) => a.priority - b.priority);

            taskHeap.push({ priority: 3, name: 'C' });
            taskHeap.push({ priority: 1, name: 'A' });
            taskHeap.push({ priority: 2, name: 'B' });

            expect(taskHeap.pop()?.name).toBe('A');
            expect(taskHeap.pop()?.name).toBe('B');
            expect(taskHeap.pop()?.name).toBe('C');
        });
    });

    // =========================================================================
    // Large Dataset
    // =========================================================================

    describe('large dataset', () => {
        it('should handle 1000 random elements', () => {
            const elements: number[] = [];
            for (let i = 0; i < 1000; i++) {
                const value = Math.floor(Math.random() * 10000);
                elements.push(value);
                heap.push(value);
            }

            elements.sort((a, b) => a - b);

            for (const expected of elements) {
                expect(heap.pop()).toBe(expected);
            }
        });
    });
});
