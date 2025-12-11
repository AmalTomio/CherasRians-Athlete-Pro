// src/components/SkeletonTableLoader.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function SkeletonTableLoader({ rows = 6 }) {
  return (
    <>
      <thead>
        <tr>
          <th><Skeleton width={30} height={20} /></th>
          <th><Skeleton width={120} height={20} /></th>
          <th><Skeleton width={60} height={20} /></th>
          <th><Skeleton width={80} height={20} /></th>
          <th><Skeleton width={100} height={20} /></th>
          <th><Skeleton width={120} height={20} /></th>
          <th><Skeleton width={80} height={20} /></th>
          <th><Skeleton width={80} height={20} /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={`skeleton-row-${index}`}>
            <td className="py-3">
              <Skeleton width={25} height={16} />
            </td>
            <td className="py-3">
              <div className="d-flex align-items-center">
                <Skeleton circle width={40} height={40} />
                <div className="ms-3">
                  <Skeleton width={100} height={16} />
                  <Skeleton width={60} height={12} className="mt-1" />
                </div>
              </div>
            </td>
            <td className="py-3">
              <Skeleton width={30} height={16} />
            </td>
            <td className="py-3">
              <Skeleton width={40} height={16} />
            </td>
            <td className="py-3">
              <Skeleton width={70} height={16} />
            </td>
            <td className="py-3">
              <Skeleton width={90} height={16} />
            </td>
            <td className="py-3">
              <Skeleton width={60} height={24} borderRadius={12} />
            </td>
            <td className="py-3">
              <Skeleton width={50} height={32} borderRadius={6} />
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}

export default SkeletonTableLoader;