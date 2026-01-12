import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function SkeletonTableLoader({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={`skeleton-row-${index}`}>
          {/* Col 1: No */}
          <td className="px-4 py-3">
            <Skeleton width={20} />
          </td>
          
          {/* Col 2: Avatar + Name (Matches your Players UI) */}
          <td className="py-3">
            <div className="d-flex align-items-center gap-3">
              <Skeleton circle width={40} height={40} />
              <div className="flex-grow-1">
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={12} className="mt-1" />
              </div>
            </div>
          </td>

          {/* Col 3: Class Info */}
          <td className="py-3">
             <div className="d-flex flex-column">
                <Skeleton width={60} height={16} />
                <Skeleton width={40} height={12} className="mt-1" />
             </div>
          </td>

          {/* Col 4: Category */}
          <td className="py-3">
             <div className="d-flex flex-column">
                <Skeleton width={50} height={20} borderRadius={4} />
                <Skeleton width={70} height={12} className="mt-1" />
             </div>
          </td>

          {/* Col 5: Status */}
          <td className="py-3">
             <Skeleton width={80} height={24} borderRadius={12} />
          </td>

          {/* Col 6: Actions */}
          <td className="py-3 text-end px-4">
             <Skeleton width={36} height={36} borderRadius={8} />
          </td>
        </tr>
      ))}
    </>
  );
}

export default SkeletonTableLoader;