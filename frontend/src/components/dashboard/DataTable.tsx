import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Download, Search, SortAsc, SortDesc } from "lucide-react";
import { motion } from "framer-motion";

interface Column {
  key: string;
  header: string;
  formatter?: (value: any) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  title: string;
  description?: string;
  columns: Column[];
  data: any[];
  className?: string;
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  downloadable?: boolean;
  onRowClick?: (row: any) => void;
}

export function DataTable({
  title,
  description,
  columns,
  data,
  className,
  pagination = true,
  pageSize = 5,
  searchable = true,
  downloadable = true,
  onRowClick
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data || [];
    return (data || []).filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);
    
  // Sort data if sort config is set
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);
  
  // Paginate data
  const totalPages = Math.ceil((sortedData?.length || 0) / pageSize);
  const paginatedData = useMemo(() => {
    if (!pagination || !sortedData) return sortedData;
    return sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [pagination, sortedData, currentPage, pageSize]);
    
  // Handle sort
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Handle download
  const handleDownload = () => {
    if (!data || data.length === 0) return;
    
    // Convert data to CSV
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Handle values with commas by wrapping in quotes
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    ).join('\\n'); // Use actual newline character instead of \\\\n
    
    const csv = `${headers}\\n${rows}`;
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="h-9 w-[150px] pl-8 md:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          {downloadable && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="enhanced-table rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={column.sortable !== false ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={column.sortable !== false ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {sortConfig && sortConfig.key === column.key && (
                        sortConfig.direction === 'asc' 
                          ? <SortAsc className="h-3 w-3 text-muted-foreground" /> 
                          : <SortDesc className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(rowIndex * 0.05, 0.5) }}
                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column.key}`}>
                        {column.formatter
                          ? column.formatter(row[column.key])
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {pagination && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData?.length || 0)} of {sortedData?.length || 0} entries
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}