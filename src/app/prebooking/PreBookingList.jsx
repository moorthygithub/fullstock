import Page from "@/app/dashboard/page";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  Edit,
  Search,
  SquarePlus,
  Trash2,
  View,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchPreBookingById,
  navigateTODispatchEdit,
  navigateTODispatchView,
  navigateToPreBookingEdit,
  navigateToPreBookingView,
  PRE_BOOKING_CREATE,
  PRE_BOOKING_LIST
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { encryptId } from "@/components/common/Encryption";
import Loader from "@/components/loader/Loader";
import StatusToggle from "@/components/toggle/StatusToggle";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import moment from "moment";
import { RiWhatsappFill } from "react-icons/ri";
import { useSelector } from "react-redux";
const PreBookingList = () => {
  const token = usetoken();
  const {
    data: prebooking,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["prebookings"],
    queryFn: async () => {
      const response = await apiClient.get(`${PRE_BOOKING_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.pre_booking;
    },
  });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const UserId = useSelector((state) => state.auth.user_type);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const whatsapp = useSelector((state) => state.auth.whatsapp_number);
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);

  // const doublebranch = "Yes";
  // console.log(singlebranch, doublebranch);
  const queryClient = useQueryClient();

  const { toast } = useToast();
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const confirmDelete = async () => {
    try {
      const response = await apiClient.delete(
        `${PRE_BOOKING_CREATE}/${deleteItemId}`,
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
  const handleFetchDispatchById = async (dispatchId) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["dispatchByid", dispatchId],
        queryFn: () => fetchPreBookingById(dispatchId, token),
      });

      if (data?.prebooking && data?.prebookingsub) {
        handleSendWhatsApp(
          data.prebooking,
          data.prebookingsub,
          data.buyer,
          singlebranch,
          doublebranch
        );
      } else {
        console.error("Incomplete data received");
      }
    } catch (error) {
      console.error("Failed to fetch prebooking data or send WhatsApp:", error);
    }
  };

  const handleSendWhatsApp = (prebooking, prebookingsub, buyer) => {
    const { pre_booking_ref, pre_booking_date, pre_booking_vehicle_no } =
      prebooking;
    const { buyer_name, buyer_city } = buyer;

    const preBookingNo = pre_booking_ref?.split("-").pop();

    const NAME_WIDTH = 25;

    const itemLines = prebookingsub.map((item) => {
      let name = item.item_name.slice(0, 20);
      name = name.padEnd(NAME_WIDTH, " ");
      const box = `${String(item.pre_booking_sub_box || 0)}`;
      return `${name}${box}`;
    });

    const totalQty = prebookingsub.reduce(
      (sum, item) => sum + (parseInt(item.pre_booking_sub_box, 10) || 0),
      0
    );

    const message = `\`\`\`
=== PreBookingList ===
No.        : ${preBookingNo}
Date       : ${moment(pre_booking_date).format("DD-MM-YYYY")}
Party      : ${buyer_name}
City       : ${buyer_city}
VEHICLE NO : ${pre_booking_vehicle_no}
======================
Product [SIZE]          (QTY)
======================
${itemLines.join("\n")}
======================
Total QTY: ${totalQty}
======================
\`\`\``;
    // const phoneNumber = `${whatsapp}`;
    // // const phoneNumber = "919360485526";
    // const encodedMessage = encodeURIComponent(message);
    // const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    // window.open(whatsappUrl, "_blank");
    const encodedMessage = encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const mobileUrl = `whatsapp://send?text=${encodedMessage}`;
      window.location.href = mobileUrl;
    } else {
      const webUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      const desktopFallback = `whatsapp://send?text=${encodedMessage}`;

      try {
        window.open(webUrl, "_blank");
        setTimeout(() => {
          window.location.href = desktopFallback;
        }, 500);
      } catch (err) {
        window.location.href = desktopFallback;
      }
    }
  };
  const columns = [
    {
      accessorKey: "index",
      header: "Sl No",
      id: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "pre_booking_date",
      header: "Date",
      id: "Date",
      cell: ({ row }) => {
        const date = row.original.pre_booking_date;
        return moment(date).format("DD-MMM-YYYY");
      },
    },
    {
      accessorKey: "buyer_name",
      header: "Buyer Name",
      id: "Buyer Name",
      cell: ({ row }) => <div>{row.original.buyer_name}</div>,
    },
    {
      accessorKey: "pre_booking_ref_no",
      header: "Ref No",
      id: "Ref No",
      cell: ({ row }) => <div>{row.original.pre_booking_ref_no}</div>,
    },
    {
      accessorKey: "pre_booking_vehicle_no",
      header: "Vehicle No",
      id: "Vehicle No",
      cell: ({ row }) => <div>{row.original.pre_booking_vehicle_no}</div>,
    },
    ...(UserId == 3
      ? [
          {
            accessorKey: "branch_name",
            header: "Branch Name",
            id: "Branch Name",

            cell: ({ row }) => <div>{row.original.branch_name}</div>,
          },
        ]
      : []),
    {
      accessorKey: "pre_booking_status",
      header: "Status",
      id: "Status",
      cell: ({ row }) => {
        const status = row.original.pre_booking_status;
        const statusId = row.original.id;
        return (
          <StatusToggle
            initialStatus={status}
            teamId={statusId}
            onStatusChange={() => {
              refetch();
            }}
          />
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const PreBookingId = row.original.id;

        return (
          <div className="flex flex-row space-x-2">
            {UserId != 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigateToPreBookingEdit(navigate, PreBookingId);
                      }}
                    >
                      <Edit />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit PreBooking</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigateToPreBookingView(navigate, PreBookingId);
                    }}
                  >
                    <View />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View PreBooking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {UserId != 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteRow(PreBookingId)}
                      className="text-red-500"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete PreBooking</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleFetchDispatchById(encryptId(PreBookingId))
                    }
                    className="text-green-500"
                    type="button"
                  >
                    <RiWhatsappFill className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Whatsapp PreBooking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: prebooking || [],
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
        pageSize: 20,
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
              Error Fetching PreBooking
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
              PreBooking List
            </h1>
            {UserId != 3 && (
              <div>
                <Button
                  variant="default"
                  className={`md:ml-2 bg-yellow-400 hover:bg-yellow-600 text-black rounded-l-full`}
                  onClick={() => navigate("/pre-booking/create")}
                >
                  <SquarePlus className="h-4 w-4 " /> PreBooking
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search PreBooking..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {prebooking.length > 0 ? (
              prebooking.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigateTODispatchView(navigate, item.id);
                  }}
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.dispatch_status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <StatusToggle
                            initialStatus={item.dispatch_status}
                            teamId={item.id}
                            onStatusChange={() => {
                              refetch();
                            }}
                          />
                        </span>
                        {UserId != 3 && (
                          <button
                            className={`px-2 py-1 bg-yellow-400 hover:bg-yellow-600 rounded-lg text-black text-xs`}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigateTODispatchEdit(navigate, item.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFetchDispatchById(encryptId(item.id));
                          }}
                          className="text-green-500"
                          type="button"
                        >
                          <RiWhatsappFill className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between gap-1">
                      {item.dispatch_ref_no && (
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
                            <span className="text-[10px]">Ref No:</span>
                            {item.dispatch_ref_no}
                          </span>
                        </div>
                      )}
                      {item.dispatch_vehicle_no && (
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
                            <span className="text-[10px]">Vehicle No:</span>
                            {item.dispatch_vehicle_no}
                          </span>
                        </div>
                      )}
                      {item.dispatch_date && (
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
                            {moment(item.dispatch_date).format("DD-MMM-YY")}
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

        <div className="hidden sm:block">
          <div className="flex text-left text-2xl text-gray-800 font-[400]">
            PreBooking List
          </div>
          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search PreBooking..."
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

              {UserId != 3 && (
                <>
                  {" "}
                  <Button
                    variant="default"
                    className={`w-full md:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    onClick={() => navigate("/pre-booking/create")}
                  >
                    <SquarePlus className="h-4 w-4 mr-2" /> PreBooking
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* table  */}
          <div className="rounded-md border ">
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
              Total PreBooking : &nbsp;
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
              PreBooking.
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

export default PreBookingList;
