export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M14 26h4v-10l6-8-4-2L16 14l-4-8-4 2 6 8v10z" />
    </svg>
  );
}
