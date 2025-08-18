import { PAYMENT_FORM, PAYMENT_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/dashboard/page";
import Loader from "@/components/loader/Loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search, Trash2 } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import PaymentForm from "./PaymentForm";
import { useToast } from "@/hooks/use-toast";
const PaymentList = () => {
  const token = usetoken();
  const { toast } = useToast();
  const {
    data: payment,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["payment"],
    queryFn: async () => {
      const response = await apiClient.get(`${PAYMENT_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.payment;
    },
  });

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  // Define columns for the table
  const columns = [
    {
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "payment_date",
      header: "Date",
      id: "Date",
      cell: ({ row }) => {
        const date = row.original.payment_date;
        return moment(date).format("DD-MMM-YYYY");
      },
    },
    {
      id: "Buyer Name",
      accessorKey: "buyer_name",
      header: "Buyer Name",
      cell: ({ row }) => <div>{row.original.buyer_name}</div>,
    },
    {
      id: "Mode",
      accessorKey: "payment_mode",
      header: "Mode",
      cell: ({ row }) => <div>{row.original.payment_mode}</div>,
    },
    {
      id: "Amount",
      accessorKey: "payment_amount",
      header: "Amount",
      cell: ({ row }) => <div>{row.original.payment_amount}</div>,
    },

    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const paymentId = row.original.id;

        return (
          <div className="flex flex-row">
            <PaymentForm paymentId={paymentId} />
          </div>
        );
      },
    },
  ];
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const confirmDelete = async () => {
    try {
      const response = await apiClient.delete(
        `${PAYMENT_FORM}/${deleteItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.code == 200) {
        toast({
          title: "Success",
          description: data.msg,
        });
        refetch();
      } else if (data.code == 400) {
        toast({
          title: "Duplicate Entry",
          description: data.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: data.msg || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description:
          error?.response?.data?.msg ||
          error.message ||
          "Something unexpected happened.",
        variant: "destructive",
      });
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };
  const filteredItems =
    payment?.filter((item) =>
      item.buyer_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  // Create the table instance
  const table = useReactTable({
    data: payment || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });

  // Render loading state
  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <div className="w-full p-0 md:p-4 grid grid-cols-1">
        <div className="sm:hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl text-gray-800 font-medium">
              Payment List
            </h1>
            <div>
              <PaymentForm />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search payment..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    // className="relative bg-white rounded-lg shadow-sm border-l-4 border-r border-b border-t border-yellow-500 overflow-hidden"
                  >
                    <div className="space-y-3">
                      {payment.length > 0 ? (
                        payment.map((item, index) => (
                          <div
                            key={item.id}
                            className="relative bg-white rounded-lg shadow-sm border-l-4 border-r border-b border-t border-yellow-500 overflow-hidden"
                          >
                            <div className="p-2 flex flex-col gap-2">
                              {/* Sl No and Item Name */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-gray-100 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </div>
                                  <h3 className="font-medium text-sm text-gray-800">
                                    {item.buyer_name}
                                  </h3>
                                </div>
                                <div className="flex items-center justify-between gap-2 ">
                                  <PaymentForm paymentId={item.id} />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          onClick={() =>
                                            handleDeleteRow(item.id)
                                          }
                                          className="text-red-500"
                                          type="button"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete Quotation</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-between gap-1">
                                {item.payment_amount && (
                                  <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="text-gray-600 mr-1"
                                    >
                                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                    </svg>
                                    <span className="text-xs text-gray-700">
                                      <span className="text-[10px]">
                                        Amount:
                                      </span>
                                      {item.payment_amount}
                                    </span>
                                  </div>
                                )}
                                {item.payment_mode && (
                                  <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="text-gray-600 mr-1"
                                    >
                                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                                      <path d="M13 5v2" />
                                      <path d="M13 17v2" />
                                      <path d="M13 11v2" />
                                    </svg>
                                    <span className="text-xs text-gray-700">
                                      <span className="text-[10px]">
                                        Payment Mode:
                                      </span>
                                      {item.payment_mode}
                                    </span>
                                  </div>
                                )}
                                {item.payment_date && (
                                  <div className="inline-flex items-center bg-gray-100 rounded-full px-2 py-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="text-gray-600 mr-1"
                                    >
                                      <rect
                                        width="18"
                                        height="18"
                                        x="3"
                                        y="4"
                                        rx="2"
                                        ry="2"
                                      />
                                      <line x1="16" y1="2" x2="16" y2="6" />
                                      <line x1="8" y1="2" x2="8" y2="6" />
                                      <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span className="text-xs text-gray-700">
                                      {moment(item.payment_date).format(
                                        "DD-MMM-YY"
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-gray-500">
                          No items found.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center text-gray-500">
                No items found.
              </div>
            )}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="flex text-left text-2xl text-gray-800 font-[400]">
            Payment List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search payment..."
                value={table.getState().globalFilter || ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>

            <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <PaymentForm />
            </div>
          </div>
          {/* table  */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* row slection and pagintaion button  */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total Payment : &nbsp;
              {table.getFilteredRowModel().rows.length}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Quotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default PaymentList;
