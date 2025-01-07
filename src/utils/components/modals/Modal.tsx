// <!-- Button trigger modal -->
// <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModalLong">
//   Launch demo modal
// </button>

import { useState } from "react";

export interface IGeneralModalProps<AT, DT> {
  modalTitle?: string;
  modalBody: string;
  actionButtonText?: string;
  deActionButtonText?: string;
  action: (arg: AT) => Promise<boolean>;
  deAction?: (arg: DT) => Promise<boolean>;
  actionParam: AT;
  deActionParam?: DT;
}

export const GeneralModal = <AT, DT>(prop: IGeneralModalProps<AT, DT>) => {
  const [modalToggle, setModalToggle] = useState(false);

  const callActionOrDeAction = async (action: boolean) => {
    const actionResult =
      !action && prop.deAction && prop.deActionParam
        ? await prop.deAction(prop.deActionParam)
        : await prop.action(prop.actionParam);
    actionResult ? setModalToggle(true) : setModalToggle(false);
  };

  return (
    <div>
      {modalToggle && (
        <div
          className="modal fade"
          id="exampleModalLong"
          role="dialog"
          aria-labelledby="exampleModalLongTitle"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  {prop.modalTitle ?? ""}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">{prop.modalBody ?? ""}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={() => setModalToggle(true)}
                >
                  {prop.deActionButtonText}
                </button>
                {prop.deAction && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => callActionOrDeAction(false)}
                  >
                    {prop.actionButtonText}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => callActionOrDeAction(true)}
                >
                  {prop.actionButtonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
