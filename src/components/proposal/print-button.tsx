"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-teal-600"
    >
      Download PDF
    </button>
  );
}
