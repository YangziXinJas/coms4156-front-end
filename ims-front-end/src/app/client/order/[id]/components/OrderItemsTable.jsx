"use client"

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
  } from "@nextui-org/react"
import { useCallback } from "react";
import Link from "next/link";

export function OrderItemsTable({ orderData }) {
  const columns = [
    {
      key: "item",
      label: "Items",
    },
    {
      key: "price",
      label: "Price",
    },
    {
      key: "quantity",
      label: "Quantity"
    }
  ];

  const renderCell = useCallback((order, columnKey) => {
    const cellValue = order[columnKey];

    switch (columnKey) {
      default:
        return cellValue;
    }
  }, []);

  return (
    <Table isStriped aria-label="Example static collection table">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={orderData} emptyContent={"No rows to display."}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
};