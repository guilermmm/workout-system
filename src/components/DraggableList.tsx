// create a draggable list component, which is a list of draggable items that can be reordered by dragging and dropping them into different positions

import React, { useRef } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

type Props<T, K extends keyof T> = {
  className?: string;
  items: T[];
  setItems: (items: T[]) => void;
  itemToKey: (item: T) => string;
  children: (item: T, DragHandle: React.FC<{ children: React.ReactNode }>) => React.ReactNode;
};

const DraggableList = <T, K extends keyof T>(props: Props<T, K>) => {
  const { className, items, setItems, itemToKey, children } = props;

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className={className} ref={ref}>
      <DragDropContext
        onDragEnd={(...props) => {
          console.log(props);
        }}
      >
        <h1>The List</h1>
        <Droppable droppableId="droppable-1">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {items.map((item, index) => (
                <Draggable
                  key={itemToKey(item)}
                  draggableId={`draggable-${itemToKey(item)}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      {children(item, ({ children }) => (
                        <div {...provided.dragHandleProps}>{children}</div>
                      ))}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DraggableList;
