import { useState } from "react";
import type { CreatableModuleType } from "../../types/trip.ts";

interface ToolBarProps {
  onAdd: (type: CreatableModuleType) => Promise<void>;
  onOpenSettings: () => void;
  isCreating?: boolean;
}

const PANEL_OPTIONS: { type: CreatableModuleType; label: string; icon: string }[] = [
  { type: "grocery", label: "Add Grocery List", icon: "🛒" },
  { type: "personal", label: "Add Personal List", icon: "💼" },
  { type: "note", label: "Add Note", icon: "📝" },
];

export default function ToolBar({
  onAdd,
  onOpenSettings,
  isCreating = false,
}: ToolBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`toolbar ${isExpanded ? "is-expanded" : ""}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      aria-label="Board tools"
    >
      <button
        type="button"
        className="toolbar-trigger"
        aria-label="Open tools"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((value) => !value)}
      >
        <span className="toolbar-trigger-icon" aria-hidden="true">
          +
        </span>
        <span className="toolbar-trigger-label">Tools</span>
      </button>

      <div className="toolbar-menu">
        <button
          type="button"
          className="toolbar-action toolbar-action--settings"
          onClick={onOpenSettings}
        >
          <span className="toolbar-action-icon" aria-hidden="true">
            ⚙️
          </span>
          <span className="toolbar-action-label">Trip Settings</span>
        </button>

        {PANEL_OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            className="toolbar-action"
            disabled={isCreating}
            onClick={() => {
              onAdd(option.type);
              setIsExpanded(false);
            }}
          >
            <span className="toolbar-action-icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="toolbar-action-label">{option.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
