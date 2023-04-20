import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { classList } from "../utils";

type DialogContext = [boolean, React.FC<{ className?: string; children: React.ReactNode }>];

const modalContext = createContext<DialogContext>([false, {}] as unknown as DialogContext);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setOpen] = useState(false);
  const [additionalClasses, setAdditionalClasses] = useState<string>();
  const modalContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNodeInserted = (event: Event) => {
      if ((event.target as Node).parentNode === modalContainerRef.current) {
        setOpen(true);
      }
    };

    const handleNodeRemoved = (event: Event) => {
      if ((event.target as Node).parentNode === modalContainerRef.current) {
        setOpen(false);
        if (modalContainerRef.current?.children.length === 0) {
          setAdditionalClasses(undefined);
        }
      }
    };

    document.addEventListener("DOMNodeInserted", handleNodeInserted);
    document.addEventListener("DOMNodeRemoved", handleNodeRemoved);

    return () => {
      document.removeEventListener("DOMNodeInserted", handleNodeInserted);
      document.removeEventListener("DOMNodeRemoved", handleNodeRemoved);
    };
  }, [isOpen]);

  const ShowModal = ({
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => {
    setAdditionalClasses(className);
    return modalContainerRef.current ? createPortal(children, modalContainerRef.current) : null;
  };

  return (
    <modalContext.Provider value={[isOpen, ShowModal]}>
      {children}
      <div
        className={classList(
          "absolute inset-0 flex flex-col items-center justify-center",
          additionalClasses ?? "",
          {
            hidden: !isOpen,
          },
        )}
        ref={modalContainerRef}
      />
      {!isOpen && modalContainerRef.current && createPortal(null, modalContainerRef.current)}
    </modalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(modalContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
