import { Template } from "../types";

export const mockTemplate: Template = {
  id: "1",
  name: "Historia Clínica",
  groups: [
    {
      id: "g1",
      name: "Datos",
      fields: [
        {
          id: "f1",
          type: "short_text",
          label: "Nombre",
          required: true,
          width: 6,
        },
        {
          id: "f2",
          type: "number",
          label: "Edad",
          required: false,
          width: 6,
        },
      ],
    },
  ],
};
