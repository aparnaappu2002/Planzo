import React from 'react'

interface paginationParams{
    total:number;
    current:number;
    setPage:React.Dispatch<React.SetStateAction<number>>
}

function Pagination({total, current, setPage}:paginationParams) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        onClick={() => setPage(current - 1)}
        disabled={current === 1}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          current === 1 
            ? 'bg-yellow-100 text-yellow-400 cursor-not-allowed' 
            : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg transform hover:scale-105 active:scale-95'
        }`}
      >
        Previous
      </button>
      <span className="text-yellow-800 font-semibold px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
        Page {current} of {total}
      </span>
      <button
        onClick={() => setPage(current + 1)}
        disabled={current === total}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          current === total 
            ? 'bg-yellow-100 text-yellow-400 cursor-not-allowed' 
            : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg transform hover:scale-105 active:scale-95'
        }`}
      >
        Next
      </button>
    </div>
  )
}

export default React.memo(Pagination)