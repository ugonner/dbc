import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface IDatePickerInputProp {
    handleChange: (date: Date) => void;
    selectedDate: Date,
    label: string;
    uniqueId: string;
}
export const DatePickerInput = (prop: IDatePickerInputProp) => {
  return (
    <div className="form-group">
        <label htmlFor={prop.uniqueId}>{prop.label}</label>
        <br/>
      <DatePicker id={prop.uniqueId} className="form-control w-100" selected={prop.selectedDate} onChange={prop.handleChange} />
    </div>
  );
}

