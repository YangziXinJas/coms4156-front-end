"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell, Button,
} from "@nextui-org/react";
import {useState, useEffect, useCallback} from "react";
import {useUserContext} from "../../AppContext";
import Link from "next/link";

export function ItemTable() {
  const columns = [
    {
      key: "itemId",
      label: "ID",
    },
    {
      key: "name",
      label: "Item",
    },
    {
      key: "currentStockLevel",
      label: "Stock Level",
    },
    {
      key: "description",
      label: "Description"
    },
    {
      key: "price",
      label: "Price"
    },
    {
      key: "edit",
      label: "Edit"
    }
  ];
  const [data, setData] = useState([]);
  const {user} = useUserContext();

  const fetchData = async () => {
    const response = await fetch(`http://localhost:8001/item/getByClientId/${user.clientId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + user.token
      },
    });

    if (response.status === 404) {
      return "No existing inventory";
    }
    return response.json(); // array of items
  };

  const renderCell = useCallback((item, columnKey) => {
    const cellValue = item[columnKey];
    const itemId = item["itemId"];

    switch (columnKey) {
      case "itemId":
        return (
          // TODO: change the link
          <Link href={`/search/items/${itemId}`}>{cellValue}</Link>
        );
      case "name":
        return (
          // TODO: change the link
          <Link href={`/search/items/${itemId}`}>{cellValue}</Link>
        );
      case "currentStockLevel":
        return (
          <div>{cellValue}</div>
        );
      case "description":
        return (
          <div>{cellValue}</div>
        );
      case "price":
        return (
          <div>{cellValue}</div>
        );
      case "edit":
        return (
          <Link
            href={{
              pathname: "/item/edit",
              query: {
                itemId: item.itemId,
                name: item.name,
                price: item.price,
                description: item.description
              }
            }}
            className="inline-block text-center text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 px-2 py-1 rounded"
          >
            Edit
          </Link>
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
      if (!Array.isArray(res)) {
        res = [];
      }
      res = res.map((item, index) => (
        {
          key: index + 1 + "",
          itemId: item.itemId,
          name: item.name,
          currentStockLevel: item.currentStockLevel,
          description: item.description,
          price: item.price
        }
      ));
      if (!arraysEqual(data, res)) {
        setData(res);
      }
    });
  }, [data]);


  return (
    <Table
      aria-label="Inventory Table"
      color={"default"}
      defaultSelectedKeys={[]}
      selectionMode="single"
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn
          key={column.key}>{column.key === "edit" ? "" : column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={data} emptyContent={"No inventory items"}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
