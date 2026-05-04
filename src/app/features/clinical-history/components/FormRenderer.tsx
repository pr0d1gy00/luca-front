import { FormSchema, Block } from "@/app/features/clinical-history/types/index";

type Props = {
  form: FormSchema;
  selectedBlock: Block | null;
  onSelectBlock: (block: Block) => void;
  onAddBlock: (sectionId: string, block: Block) => void;
};
export function FormRenderer({
  form,
  selectedBlock,
  onSelectBlock,
  onAddBlock,
}: Props) {
  return (
    <div>
      <h1>{form.title}</h1>

      {form.sections.map((section) => (
        <div key={section.id}>
          <h2>{section.title}</h2>
          <button
            onClick={() =>
              onAddBlock(section.id, {
                id: crypto.randomUUID(),
                type: "text",
                props: { label: "Nuevo campo" },
              })
            }
          >
            + Agregar campo
          </button>
          {section.blocks.map((block) => {
            const isSelected = selectedBlock?.id === block.id;

            const style = {
              border: isSelected ? "2px solid blue" : "1px solid #ccc",
              padding: "8px",
              marginBottom: "5px",
              cursor: "pointer",
            };

            const handleClick = () => {
              onSelectBlock(block);
            };

            switch (block.type) {
              case "text":
                return (
                  <div key={block.id} style={style} onClick={handleClick}>
                    <input placeholder={block.props.label as string} />
                  </div>
                );

              case "textarea":
                return (
                  <div key={block.id} style={style} onClick={handleClick}>
                    <textarea placeholder={block.props.label as string} />
                  </div>
                );

              case "date":
                return (
                  <div key={block.id} style={style} onClick={handleClick}>
                    <input type="date" />
                  </div>
                );

              default:
                return null;
            }
          })}
        </div>
      ))}
    </div>
  );
}
