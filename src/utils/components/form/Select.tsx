import Select from "react-select";
import makeAnimated from "react-select/animated";

export interface ISelectOption { value: string; label: string; }
export interface ISelectProp {
  selectOptions: ISelectOption[];
  handleChange: (newValue: ISelectOption | ISelectOption[]) => void;
  isMulti: boolean;
  value?: ISelectOption[];
  label?: string;
  uniqueId?: string;
}
const animatedComponents = makeAnimated();

export function GeneralSelect(prop: ISelectProp) {
  const valueOption = prop.value ? {value: prop.value} : {};
  return (
    <div>
      <label htmlFor="">{prop.label ?? ""}</label>
      <Select
      id={prop.uniqueId ?? ""}
        closeMenuOnSelect={false}
        components={animatedComponents}
        //defaultValue={[prop.selectOptions[0] ?? "please select"]}
        isMulti={prop.isMulti}
        options={prop.selectOptions}
        onChange={(newValue) => prop.handleChange(newValue as ISelectOption | ISelectOption[])}
        tabSelectsValue={true}
        backspaceRemovesValue={true}
        {...valueOption}
      />
    </div>
  );
}
