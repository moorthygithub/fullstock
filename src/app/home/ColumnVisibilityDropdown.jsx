"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
function toCamelCase(str) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
export default function ColumnVisibilityDropdown({
  columnVisibility,
  handleToggle,
  singlebranch,
  doublebranch,
}) {
  const [open, setOpen] = useState(false);

  const keys = Object.entries(columnVisibility).filter(([key]) => {
    if (
      (key === "box" || key === "piece") &&
      !(singlebranch === "Yes" && doublebranch === "Yes")
    ) {
      return false;
    }
    return true;
  });

  const selected = Object.keys(columnVisibility).filter(
    (key) => columnVisibility[key]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-48 truncate flex justify-between"
        >
          <span className="truncate text-left capitalize">
            {selected.length > 0
              ? selected.map((s) => s.replace("_", " ")).join(", ")
              : "Select Columns"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
        align="start"
        sideOffset={5}
        collisionPadding={10}
      >
        {keys.map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onSelect={(e) => {
              e.preventDefault();
              handleToggle(key);
            }}
            className="flex items-center justify-between"
          >
            <span className="capitalize truncate text-sm">
              {key.replace("_", " ")}
            </span>
            {value && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 ml-2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
