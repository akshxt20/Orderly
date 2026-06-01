export function SkeletonRow({ columns }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3.5">
          <div className="skeleton h-4 w-full max-w-[160px]" />
        </td>
      ))}
    </tr>
  );
}
