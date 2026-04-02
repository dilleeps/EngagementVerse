import loadable from "@loadable/component";
import {
  FastField as FormikFastField,
  Field as FormikField,
  FormikState,
  FormikValues,
  getIn,
  useFormikContext,
} from "formik";
import { memo } from "react";
import AltInput from "../AltInput";
import {
  AltInputTypes,
  TAutoComplete,
  TCheckbox,
  TDatePicker,
  TDateRangePicker,
  TInput,
  TInputChip,
  TRadioGroup,
  TRichText,
  TSelect,
  TTextArea,
} from "./types";

const AutoComplete = loadable(
  () => import(/* webpackPrefetch: true */ "./AutoComplete")
);
const Checkbox = loadable(
  () => import(/* webpackPrefetch: true */ "./Checkbox")
);
const DatePicker = loadable(
  () => import(/* webpackPrefetch: true */ "./DatePicker")
);
const DateRangePicker = loadable(
  () => import(/* webpackPrefetch: true */ "./DateRangePicker")
);
const Input = loadable(() => import(/* webpackPrefetch: true */ "./Input"));
const InputChip = loadable(
  () => import(/* webpackPrefetch: true */ "./InputChip")
);
const PagedSelect = loadable(
  () => import(/* webpackPrefetch: true */ "./PagedSelect")
);
const RadioGroup = loadable(
  () => import(/* webpackPrefetch: true */ "./RadioGroup")
);
const Select = loadable(() => import(/* webpackPrefetch: true */ "./Select"));
const TextArea = loadable(
  () => import(/* webpackPrefetch: true */ "./TextArea")
);

type TFieldAs =
  | ({
      as: "auto-complete";
    } & TAutoComplete)
  | ({
      as: "checkbox";
    } & TCheckbox)
  | ({
      as: "radio-group";
    } & TRadioGroup)
  | ({
      as: "date";
    } & TDatePicker)
  | ({
      as: "date-range";
    } & TDateRangePicker)
  | ({
      as: "textarea";
    } & TTextArea)
  | ({
      as: "select";
    } & TSelect)
  | ({
      as: "paged-select";
    } & TSelect)
  | ({
      as: "input-chip";
    } & TInputChip)
  | ({
      as: "rich-text";
    } & Partial<TRichText>)
  | ({
      as?: "input";
    } & Partial<TInput>)
  | ({
      as?: "input-alt";
    } & AltInputTypes);

type TField = {
  name: string;
  fast?: boolean;
} & TFieldAs;

function Field({ name, fast, as = "input", ...props }: TField) {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<FormikState<FormikValues>>();

  let Component;

  if (fast) {
    Component = FormikFastField;
  } else {
    Component = FormikField;
  }

  return (
    <Component
      as={(() => {
        switch (as) {
          case "auto-complete":
            return AutoComplete;
          case "textarea":
            return TextArea;
          case "select":
            return Select;
          case "paged-select":
            return PagedSelect;
          case "input-alt":
            return AltInput;
          case "checkbox":
            return Checkbox;
          case "radio-group":
            return RadioGroup;
          case "date":
            return DatePicker;
          case "date-range":
            return DateRangePicker;
          case "input-chip":
            return InputChip;
          // case 'rich-text':
          //   return RichText
          default:
            return Input;
        }
      })()}
      name={name}
      error={getIn(touched, name) && getIn(errors, name)}
      value={getIn(values, name)}
      onChange={setFieldValue}
      onChangeAlt={setFieldValue}
      required={Boolean(getIn(errors, name))}
      {...([
        "input-alt",
        "auto-complete",
        "textarea",
        "input",
        "select",
        "date",
      ].includes(as) && {
        altValue: getIn(values, `${name}Alt`),
      })}
      {...props}
    />
  );
}

export default memo(Field);
