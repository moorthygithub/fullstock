import React from "react";
import { Button } from "@/components/ui/button";
import { RiFileExcel2Line } from "react-icons/ri";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";

const StockTableBoth = ({ title, data = [], onDownload }) => {
  const { toast } = useToast();

  return (
    <div className="hidden sm:block rounded-md border max-h-[500px] overflow-y-auto mb-4">
      <table className="w-full border-collapse border">
        <thead
          className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
        >
          <tr>
            <th
              colSpan="3"
              className={`text-left sticky top-0 z-10 px-2 py-2 border-b ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
            >
              {title}
            </th>
            <th
              colSpan="1"
              className={`text-right sticky top-0 z-10 px-2 py-2 border-b ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
            >
              <Button
                type="button"
                size="sm"
                className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={() => onDownload(data, toast)}
              >
                <RiFileExcel2Line className="h-3 w-3 mr-1" /> Excel
              </Button>
            </th>
          </tr>
          <tr
            className={`text-[14px] sticky top-[40px] z-10 ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
          >
            <th className="border-b px-2 py-2 text-left">S.No</th>
            <th className="border-b px-2 py-2 text-left">Item Name</th>
            <th className="border-b px-2 py-2 text-left">Category</th>
            <th className="border-b px-2 py-2 text-left">Available</th>
          </tr>
        </thead>

        {data && data.length > 0 ? (
          <tbody>
            {data.map((item, index) => {
              const available =
                Number(item.openpurch) -
                Number(item.closesale) +
                (Number(item.purch) - Number(item.sale)) -
                Number(item.purchR) +
                Number(item.saleR);

              return (
                <tr key={index} className="hover:bg-gray-50 text-[14px]">
                  <td className="border-b px-2 py-2">{index + 1}</td>
                  <td className="border-b px-2 py-2">{item.item_name}</td>
                  <td className="border-b px-2 py-2">{item.item_category}</td>
                  <td className="border-b px-2 py-2">{available}</td>
                </tr>
              );
            })}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                Data Not Available
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default StockTableBoth;
