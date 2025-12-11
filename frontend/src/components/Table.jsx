import React from "react";

export default function Table({ columns = [], data = [], loading = false }) {
  return (
    <table className="table table-striped align-middle">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {/* Skeleton Loader */}
        {loading ? (
          [...Array(5)].map((_, i) => (
            <tr key={`skeleton-${i}`}>
              {columns.map((col) => (
                <td key={col.key}>
                  <div className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </div>
                </td>
              ))}
            </tr>
          ))
        ) : data.length > 0 ? (
          data.map((row, index) => (
            <tr key={row.userId || row._id || index}>
              {columns.map((col) => (
                <td key={col.key}>
                  {/* If accessor is a function, call it */}
                  {typeof col.accessor === "function"
                    ? col.accessor(row, index)
                    : row[col.accessor] ?? "-"}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="text-center py-3">
              No data found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
