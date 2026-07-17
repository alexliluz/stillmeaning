import { CheckIcon, LayersIcon, UploadIcon } from "../icons";
import type { ExampleId, MotionExample } from "../../domain/examples";

interface ExampleListProps {
  examples: readonly MotionExample[];
  selectedId: ExampleId;
  onSelect: (id: ExampleId) => void;
}

const icons = {
  "progress-upload": UploadIcon,
  "success-save": CheckIcon,
  "hierarchy-panel": LayersIcon,
} satisfies Record<ExampleId, typeof UploadIcon>;

export function ExampleList({ examples, selectedId, onSelect }: ExampleListProps) {
  return (
    <nav aria-label="Motion examples" className="example-rail">
      <div className="example-rail__eyebrow">Curated examples</div>
      <div className="example-rail__list">
        {examples.map((example, index) => {
          const Icon = icons[example.id];
          const selected = example.id === selectedId;
          return (
            <button
              aria-pressed={selected}
              className="example-card"
              data-selected={selected}
              key={example.id}
              onClick={() => onSelect(example.id)}
              type="button"
            >
              <span className="example-card__index">0{index + 1}</span>
              <Icon className="example-card__icon" />
              <span className="example-card__copy">
                <strong>{example.title}</strong>
                <span>{example.category}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="example-rail__note">
        Hand-authored fixtures keep the demo stable. GPT-5.6 analysis is labeled separately.
      </p>
    </nav>
  );
}
