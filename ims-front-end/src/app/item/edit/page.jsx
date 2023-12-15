"use client";

import {useState, useEffect} from "react";
import {
  Input,
  Button,
  Textarea
} from "@nextui-org/react";
import {useUserContext} from "../../AppContext";
import {redirect, useRouter} from "next/navigation";

export default function EditInventory() {
  const router = useRouter();
  const {user} = useUserContext();
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  if (Object.keys(user).length === 0) {
    redirect("/login");
  }

  useEffect(() => {
    const itemParams = new URLSearchParams(window.location.search);
    setItemId(itemParams.get("itemId"));
    setItemName(itemParams.get("name"));
    setItemPrice(itemParams.get("price"));
    setItemDescription(itemParams.get("description"));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const itemData = {
      itemId: parseInt(itemId, 10),
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice)
    };

    try {
      const response = await fetch("http://localhost:8001/item/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        alert(`HTTP error when updating item, status: ${response.status}`);
        return;
      }
    } catch (error) {
      console.error("Updating item failed: ", error);
      return;
    }

    router.push("/client");
  };

  const handleCancel = () => {
    router.push("/client");
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-lg font-semibold">Update Inventory Entry</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mt-2"><Input
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              /></div>
              <div className="mt-2"><Input
                fullWidth
                label="Item Price"
                type="number"
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              /></div>
              <div className="mt-2"><Textarea
                fullWidth
                label="Item Description"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              /></div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button auto flat color="error" onClick={handleCancel}>
              Cancel
            </Button>
            <Button auto type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
