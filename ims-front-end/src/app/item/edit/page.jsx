"use client";

import {useEffect, useState} from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Textarea
} from "@nextui-org/react";
import {useUserContext} from "../../AppContext";
import {redirect, useRouter} from "next/navigation";

export default function EditInventory() {
  const router = useRouter();
  const {user} = useUserContext();
  // Item form values
  const [itemId, setItemId] = useState(-1);
  const [itemName, setItemName] = useState("");
  const [itemStockLevel, setItemStockLevel] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  const [itemLocations, setItemLocations] = useState([]);
  const [locations, setLocations] = useState([]);

  // selected location identified by locationId
  const [selectedLocation, setSelectedLocation] = useState(-1);
  const [selectedLocationName, setSelectedLocationName] = useState("");

  // Location form values
  const [locationName, setLocationName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [zipcode, setZipcode] = useState("");

  if (Object.keys(user).length === 0) {
    redirect("/login");
  }

  const fetchLocations = async (itemId) => {
    try {
      // Get a list of item locations
      const response = await fetch(`http://localhost:8001/itemLocation/getByItemId/${itemId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
      });

      if (!response.ok) {
        alert(`HTTP error when getting item location list, status: ${response.status}`);
        return;
      }
      const itemLocations = await response.json();
      setItemLocations([...itemLocations]);

      const locationIds = itemLocations.map(loc => loc.locationId);

      // For each locationId, get the Location information. If any error, just skip it.
      const fetchLocation = async (id) => {
        try {
          const response = await fetch(`http://localhost:8001/location/get/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + user.token
            },
          });

          if (!response.ok) {
            console.error(`HTTP error when getting location detail for ${id}, status: ${response.status}`);
            return null;
          }

          return response.json();
        } catch (error) {
          console.error(`Failed to fetch location ${id}:`, error);
          return null;
        }
      };

      const locationPromises = locationIds.map(fetchLocation);
      const locations = await Promise.all(locationPromises);
      setLocations(locations.filter(location => location !== null));
    } catch (error) {
      alert(`Getting location list failed: ${error}`);
      return [];
    }
  };

  useEffect(() => {
    const itemParams = new URLSearchParams(window.location.search);
    const itemId = parseInt(itemParams.get("itemId"), 10);
    setItemId(itemId);
    setItemName(itemParams.get("name"));
    setItemPrice(itemParams.get("price"));
    setItemDescription(itemParams.get("description"));
    fetchLocations(itemId);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const itemData = {
      itemId: itemId,
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice)
    };

    // Existing item, update its name, price, description
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
      alert(`Updating item failed: ${error}`);
      return;
    }

    // Then update ItemLocation if any location is selected
    if (selectedLocation !== -1) {
      const itemLocationData = {
        itemId: itemId,
        locationId: selectedLocation,
        quantityAtLocation: parseInt(itemStockLevel, 10)
      };
      try {
        const response = await fetch("http://localhost:8001/itemLocation/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
          body: JSON.stringify(itemLocationData)
        });

        if (!response.ok) {
          alert(`HTTP error when updating itemLocation, status: ${response.status}`);
          return;
        }
      } catch (error) {
        alert("Updating itemLocation failed: ", error);
        return;
      }
    }

    router.push("/client");
  };

  const handleCancel = () => {
    router.push("/client");
  };

  const handleLocationSelect = (key) => {
    const keyNum = parseInt(key, 10);

    setSelectedLocation(keyNum);
    const targetLocation = locations.find(location => location.locationId === keyNum);
    if (!targetLocation) {
      alert(`Cannot find selected location in state.`);
      return;
    }
    setSelectedLocationName(targetLocation.name);

    const targetItemLocation = itemLocations.find(iL => (iL.itemId === itemId && iL.locationId === keyNum));
    if (targetItemLocation) {
      setItemStockLevel(targetItemLocation.quantityAtLocation + "");
    }
    setLocationName(targetLocation.name);
    setAddressLine1(targetLocation.address1);
    setAddressLine2(targetLocation.address2);
    setZipcode(targetLocation.zipCode);
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-lg font-semibold">Update Inventory</h1>
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
                  <Button variant="bordered">{selectedLocationName || "Select Location"}</Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Locations"
                  onAction={handleLocationSelect}
                >
                  {locations.map((location) => (
                    <DropdownItem key={location.locationId}>{location.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Location Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  disabled={true}
                />
              </div>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  disabled={true}
                />
              </div>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Address Line 2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  disabled={true}
                />
              </div>
              <Input
                fullWidth
                label="Zipcode"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                disabled={true}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button auto flat color="error" onClick={handleCancel}>
              Cancel
            </Button>
            <Button auto type="submit">
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
