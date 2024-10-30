import React, {
  ChangeEvent,
  DetailedHTMLProps,
  SetStateAction,
  TextareaHTMLAttributes,
} from "react";
import {
  DatePickerInput,
  IDatePickerInputProp,
} from "./DatePicker";
import {
  GeneralSelect,
  ISelectProp,
} from "./Select";
import {
  ITextInput,
  TextInput,
} from "./TextInput";
import { IMultipleFilesProps, MultipleFiles } from "../../file/components/MultipleFiles";
import { CustomTextArea } from "./CustomTextArea";

export interface IInputFieldWithPageNumber {
  inputType:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "date"
    | "textarea"
    | "select"
    | "file";
  pageNumber: number;
  inputName?: string;
  inputProp:
    | ISelectProp
    | IDatePickerInputProp
    | ITextInput
    | DetailedHTMLProps<
        TextareaHTMLAttributes<HTMLTextAreaElement>,
        HTMLTextAreaElement
      >
    | IMultipleFilesProps;
    validate?: () => string | null;
}

export interface ICreateStagePageProp {
  inputFields: IInputFieldWithPageNumber[];
  message?: string;
  pageLayoutColumns: number;
  pageMessage: {[key: string]: string}
  pageNumber: number;
}

export const FormDisplay = (prop: ICreateStagePageProp) => {
  return (
    <div className="row">
      <div className="row">
        <div className="col-12">
          <div className="d-6 text-center">{prop.pageMessage[`${prop.pageNumber}`]}</div>
        </div>
      </div>
      <div className="row">
        {prop.inputFields.map((field) => (
          <div className={`col-sm-${12/prop.pageLayoutColumns}`}>
            {field.inputType === "select" && (
              <GeneralSelect {...(field.inputProp as ISelectProp)} />
            )}
            {field.inputType === "date" && (
              <DatePickerInput {...(field.inputProp as IDatePickerInputProp)} />
            )}
            {field.inputType === "file" && (
              <MultipleFiles {...(field.inputProp as IMultipleFilesProps)} />
            )}
            
            {field.inputType === "textarea" && (
              <CustomTextArea {...(field.inputProp as DetailedHTMLProps<
                TextareaHTMLAttributes<HTMLTextAreaElement>,
                HTMLTextAreaElement
              >)} />
            )}

            {field.inputType !== "date" && field.inputType !== "select" && field.inputType !== "file"  && field.inputType !== "textarea" && (
              <TextInput {...(field.inputProp as ITextInput)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
