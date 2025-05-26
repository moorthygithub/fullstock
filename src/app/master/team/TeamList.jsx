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
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";

import { TEAM_LIST, UPDATE_TEAM_STATUS } from "@/api";
import Loader from "@/components/loader/Loader";
import { Separator } from "@/components/ui/separator";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import moment from "moment";
import CreateTeam from "./CreateTeam";
import usetoken from "@/api/usetoken";
import apiClient from "@/api/axios";

const TeamList = () => {
  const token = usetoken();

  const {
    data: team,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await apiClient.get(`${TEAM_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.team;
    },
  });

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggle = async (teamId, currentStatus) => {
    setTogglingId(teamId);

    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await handleSubmit({ teamId, status: newStatus });

      queryClient.invalidateQueries({ queryKey: ["teams"] });
    } catch (error) {
      console.error("Failed to update team status:", error);
    } finally {
      setTogglingId(null);
    }
  };
  const handleSubmit = async ({ teamId, status }) => {
    if (!status) {
      toast({
        title: "Error",
        description: "Status is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiClient.put(
        `${UPDATE_TEAM_STATUS}/${teamId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update team status",
        variant: "destructive",
      });
    }
  };

  // Define columns for the table
  const columns = [
    {
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },

    {
      id: "Name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.original.name}</div>,
    },
    {
      id: "Email",
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      id: "Mobile",
      accessorKey: "mobile",
      header: "Mobile",
      cell: ({ row }) => <div>{row.original.mobile}</div>,
    },
    {
      id: "UserType",
      accessorKey: "user_type",
      header: "UserType",
      cell: ({ row }) => {
        const value = row.original.user_type;
        let label = "Unknown";
        let className = "bg-gray-100 text-gray-800";

        if (value === 1) {
          label = "User";
          className = "bg-blue-100 text-blue-800";
        } else if (value === 2) {
          label = "Admin";
          className = "bg-red-100 text-red-800";
        }

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${className}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      id: "Password",
      accessorKey: "cpassword",
      header: "Password",
      cell: ({ row }) => <div>{row.original.cpassword}</div>,
    },
    {
      id: "LastLogin",
      accessorKey: "last_login",
      header: "LastLogin",
      cell: ({ row }) => {
        const rawDate = row.original.last_login;
        const formattedDate = rawDate
          ? moment(rawDate).format("DD MMM YYYY")
          : "";

        return <div>{formattedDate}</div>;
      },
    },
    {
      id: "Branch Name",
      accessorKey: "branch_name",
      header: "Branch Name",
      cell: ({ row }) => <div>{row.original.branch_name}</div>,
    },
    {
      id: "Status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const teamId = row.original.id;
        const currentStatus = row.original.status;

        return (
          <SwitchPrimitive.Root
            checked={currentStatus == "Active"}
            onCheckedChange={() => handleToggle(teamId, currentStatus)}
            disabled={togglingId == teamId}
            title={currentStatus}
            className={`relative inline-flex items-center h-6 w-11 rounded-full
                ${currentStatus == "Active" ? "bg-green-500" : "bg-gray-400"} 
                ${
                  togglingId == teamId
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
          >
            <SwitchPrimitive.Thumb
              className={`block w-4 h-4 bg-white rounded-full transform transition-transform
                  ${
                    currentStatus == "Active"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }
                `}
            />
          </SwitchPrimitive.Root>
        );
      },
    },
  ];
  const filteredItems =
    team?.filter((item) =>
      item.branch_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  // Create the table instance
  const table = useReactTable({
    data: team || [],
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
              Error Fetching Team
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
              Team List
            </h1>
            <div>
              <CreateTeam />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search team..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative bg-white rounded-lg shadow-sm border-l-4 border-r border-b border-t border-yellow-500 overflow-hidden"
                >
                  <div className="p-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-100 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-sm text-gray-800">
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between gap-2 ">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <SwitchPrimitive.Root
                        checked={item.status == "Active"}
                        onCheckedChange={() =>
                          handleToggle(item.id, item.status)
                        }
                        disabled={togglingId == item?.id}
                        title={item.status}
                        className={`relative inline-flex items-center h-6 w-11 rounded-full
                ${item.status == "Active" ? "bg-green-500" : "bg-gray-400"} 
                ${
                  togglingId == item?.id
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
                      >
                        <SwitchPrimitive.Thumb
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform
                  ${
                    item?.status == "Active" ? "translate-x-6" : "translate-x-1"
                  }
                `}
                        />
                      </SwitchPrimitive.Root>
                    </div>
                    <Separator />

                    <div className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Mobile:</span>
                        <span className="text-xs font-medium text-gray-800">
                          {item.mobile}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Email:</span>
                        <span className="text-xs font-medium text-gray-800">
                          {item.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Branch:</span>
                        <span className="text-xs font-medium text-gray-800">
                          {item.branch_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            item.user_type === 1
                              ? "bg-blue-100 text-blue-800"
                              : item.user_type === 2
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.user_type === 1
                            ? "User"
                            : item.user_type === 2
                            ? "Admin"
                            : "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Password:</span>
                        <span className="text-xs font-medium text-gray-800">
                          {item.cpassword}
                        </span>
                      </div>
                    </div>
                    {/* Action */}
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
            Team List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search team..."
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

              <CreateTeam />
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
              Total Branch : &nbsp;
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
    </Page>
  );
};

export default TeamList;
