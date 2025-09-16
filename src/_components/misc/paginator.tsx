'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../icons/appIcon';
import { IconArrowLeft, IconArrowRight } from '../icons/icons';

// TOTAL_PAGE_NUMBERS_TO_DISPLAY
const TPND = 5;
export default function Paginator({
  data,
  onPagination,
  itemsPerPage = 6,
}: {
  data: object[];
  onPagination: (currentData: object[]) => void;
  itemsPerPage: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage);
  }, [data, itemsPerPage]);
  const [shouldChangeDisplayNumbers, setShouldChangeDisplayNumbers] =
    useState(false);

  const previousDisplayNumbersRef = useRef<number[]>([]);
  const displayNumbers = useMemo(() => {
    if (currentPage === 1 || shouldChangeDisplayNumbers) {
      const numbers: number[] = [];
      for (let i = currentPage; numbers.length <= TPND - 1; i++) {
        if (i > totalPages) {
          break;
        }
        numbers.push(i);
      }
      previousDisplayNumbersRef.current = numbers;
      return numbers;
    } else {
      return previousDisplayNumbersRef.current;
    }
  }, [currentPage, shouldChangeDisplayNumbers, totalPages]);

  console.log('display numbers: ', displayNumbers);

  useEffect(() => {
    const dataStartIndex = (currentPage - 1) * itemsPerPage;
    const dataEndIndex = dataStartIndex + itemsPerPage;
    const pageData = data.slice(dataStartIndex, dataEndIndex);
    onPagination(pageData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, data, itemsPerPage]);

  function handlePageClick(pageNumber: number) {
    if (
      displayNumbers?.indexOf(pageNumber) === 4 ||
      !displayNumbers.includes(pageNumber)
    ) {
      setShouldChangeDisplayNumbers(true);
    } else {
      setShouldChangeDisplayNumbers(false);
    }
    setCurrentPage(pageNumber);
  }

  return (
    <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-center">
      <button
        className="hover:text-blue-secondary inline-flex gap-2 disabled:cursor-not-allowed disabled:text-on-disabled cursor-pointer"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
      >
        <AppIcon icon={IconArrowLeft} /> Previous
      </button>
      {displayNumbers &&
        displayNumbers.map((number) => (
          <button
            onClick={() => handlePageClick(number)}
            className={`rounded-default hover:cursor-pointer${
              currentPage === number
                ? ' px-3 py-2 bg-blue-primary hover:bg-blue-secondary text-text-light'
                : ''
            }`}
            key={number}
          >
            {number}
          </button>
        ))}
      <button
        className="hover:text-blue-secondary inline-flex gap-2 disabled:cursor-not-allowed disabled:text-on-disabled cursor-pointer"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => handlePageClick(currentPage + 1)}
      >
        Next <AppIcon icon={IconArrowRight} />
      </button>
    </div>
  );
}
