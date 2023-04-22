import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { classList } from "../utils";

type ModalContext = React.FC<{ className?: string; children: React.ReactNode }>;

const modalContext = createContext<ModalContext>([false, {}] as unknown as ModalContext);

const createShowModal: (ref: HTMLDivElement) => ModalContext =
  ref =>
  ({ className = "", children }) => {
    return ref
      ? createPortal(
          <div
            className={classList(
              "absolute inset-0 flex flex-col items-center justify-center",
              className,
            )}
          >
            {children}
          </div>,
          ref,
        )
      : null;
  };

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  const ShowModal = useMemo(
    () => (modalContainerRef.current ? createShowModal(modalContainerRef.current) : () => null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted],
  );

  return (
    <modalContext.Provider value={ShowModal}>
      {children}
      <div
        ref={ref => {
          modalContainerRef.current = ref;
          setMounted(true);
        }}
      />
    </modalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(modalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
