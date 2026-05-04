export type FieldType = "short_text" | "long_text" | "number" | "select";

export type FieldWidth = 3 | 4 | 6 | 12;

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  width: FieldWidth;
};

export type Group = {
  id: string;
  name: string;
  fields: FormField[];
};

export type Template = {
  id: string;
  name: string;
  groups: Group[];
};
