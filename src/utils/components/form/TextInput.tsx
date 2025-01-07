import React, { InputHTMLAttributes, useState } from "react";
import { camelCaseNameFormatter } from "../../utils/camelCaseNameFormatter";

export interface ITextInput extends InputHTMLAttributes<string>{
    inputLabel: string;
    inputName: string;
    inputType?: "text" | "password" | "email" | "tel" | "number" | "file" | "hidden";
    handleChange: Function;
    cssClass: string;
    placeHolder?: string;
    required?: boolean
    inputValue?: string; 
}

export function TextInput(prop: ITextInput){
    const [passwordInputType, setPasswordInputType] = useState("password");
    const togglePasswordInputType = () => {
        passwordInputType === "password" ? setPasswordInputType("text") : setPasswordInputType("password")
    }
    let inputType = prop.inputType && /phone/i.test(prop.inputType) ? "tel": prop.inputName
    return (

            <div className="form-group">
            <label htmlFor={prop.inputName}>{camelCaseNameFormatter(prop.inputLabel)}</label>
            <input className={`form-control ${prop.cssClass}`} id={prop.inputName}
              type={inputType === "password" ? passwordInputType: inputType}
              name={prop.inputName}
              placeholder={prop.placeHolder ?  camelCaseNameFormatter(prop.placeHolder) : ""}
              onChange={(e) => prop.handleChange(e)}
              required={prop.required ? true : false}
              disabled={prop.disabled ? true : false}
              value={prop.value}
              
            />
          {prop.inputType === "password"  && (<h6 onClick={togglePasswordInputType}>show / hide password</h6>)}
          </div>
    )
}