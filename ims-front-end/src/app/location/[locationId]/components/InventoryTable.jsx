"use client"

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react"
import { useState, useEffect, useCallback } from "react";
import { useUserContext } from "@/app/AppContext";
import Link from 'next/link'

export function InventoryTable({ locationId }) {
  const columns = [
    {
      key: "itemId",
      label: "Item",
    },
    {
      key: "quantity",
      label: "Quantity",
    },
  ];
  const [ data, setData ] = useState([]);
  const { user } = useUserContext();

  const fetchIventory = async () => {
    const response = await fetch("http://localhost:8001/itemLocation/getByLocationId/" + locationId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + user.token
      },
    });
    
    if (response.status === 404){
      return response.text();
    }
    return response.json();
  }

  const renderCell = useCallback((order, columnKey) => {
    const cellValue = order[columnKey];

    switch (columnKey) {
      default:
        return cellValue;
    }
  }, []);

  const objectsEqual = (o1, o2) =>
    Object.keys(o1).length === Object.keys(o2).length 
        && Object.keys(o1).every(p => o1[p] === o2[p]);

  const arraysEqual = (a1, a2) => 
      a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

  useEffect(() => {
    fetchIventory().then((res) => {
      res = res.map((obj, index) => (
        {key: index + 1 + "", itemId: obj.itemId, quantity: obj.quantityAtLocation}
      ))
      if (!arraysEqual(data, res)) {
        setData(res);
      };
    });
  },[data]);


  return (
    <Table 
      aria-label="Order History Table"
      color={"default"}
      defaultSelectedKeys={[]}
      selectionMode="single"
      fullWidth
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data} emptyContent={"There are not items in this location"}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
};
