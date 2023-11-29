"use client"

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
} from "@nextui-org/react"

export function OrdersTable() {
  return (
    <Table >
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>ROLE</TableColumn>
        <TableColumn>STATUS</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"No rows to display."}></TableBody>
    </Table>
  )
}


