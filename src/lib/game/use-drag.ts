"use client";

import {
  useState,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from "react";

interface DragState {
  index: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  pointerId: number;
  originLeft: number;
  originTop: number;
  width: number;
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
  const dragStateRef = useRef<DragState | null>(null);

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
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();

      const nextState: DragState = {
        index,
        startX: e.clientX,
        startY: e.clientY,
        dx: 0,
        dy: 0,
        pointerId: e.pointerId,
        originLeft: rect.left,
        originTop: rect.top,
        width: rect.width,
      };

      dragStateRef.current = nextState;
      setDragState(nextState);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const activeDrag = dragStateRef.current;
      if (!activeDrag || activeDrag.pointerId !== e.pointerId) return;

      const nextState: DragState = {
        ...activeDrag,
        dx: e.clientX - activeDrag.startX,
        dy: e.clientY - activeDrag.startY,
      };

      dragStateRef.current = nextState;
      setDragState(nextState);
    },
    []
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      const activeDrag = dragStateRef.current;
      if (!activeDrag || activeDrag.pointerId !== e.pointerId) return;

      const zoneId = findDropZone(e.clientX, e.clientY);
      if (zoneId && config.onDropInZone) {
        const item = config.items[activeDrag.index];
        if (item) {
          config.onDropInZone(item, activeDrag.index, zoneId);
        }
      }

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      dragStateRef.current = null;
      setDragState(null);
    },
    [config, findDropZone]
  );

  const onPointerCancel = useCallback((e: ReactPointerEvent) => {
    const activeDrag = dragStateRef.current;
    if (!activeDrag || activeDrag.pointerId !== e.pointerId) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    dragStateRef.current = null;
    setDragState(null);
  }, []);

  const getDragStyle = useCallback(
    (index: number): CSSProperties => {
      if (!dragState || dragState.index !== index) return {};
      return {
        position: "fixed",
        left: dragState.originLeft + dragState.dx,
        top: dragState.originTop + dragState.dy,
        width: dragState.width,
        transform: "scale(1.08)",
        zIndex: 2000,
        opacity: 0.96,
        transition: "none",
        cursor: "grabbing",
        pointerEvents: "none",
      };
    },
    [dragState]
  );

  const getDragHandlers = useCallback(
    (index: number) => ({
      onPointerDown: onPointerDown(index),
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      style: {
        ...getDragStyle(index),
        touchAction: "none" as const,
        cursor: dragState?.index === index ? "grabbing" : "grab",
      },
    }),
    [onPointerCancel, onPointerDown, onPointerMove, onPointerUp, getDragStyle, dragState]
  );

  return {
    draggingIndex: dragState?.index ?? null,
    getDragHandlers,
    registerDropZone,
    isDragging: dragState !== null,
  };
}
