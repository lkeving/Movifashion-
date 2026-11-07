// Professional Reusable Data Table Component
// Features: Column sorting, search, column visibility toggle, multi-select,
// bulk actions, CSV export, loading skeletons, empty states.

import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  Eye,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (row: T) => any;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  defaultVisible?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((row: T) => string);
  isLoading?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  exportFileName?: string;
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger';
    action: (selectedRows: T[]) => void;
  }[];
  customFilters?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  isLoading = false,
  searchPlaceholder = 'Buscar en la tabla...',
  onRowClick,
  exportFileName = 'reporte-movifashion.csv',
  bulkActions = [],
  customFilters,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(c => c.defaultVisible !== false).map(c => c.key))
  );
  const [showColPicker, setShowColPicker] = useState(false);

  const getRowId = (row: T): string => {
    if (typeof keyField === 'function') return keyField(row);
    return String(row[keyField]);
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(row =>
        columns.some(col => {
          const val = col.accessor ? col.accessor(row) : row[col.key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      result.sort((a, b) => {
        let valA = col?.accessor ? col.accessor(a) : a[sortKey];
        let valB = col?.accessor ? col.accessor(b) : b[sortKey];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortKey, sortOrder, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, page, pageSize]);

  // Handle Sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'desc') setSortOrder('asc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Selection
  const allSelectedOnPage = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(getRowId(r)));

  const toggleSelectAllPage = () => {
    const next = new Set(selectedIds);
    if (allSelectedOnPage) {
      paginatedData.forEach(r => next.delete(getRowId(r)));
    } else {
      paginatedData.forEach(r => next.add(getRowId(r)));
    }
    setSelectedIds(next);
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedRows = useMemo(() => {
    return data.filter(r => selectedIds.has(getRowId(r)));
  }, [data, selectedIds]);

  // CSV Export
  const handleExportCSV = () => {
    const exportCols = columns.filter(c => visibleColumns.has(c.key));
    const headers = exportCols.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = processedData.map(r =>
      exportCols
        .map(c => {
          const val = c.accessor ? c.accessor(r) : r[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50/50">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7656D6] transition"
            />
          </div>
          {customFilters}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Column Visibility Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition"
              title="Columnas visibles"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Columnas</span>
            </button>

            {showColPicker && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-2">
                <span className="text-[11px] font-bold text-slate-900 block pb-1 border-b border-slate-100">
                  Mostrar Columnas
                </span>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {columns.map(c => (
                    <label key={c.key} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(c.key)}
                        onChange={() => {
                          const next = new Set(visibleColumns);
                          if (next.has(c.key)) {
                            if (next.size > 1) next.delete(c.key);
                          } else {
                            next.add(c.key);
                          }
                          setVisibleColumns(next);
                        }}
                        className="rounded text-[#7656D6] focus:ring-[#7656D6]"
                      />
                      <span className="truncate">{c.header}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition"
            title="Exportar a CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && bulkActions.length > 0 && (
        <div className="bg-purple-50/80 px-4 py-2.5 border-b border-purple-100 flex items-center justify-between text-xs text-purple-900 animate-fadeIn">
          <div className="font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7656D6] text-white text-[10px]">
              {selectedIds.size}
            </span>
            <span>elemento(s) seleccionado(s)</span>
          </div>
          <div className="flex items-center gap-2">
            {bulkActions.map((ba, idx) => (
              <button
                key={idx}
                onClick={() => ba.action(selectedRows)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                  ba.variant === 'danger'
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {ba.icon}
                {ba.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-[11px] text-purple-700 underline hover:text-purple-900 ml-2"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}

      {/* Table Element */}
      <div className="overflow-x-auto min-h-[320px] flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              {bulkActions.length > 0 && (
                <th className="py-3 px-4 w-10 text-center">
                  <button
                    onClick={toggleSelectAllPage}
                    className="text-slate-400 hover:text-slate-700"
                    title={allSelectedOnPage ? 'Deseleccionar página' : 'Seleccionar página'}
                  >
                    {allSelectedOnPage ? (
                      <CheckSquare className="w-4 h-4 text-[#7656D6]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
              )}
              {columns
                .filter(c => visibleColumns.has(c.key))
                .map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`py-3 px-4 select-none ${
                      col.sortable !== false ? 'cursor-pointer hover:bg-slate-100/70 transition' : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.className || ''
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#7656D6]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#7656D6]" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 text-slate-300 opacity-60" />
                        )
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {bulkActions.length > 0 && (
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                    </td>
                  )}
                  {columns
                    .filter(c => visibleColumns.has(c.key))
                    .map((_, cIdx) => (
                      <td key={cIdx} className="py-4 px-4">
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      </td>
                    ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.filter(c => visibleColumns.has(c.key)).length + (bulkActions.length > 0 ? 1 : 0)}
                  className="py-16 text-center text-slate-400"
                >
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-sm">No se encontraron registros</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o la búsqueda.</p>
                </td>
              </tr>
            ) : (
              paginatedData.map(row => {
                const id = getRowId(row);
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition ${
                      isSelected ? 'bg-purple-50/50' : 'hover:bg-slate-50/80'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {bulkActions.length > 0 && (
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={e => toggleSelectRow(id, e)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#7656D6]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns
                      .filter(c => visibleColumns.has(c.key))
                      .map(col => {
                        return (
                          <td
                            key={col.key}
                            className={`py-3 px-4 text-slate-700 ${
                              col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                            } ${col.className || ''}`}
                          >
                            {col.render ? col.render(row) : (col.accessor ? col.accessor(row) : row[col.key])}
                          </td>
                        );
                      })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-[#7656D6] focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <span>de {processedData.length} registros</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-slate-700 font-semibold">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
