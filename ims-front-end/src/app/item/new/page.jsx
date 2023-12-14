"use client";

import {useState, useEffect} from "react";
import {
  Input,
  Button,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import {useUserContext} from "../../AppContext";
import {redirect} from "next/navigation";
import {useRouter} from "next/router";

export default function NewInventoryEntry() {
  const {user} = useUserContext();
  const [itemName, setItemName] = useState("");
  const [itemStockLevel, setItemStockLevel] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  const [locations, setLocations] = useState(["New Location"]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [zipcode, setZipcode] = useState("");

  if (Object.keys(user).length === 0) {
    redirect("/login");
  }

  useEffect(() => {
    // TODO: fetch locations from the database and update the "locations" state
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // something like:
    console.log("Item Name:", itemName);
    console.log("Item Stock Level:", itemStockLevel);
    console.log("Item Price:", itemPrice);
    console.log("Item Description:", itemDescription);

    window.location.href = "/client";
  };

  const handleCancel = () => {
    window.location.href = "/client";
  };

  const handleLocationSelect = (key) => {
    setSelectedLocation(key);

    // something like:
    // if (key === 'Location1') {
    //   setAddressLine1('123 Main St');
    //   setAddressLine2('Apt 4');
    //   setZipcode('12345');
    // } else {
    //   setAddressLine1('');
    //   setAddressLine2('');
    //   setZipcode('');
    // }
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-lg font-semibold">New Inventory Entry</h1>
          <p>Client ID: {user.clientId}</p>
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
                label="Item Stock Level"
                type="number"
                value={itemStockLevel}
                onChange={(e) => setItemStockLevel(e.target.value)}
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
            <div>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">{selectedLocation || "Select Location"}</Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Locations"
                  onAction={handleLocationSelect}
                >
                  {locations.map((location, index) => (
                    <DropdownItem key={index}>{location}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Address Line 2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>
              <Input
                fullWidth
                label="Zipcode"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button auto flat color="error" onClick={handleCancel}>
              Cancel
            </Button>
            <Button auto type="submit">
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
