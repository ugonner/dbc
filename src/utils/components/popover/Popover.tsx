import { ReactNode, useState } from "react";
import "./popover.css";
import { useModalContextStore } from "../../contexts/overlays/ModalContextProvider";

interface IPopoverButton {
  buttonText: string;
  handler: Function;
}

export interface IPopoverProps {
  buttons: IPopoverButton[];
  displayElement: ReactNode;
  ariaLabel: string;
  showPopoverId: string;
}

export const Popover = (prop: IPopoverProps) => {
  const {showPopoverId, setShowPopoverId} = useModalContextStore()
  const callHandler = (handler: Function) => {
    handler();
    setShowPopoverId("");
  };

  
  return (
    <div className="popover-top">
      <div className="popover-section row">
        {
        showPopoverId === prop.showPopoverId && (
          <div
            className="popover-container"
            aria-controlledBy="#popover-display-element"
          >
            <div className="popover-container">

            {prop.buttons.map((btn) => (
              <div
                className="w-100 mx-2 p-2"
                onClick={() => callHandler(btn.handler)}
                role="button"
              >
                {btn.buttonText}
              </div>
            ))}
            </div>
          </div>
        )}
        <div
          className="popover-display-element"
          onClick={() => setShowPopoverId(prop.showPopoverId)}
          aria-controls="#popover-container"
          role="button"
          aria-label={prop.ariaLabel ?? ""}
        >
          {prop.displayElement}
        </div>
      </div>
    </div>
  );
};
