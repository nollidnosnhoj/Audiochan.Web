import { Checkbox, FormControl, FormLabel, Switch } from "@chakra-ui/react";
import React from "react";

interface InputCheckboxProps {
  name: string;
  value: boolean;
  onChange: () => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  toggleSwitch?: boolean;
}

const InputCheckbox: React.FC<InputCheckboxProps> = ({
  name,
  value,
  onChange,
  error,
  label,
  children,
  disabled = false,
  required = false,
  toggleSwitch = false,
}) => {
  return (
    <FormControl
      display="flex"
      alignItems="center"
      isInvalid={!!error}
      isRequired={required}
      paddingY={2}
    >
      {label && (
        <FormLabel htmlFor={name} mb="0">
          {label}
        </FormLabel>
      )}
      {toggleSwitch ? (
        <Switch
          id={name}
          name={name}
          disabled={disabled}
          defaultChecked={value}
          onChange={onChange}
        />
      ) : (
        <Checkbox
          id={name}
          name={name}
          disabled={disabled}
          checked={value}
          onChange={onChange}
        >
          {children}
        </Checkbox>
      )}
    </FormControl>
  );
};

export default InputCheckbox;
