import React, { createContext, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { classList } from "../utils";

type ModalComponent = React.FC<{
  className?: string;
  onClickOutside?: React.MouseEventHandler;
  children: React.ReactNode;
}>;

type ModalContext = [ModalComponent, ModalComponent];

const modalContext = createContext<ModalContext>(null as unknown as ModalContext);

const createShowModal: (ref: HTMLDivElement) => ModalComponent =
  ref =>
  ({ className = "", onClickOutside, children }) => {
    return ref
      ? createPortal(
          <div
            className={classList(
              "absolute inset-0 flex flex-col items-center justify-center",
              className,
            )}
            onClick={e => {
              if (e.target === e.currentTarget) {
                onClickOutside?.(e);
              }

              e.stopPropagation();
            }}
          >
            {children}
          </div>,
          ref,
        )
      : null;
  };

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [primary, setPrimary] = useState<HTMLDivElement | null>(null);
  const [secondary, setSecondary] = useState<HTMLDivElement | null>(null);

  const ShowPrimaryModal = useMemo(
    () => (primary ? createShowModal(primary) : () => null),
    [primary],
  );

  const ShowSecondaryModal = useMemo(
    () => (secondary ? createShowModal(secondary) : () => null),
    [secondary],
  );

  return (
    <modalContext.Provider value={[ShowPrimaryModal, ShowSecondaryModal]}>
      {children}
      <div ref={setSecondary}>
        <div ref={setPrimary} />
      </div>
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
