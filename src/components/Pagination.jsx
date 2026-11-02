export default function Pagination({ page, pageSize, total, totalPages, onPageChange }) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label="Transaction pages">
      <p className="pagination-summary">
        Showing {first}–{last} of {total}
      </p>
      <div className="pagination-controls">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </nav>
  );
}