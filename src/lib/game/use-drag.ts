"use client";

import { useState, useRef, useCallback, type PointerEvent as ReactPointerEvent, type CSSProperties } from "react";

interface DragState {
  index: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

export interface DropZone {
  id: string;
  ref: HTMLElement | null;
}

/**
 * Pointer-event based drag-and-drop for mobile + desktop.
 * Returns handlers to attach to draggable items and drop zone registration.
 */
export function useDrag<T>(config: {
  items: T[];
  onDropInZone?: (item: T, itemIndex: number, zoneId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const zonesRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerDropZone = useCallback((zoneId: string) => {
    return (el: HTMLElement | null) => {
      if (el) {
        zonesRef.current.set(zoneId, el);
      } else {
        zonesRef.current.delete(zoneId);
      }
    };
  }, []);

  const findDropZone = useCallback((clientX: number, clientY: number): string | null => {
    for (const [id, el] of zonesRef.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return id;
      }
    }
    return null;
  }, []);

  const onPointerDown = useCallback(
    (index: number) => (e: ReactPointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragState({
        index,
        startX: e.clientX,
        startY: e.clientY,
        dx: 0,
        dy: 0,
      });
    },
    []
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragState) return;
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              dx: e.clientX - prev.startX,
              dy: e.clientY - prev.startY,
            }
          : null
      );
    },
    [dragState]
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragState) return;
      const zoneId = findDropZone(e.clientX, e.clientY);
      if (zoneId && config.onDropInZone) {
        config.onDropInZone(config.items[dragState.index], dragState.index, zoneId);
      }
      setDragState(null);
    },
    [dragState, findDropZone, config]
  );

  const getDragStyle = useCallback(
    (index: number): CSSProperties => {
      if (!dragState || dragState.index !== index) return {};
      return {
        transform: `translate(${dragState.dx}px, ${dragState.dy}px) scale(1.08)`,
        zIndex: 50,
        opacity: 0.9,
        transition: "none",
        cursor: "grabbing",
      };
    },
    [dragState]
  );

  const getDragHandlers = useCallback(
    (index: number) => ({
      onPointerDown: onPointerDown(index),
      onPointerMove,
      onPointerUp,
      style: {
        ...getDragStyle(index),
        touchAction: "none" as const,
        cursor: dragState?.index === index ? "grabbing" : "grab",
      },
    }),
    [onPointerDown, onPointerMove, onPointerUp, getDragStyle, dragState]
  );

  return {
    draggingIndex: dragState?.index ?? null,
    getDragHandlers,
    registerDropZone,
    isDragging: dragState !== null,
  };
}
