import { DetailedHTMLProps, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export const CustomTextArea = (prop: DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>) => {
    return (
        <div>
            <textarea {...prop}></textarea>
        </div>
    )
}