export default function StatusBadge({ status }) {
  const cls = status === "In Progress" ? "progress" : status.toLowerCase();
  return <span className={`badge status-${cls}`}>{status}</span>;
}
