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
import { useUserContext } from "../../AppContext";
import Link from 'next/link'

export function OrdersTable() {
  const columns = [
    {
      key: "orderId",
      label: "Order Number",
    },
    {
      key: "orderDate",
      label: "Date",
    },
    {
      key: "orderStatus",
      label: "Status"
    }
  ];
  const [ data, setData ] = useState([]);
  const { user } = useUserContext();
  const fetchData = async () => {
    const response = await fetch("http://localhost:8001/order/retrieve/client/" + user.clientId, {
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
      case "orderId":
        return (
          <Link href={`/client/order/${cellValue}`}>{cellValue}</Link>
        );
      case "orderDate":
        return (
          <div>{cellValue}</div>
        );
      case "orderStatus":
        return (
          <div>{cellValue}</div>
        );
      default:
        return cellValue;
    }
  }, []);

  useEffect(() => {
    fetchData().then((res) => {
      res = res.map((item, index) => (
        {key: index + 1 + "", orderId: item.orderId, orderDate: item.orderDate.split('T')[0], orderStatus: item.orderStatus}
      ))
      setData(res);
    });
  },[setData]);


  return (
    <Table isStriped aria-label="Example static collection table">
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data} emptyContent={"No rows to display."}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}


