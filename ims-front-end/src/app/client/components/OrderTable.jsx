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

  const objectsEqual = (o1, o2) =>
    Object.keys(o1).length === Object.keys(o2).length 
        && Object.keys(o1).every(p => o1[p] === o2[p]);

  const arraysEqual = (a1, a2) => 
      a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));

  useEffect(() => {
    fetchData().then((res) => {
      res = res.map((item, index) => (
        {key: index + 1 + "", orderId: item.orderId, orderDate: item.orderDate.split('T')[0], orderStatus: item.orderStatus}
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
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data} emptyContent={"You have not placed any order"}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
};
