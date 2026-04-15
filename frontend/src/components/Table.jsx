import React, { useState, useEffect } from "react";
import { Spinner, Pagination } from "react-bootstrap";

export default function Table({ columns, data, loading, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the underlying data changes (e.g., when a user searches/filters)
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Pagination Logic
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data?.slice(startIndex, startIndex + itemsPerPage) || [];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-100">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="text-nowrap text-uppercase text-secondary fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="align-middle">
                    {col.accessor ? col.accessor(row, startIndex + rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-white">
          <span className="small text-muted fw-medium">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
          </span>
          <Pagination className="mb-0 custom-pagination shadow-sm">
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            />
            
            {/* Generate page numbers dynamically */}
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item 
                key={i + 1} 
                active={i + 1 === currentPage} 
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      <style>
        {`
        .custom-pagination .page-item .page-link {
          color: #64748b;
          border: none;
          margin: 0 2px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .custom-pagination .page-item.active .page-link {
          background-color: #0d6efd;
          color: white;
          box-shadow: 0 2px 4px rgba(13, 110, 253, 0.3);
        }
        .custom-pagination .page-item:not(.active) .page-link:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
}