"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useState, useEffect, useCallback } from "react";
import { useUserContext } from "@/app/AppContext";

export function InventoryTable({ locationId }) {
  const columns = [
    {
      key: "itemId",
      label: "Item ID",
    },
    {
      key: "itemName",
      label: "Item Name",
    },
    {
      key: "quantity",
      label: "Quantity",
    },
  ];

  const [data, setData] = useState([]);
  const { user } = useUserContext();

  const fetchInventory = async () => {
    try {
      const response = await fetch(`http://localhost:8001/itemLocation/getByLocationId/${locationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
      });

      if (!response.ok) {
        console.error(`Error fetching inventory: ${response.statusText}`);
        return [];
      }

      let inventoryData = await response.json();

      for (let item of inventoryData) {
        const itemResponse = await fetch(`http://localhost:8001/item/get/${item.itemId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
        });
        if (itemResponse.ok) {
          const itemDetail = await itemResponse.json();
          item.itemName = itemDetail.name;
        } else {
          item.itemName = 'Unknown';
        }

        item.quantity = item.quantityAtLocation;
      }

      setData(inventoryData);
    } catch (error) {
      console.error(`Failed to fetch inventory data: ${error}`);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [locationId]);

  const renderCell = useCallback((item, columnKey) => {
    return item[columnKey];
  }, []);

  return (
      <Table aria-label="Inventory Table" color={"default"} selectionMode="single" fullWidth>
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={data}>
          {(item) => (
              <TableRow key={item.itemId}>
                {columns.map((column) => (
                    <TableCell key={column.key}>{renderCell(item, column.key)}</TableCell>
                ))}
              </TableRow>
          )}
        </TableBody>
      </Table>
  );
};
