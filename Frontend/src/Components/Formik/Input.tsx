import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Input as InputField, Space } from "antd";
import React, { memo, useState } from "react";
import useDebounceEffect from "../../Hooks/useDebounceEffect";
import AltInput from "../AltInput";
import { arabicRegex, InputValueType, TInput } from "./types";

const Input = ({
  onChange,
  onChangeAlt,
  onBlur,
  label,
  prefix,
  suffix,
  type,
  error,
  required,
  value,
  delay,
  hideLabel,
  altValue,
  altInput,
  ...props
}: TInput & typeof defaultProps) => {
  const [showText, setShowText] = useState(false);
  const [val, setValue] = useDebounceEffect(
    (v: InputValueType) => onChange?.(props.name, v),
    value,
    delay
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!props.disabled && onChange) {
      if (type === "number") {
        setValue(
          e.target.value
            ? !Number.isNaN(parseFloat(e.target.value))
              ? parseFloat(e.target.value)
              : val
            : ""
        );
      } else {
        setValue(e.target.value);
      }
    }
  };

  const renderSuffix = () => {
    if (type === "password" || suffix) {
      return (
        <Space>
          {type === "password" ? (
            showText ? (
              <EyeTwoTone onClick={() => setShowText(false)} />
            ) : (
              <EyeInvisibleOutlined onClick={() => setShowText(true)} />
            )
          ) : null}
          {suffix}
        </Space>
      );
    }

    return null;
  };

  return (
    <div className="custom-input-box">
      {label && !hideLabel && (
        <label style={{ textAlign: "left", width: "fit-content" }}>
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      {altInput && (
        <AltInput
          {...props}
          {...{ label, altValue, altInput, onChange: onChangeAlt }}
        />
      )}

      <InputField
        type={
          type === "password"
            ? showText
              ? "text"
              : "password"
            : type || "text"
        }
        prefix={
          prefix ? (
            typeof prefix === "string" ? (
              <i className={prefix} />
            ) : (
              prefix
            )
          ) : null
        }
        suffix={renderSuffix()}
        onChange={handleChange}
        onBlur={() => onBlur?.(props.name, val)}
        value={val}
        dir={arabicRegex.test(val?.toString()) ? "rtl" : "ltr"}
        {...props}
      />

      {error && (
        <div style={{ fontSize: 10, color: "red", textAlign: "right" }}>
          {error.replace(props.name, label || props.placeholder || "")}
        </div>
      )}
    </div>
  );
};

const defaultProps = {
  type: "text",
  delay: 500,
};

Input.defaultProps = defaultProps;

export default memo(Input);
