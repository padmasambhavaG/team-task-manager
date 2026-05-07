import { ClipboardList } from "lucide-react";

export function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <ClipboardList size={32} />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

