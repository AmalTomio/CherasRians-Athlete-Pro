import React, { useState, useEffect } from "react";
import { Spinner, Pagination } from "react-bootstrap";
import { FiInbox } from "react-icons/fi"; // Default icon

export default function Table({ 
  columns, 
  data, 
  loading, 
  itemsPerPage = 10,
  emptyIcon: EmptyIcon = FiInbox, 
  emptyTitle = "No Data Available",
  emptyMessage = "No records found.",
  emptyIconColor = "text-secondary"
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the underlying data changes
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
                <th 
                  key={index} 
                  className={`text-nowrap text-uppercase text-secondary fw-bold ${col.className || ""}`} 
                  style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 bg-white border-bottom-0">
                  <div className="d-flex flex-column align-items-center justify-content-center text-muted py-4">
                    {/* Render the dynamic icon and color here */}
                    <EmptyIcon size={48} className={`mb-3 opacity-50 ${emptyIconColor}`} />
                    <h5 className="fw-bold text-dark mb-1">{emptyTitle}</h5>
                    <p className="m-0 text-secondary">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={row._id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`align-middle ${col.className || ""}`}>
                      {col.accessor ? col.accessor(row, startIndex + rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
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