import { Table, flexRender } from '@tanstack/react-table';
import { JSX } from 'react';

export default function CustomTable<T>({
  tableData,
  title,
}: {
  tableData: Table<T>;
  title?: string;
}): JSX.Element {
  return (
    <div className="w-full bg-background border-default border-border-primary rounded-default drop-shadow-default p-8">
      {title && <h2 className="text-title-small mb-8">{title}</h2>}
      <table className="table table-auto border-t-default border-b-default border-border-primary border-collapse rounded-default">
        <thead>
          <tr>
            {tableData.getFlatHeaders().map((header) => (
              <th
                key={header.id}
                className="text-left bg-panel-light text-title-small px-4 py-3"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t-default border-border-primary">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
