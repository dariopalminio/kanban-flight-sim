import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { HighlightMode, Status, Workitem } from "../domain/types";
import { Card } from "./Card";

const DONE_COLUMN_SCROLL_THRESHOLD = 5;
const CARD_HEIGHT_PX = 18;

type Props = {
  status: Status;
  items: Workitem[];
  highlightMode: HighlightMode;
  currentTick: number;
  onWipLimitChange: (statusId: string, value: number) => void;
};

const getBg = (status: Status, mode: HighlightMode): string => {
  if (mode === "stream") {
    return status.streamType === "UPSTREAM" ? "var(--bd-orange)" : "var(--bd-cyan)";
  }
  if (mode === "category") {
    if (status.statusCategory === "TODO") return "var(--bd-blue-deep)";
    if (status.statusCategory === "IN_PROGRESS") return "var(--bd-blue)";
    return "var(--bd-cyan-dark)";
  }
  if (mode === "commitment" && status.isBeforeCommitmentPoint) return "var(--bd-orange-go)";
  if (mode === "delivery" && status.isPosDeliveryPoint) return "var(--bd-cyan-dark)";
  return "var(--bd-blue-primary)";
};

const getBorder = (status: Status, mode: HighlightMode): string => {
  if (mode === "delivery" && status.isPosDeliveryPoint) return "1px solid var(--bd-cyan-bright)";
  return "1px solid rgba(255, 255, 255, 0.45)";
};

export function Column({ status, items, highlightMode, currentTick, onWipLimitChange }: Props) {
  const sortedItems = [...items].sort((a, b) => a.enteredAt - b.enteredAt);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const dodButtonRef = useRef<HTMLButtonElement>(null);
  const dodPopoverRef = useRef<HTMLDivElement>(null);
  const [dodOpen, setDodOpen] = useState(false);
  const [dodPosition, setDodPosition] = useState<{ top: number; left: number } | null>(null);
  const [draftWipLimit, setDraftWipLimit] = useState(status.wipLimit?.toString() ?? "");

  useEffect(() => {
    setDraftWipLimit(status.wipLimit?.toString() ?? "");
  }, [status.wipLimit]);

  useEffect(() => {
    if (status.statusCategory === "DONE" && sortedItems.length > DONE_COLUMN_SCROLL_THRESHOLD && cardsContainerRef.current) {
      cardsContainerRef.current.scrollTop = cardsContainerRef.current.scrollHeight;
    }
  }, [sortedItems.length, status.statusCategory]);

  useEffect(() => {
    if (!dodOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dodPopoverRef.current && !dodPopoverRef.current.contains(e.target as Node) &&
        dodButtonRef.current && !dodButtonRef.current.contains(e.target as Node)
      ) {
        setDodOpen(false);
        setDodPosition(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dodOpen]);

  const commitWipLimit = () => {
    const parsed = parseInt(draftWipLimit, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      onWipLimitChange(status.id, parsed);
    } else {
      setDraftWipLimit(status.wipLimit?.toString() ?? "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setDraftWipLimit(status.wipLimit?.toString() ?? "");
      e.currentTarget.blur();
    }
  };

  return (
    <div className="kanban-column" style={{ border: getBorder(status, highlightMode) }}>
      <div
        className="column-header"
        title={status.description || undefined}
        style={{
          background: getBg(status, highlightMode),
          textDecoration: status.isBeforeCommitmentPoint ? "underline" : "none",
          borderTop: status.isBuffer ? "2px solid var(--bd-cyan-easy)" : undefined,
        }}
      >
        <div className="column-title">
        {status.wipLimit != null ? (
          <>
            {status.name}{" "}[ w: {items.length}/ l:{" "}
            <input
              className="wip-input"
              type="number"
              min={1}
              value={draftWipLimit}
              onChange={(e) => setDraftWipLimit(e.target.value)}
              onBlur={commitWipLimit}
              onKeyDown={handleKeyDown}
            />]
          </>
        ) : (
          <>{status.name} [c: {items.length}]</>
        )}
        {status.isBuffer && <span className="buffer-mark">✓</span>}
        {status.definitionOfDone && (
          <button
            ref={dodButtonRef}
            className="dod-button"
            onClick={() => {
              if (dodOpen) {
                setDodOpen(false);
                setDodPosition(null);
              } else {
                const rect = dodButtonRef.current?.getBoundingClientRect();
                if (rect) setDodPosition({ top: rect.bottom + 4, left: rect.left });
                setDodOpen(true);
              }
            }}
          >DoD</button>
        )}
        </div>
      </div>
      {dodOpen && status.definitionOfDone && dodPosition && createPortal(
        <div
          ref={dodPopoverRef}
          className="dod-popover"
          style={{ top: dodPosition.top, left: dodPosition.left }}
        >
          {status.definitionOfDone}
        </div>,
        document.body
      )}
      <div
        className="column-body"
        ref={cardsContainerRef}
        style={{
          overflowY: status.statusCategory === "DONE" && sortedItems.length > DONE_COLUMN_SCROLL_THRESHOLD ? "auto" : undefined,
          maxHeight: status.statusCategory === "DONE" && sortedItems.length > DONE_COLUMN_SCROLL_THRESHOLD ? DONE_COLUMN_SCROLL_THRESHOLD * CARD_HEIGHT_PX : undefined,
        }}
      >
        {sortedItems.map((item) => (
          <Card key={item.id} item={item} isBuffer={status.isBuffer} currentTick={currentTick} />
        ))}
      </div>
    </div>
  );
}
