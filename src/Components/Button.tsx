import AntdButton, {
  ButtonHTMLType,
  ButtonProps,
  ButtonType,
  ButtonVariantType,
} from "antd/lib/button";
import clsx from "clsx";

export type TButton = {
  type?: ButtonHTMLType;
  variant?: ButtonVariantType;
  success?: boolean;
  label?: string;
} & Omit<ButtonProps, "type" | "htmlType">;

export default function Button({
  type = "button",
  variant = "primary",
  className,
  success,
  ...props
}: TButton) {
  return (
    <AntdButton
      className={clsx(className, success && "ant-btn-success")}
      htmlType={type}
      type={variant as ButtonType}
      {...props}
    >
      {props.label || props.children}
    </AntdButton>
  );
}
