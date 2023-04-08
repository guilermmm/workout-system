import type { Active, DraggableSyntheticListeners, UniqueIdentifier } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Fragment, createContext, useContext, useEffect, useMemo, useState } from "react";

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  className?: string;
  items: T[];
  onChange: (items: T[]) => void;
  children: (item: T, animating: boolean) => React.ReactNode;
}

function SortableList<T extends BaseItem>(props: Props<T>) {
  const { className, items, onChange, children: render } = props;

  const [active, setActive] = useState<Active | null>(null);
  const [animating, setAnimating] = useState(false);
  const activeItem = useMemo(() => items.find(item => item.id === active?.id), [active, items]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    if (active) {
      setAnimating(true);
    } else {
      timeout = setTimeout(() => setAnimating(false), 250);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [active]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActive(active)}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onChange(arrayMove(items, activeIndex, overIndex));
        }
        setActive(null);
      }}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <SortableContext items={items}>
        <div className={className} role="application">
          {items.map(item => (
            <Fragment key={item.id}>{render(item, !!active || animating)}</Fragment>
          ))}
        </div>
      </SortableContext>
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
        }}
      >
        {activeItem ? render(activeItem, !!active || animating) : null}
      </DragOverlay>
    </DndContext>
  );
}

type Context = {
  attributes: React.ButtonHTMLAttributes<HTMLButtonElement>;
  listeners: DraggableSyntheticListeners;
  ref: (node: HTMLElement | null) => void;
};

const SortableItemContext = createContext({} as Context);

type SortableItemProps = {
  className?: string;
  id: UniqueIdentifier;
  children: React.ReactNode;
};

function SortableItem({ className, id, children }: SortableItemProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const context = useMemo(
    () => ({ attributes, listeners, ref: setActivatorNodeRef }),
    [attributes, listeners, setActivatorNodeRef],
  );

  return (
    <SortableItemContext.Provider value={context}>
      <div
        className={className}
        ref={setNodeRef}
        style={{
          opacity: isDragging ? 0.4 : undefined,
          transform: CSS.Translate.toString(transform),
          transition,
        }}
      >
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}

function DragHandle({ className, children }: { className?: string; children: React.ReactNode }) {
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  return (
    <button className={className} {...attributes} {...listeners} ref={ref}>
      {children}
    </button>
  );
}

const Sortable = {
  List: SortableList,
  Item: SortableItem,
  DragHandle,
};

export default Sortable;
