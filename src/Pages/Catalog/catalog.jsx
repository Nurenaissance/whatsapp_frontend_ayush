import React, { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Copy, Loader2 } from 'lucide-react';
import axiosInstance, { fastURL } from '../../api';
import { BlobServiceClient } from '@azure/storage-blob';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Catalog = () => {
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState([]);
  const [textToCopy, setTextToCopy] = useState({ display: "Copy Link", url: "" });
  const [catalogID, setCatalogID] = useState('');
  const [tableData, setTableData] = useState([]);
  const [duplicateIndex, setDuplicateIndex] = useState(null);
<<<<<<< HEAD
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageURLs, setImageURLs] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState(null);
=======
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageURLs, setImageURLs] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false);
>>>>>>> 7f436435a6bc388de154d3aba540ae88ae480b8c

  const generateRandomProductID = () => {
    const characters = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let result = "";
    for (let i = 0; i < 7; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  const fetchData = async () => {
    try {
      const django_promise = axiosInstance.post(`/create-spreadsheet/`);
      const fastResponse = await axiosInstance.get(`${fastURL}/catalog`)
      
      const products = fastResponse.data
      
      const initialData = products.map(product => ({
        product_id: product.product_id || generateRandomProductID(),
        title: product.title || "",
        description: product.description || "",
        link: product.link || "",
        image_link: product.image_link || "",
        condition: product.condition || "",
        quantity: product.quantity || "",
        price: product.price || "",
        brand: product.brand || "",
        status: product.status || ""
      })
    );
      console.log("Changing the Original Data...", initialData)
      setOriginalData([...initialData.map(item => ({...item}))]);
      setTableData(initialData);
      console.log("Initial Data: ", initialData)
      const initialImageURLs = {};
      initialData.forEach((item, index) => {
        if (item.image_link) {
          initialImageURLs[index] = item.image_link;
        }
      });
      setImageURLs(initialImageURLs);

<<<<<<< HEAD
  const fetchData = async () => {
    try {
      const django_promise = axiosInstance.post(`/create-spreadsheet/`);
      const fastResponse = await axiosInstance.get(`${fastURL}/catalog/`);
      
      const products = fastResponse.data;
      
      const initialData = products.map(product => ({
        product_id: product.product_id || generateRandomProductID(),
        title: product.title || "",
        description: product.description || "",
        link: product.link || "",
        image_link: product.image_link || "",
        condition: product.condition || "",
        quantity: product.quantity || "",
        price: product.price || "",
        brand: product.brand || "",
        status: product.status || ""
      }));

      setOriginalData([...initialData.map(item => ({...item}))]);
      setTableData(initialData);
=======
      const djangoResponse = await django_promise
      setTextToCopy(prevState => ({ ...prevState, url: djangoResponse.data.spreadsheet_url }));
      setCatalogID(djangoResponse.data.catalog_id)
>>>>>>> 7f436435a6bc388de154d3aba540ae88ae480b8c

      const initialImageURLs = {};
      initialData.forEach((item, index) => {
        if (item.image_link) {
          initialImageURLs[index] = item.image_link;
        }
      });
      setImageURLs(initialImageURLs);

<<<<<<< HEAD
      const djangoResponse = await django_promise;
      setTextToCopy(prevState => ({ ...prevState, url: djangoResponse.data.spreadsheet_url }));
      setCatalogID(djangoResponse.data.catalog_id);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
=======
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally{
      setLoading(false)
    }
  };

>>>>>>> 7f436435a6bc388de154d3aba540ae88ae480b8c

  const handleCellChange = (e, rowIndex, field) => {
    const newData = [...tableData];
    const newValue = e.target.value;
    newData[rowIndex][field] = newValue;
    setTableData(newData);
  };

  const deleteRow = (rowIndex) => {
    if (tableData.length > 5) {
      const newData = tableData.filter((_, index) => index !== rowIndex);
      setTableData(newData);
    } else {
      alert("Minimum of 5 rows required. Cannot delete further.");
    }
  };

<<<<<<< HEAD
=======

>>>>>>> 7f436435a6bc388de154d3aba540ae88ae480b8c
  const uploadToBlob = async (e, rowIndex, field) => {
    try {
      const file = e.target.files[0];
      const account = "pdffornurenai";
      const sas = "sv=2022-11-02&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2025-06-01T16:13:31Z&st=2024-06-01T08:13:31Z&spr=https&sig=8s7IAdQ3%2B7zneCVJcKw8o98wjXa12VnKNdylgv02Udk%3D";

      const containerName = 'pdf';
      const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net/?${sas}`);

      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobName = file.name + '-' + Date.now();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
      const uploadBlobResponse = await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: { blobContentType: file.type }
      });
  
      const newData = [...tableData];
      const newValue = blockBlobClient.url;
      newData[rowIndex][field] = newValue;
      setTableData(newData);
      setImageURLs(prev => ({
        ...prev,
        [rowIndex]: blockBlobClient.url,
      }));
    } catch (error) {
      console.error('Error uploading file to Azure:', error);
    }
  };

  const handleSubmitCatalog = async () => {
    try {
      setIsSubmitting(true);
      const dataToSubmit = tableData.map((row) => ({
        ...row,
        condition: row.condition || "new",
        availability: row.quantity > 0 ? "in_stock" : "out_of_stock",
        status: row.status || "active"
      }));

      const changes = dataToSubmit.map((newRow) => {
        const originalRow = originalData.find(item => item.product_id === newRow.product_id);
        if (!originalRow) {
          return { ...newRow, row_status: 'added' };
        }
        
        let isChanged = false;
        for (let key of Object.keys(newRow)) {
          if (newRow[key] !== originalRow[key]) {
            isChanged = true;
          }
        }
        return { ...newRow, row_status: isChanged ? 'changed' : 'unchanged' };
      });

      const filteredChanges = changes.filter(row => row.row_status !== 'unchanged');
      const response = await axiosInstance.post(`/catalog/`, filteredChanges);
    } catch (error) {
      console.error("Error submitting catalog data: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyText = async () => {
    if (textToCopy.url) {
      try {
        await navigator.clipboard.writeText(textToCopy.url);
        setTextToCopy(prevState => ({ ...prevState, display: "Copied!" }));
        setTimeout(() => {
          setTextToCopy(prevState => ({ ...prevState, display: "Copy Link" }));
        }, 1000);
      } catch (error) {
        console.error("Failed to copy text: ", error);
      }
    }
  };

  const addRow = () => {
    const newRow = {
      product_id: generateRandomProductID(),
      title: "",
      description: "",
      link: "",
      image_link: "",
      condition: "",
      quantity: "",
      price: "",
      brand: "",
      status: ""
    };
    setTableData(prevData => [...prevData, newRow]);
  };

<<<<<<< HEAD
=======
  const handleEditClick = async () => {
  setIsPopupVisible((prev) => !prev);
  }

>>>>>>> 7f436435a6bc388de154d3aba540ae88ae480b8c
  const handleInputChange = (e) => {
    setCatalogID(e.target.value);
  };

  const handleSaveCatalogID = async () => {
    try {
      await axiosInstance.post('catalog-id/', {
        catalog_id: catalogID
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving catalog ID:", error);
    }
  };

<<<<<<< HEAD
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold">Catalog Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Catalog ID:</span>
              <span className="text-sm text-muted-foreground">{catalogID}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Catalog ID</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-sm"
              onClick={handleCopyText}
            >
              <Copy className="h-4 w-4" />
              {textToCopy.display}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <div className="rounded-md border min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="w-32">Product ID</TableHead>
                  <TableHead className="w-48">Product Name</TableHead>
                  <TableHead className="w-64">Description</TableHead>
                  <TableHead className="w-48">Product Link</TableHead>
                  <TableHead className="w-32">Image</TableHead>
                  <TableHead className="w-32">Condition</TableHead>
                  <TableHead className="w-24">Quantity</TableHead>
                  <TableHead className="w-24">Item Price</TableHead>
                  <TableHead className="w-32">Brand</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-12 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-center">{rowIndex + 1}</TableCell>
                    <TableCell>
                      <Input
                        value={row.product_id || ""}
                        onChange={(e) => handleCellChange(e, rowIndex, "product_id")}
                        className="w-full"
                        placeholder="Prod ID"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.title}
                        placeholder="Product Name"
                        onChange={(e) => handleCellChange(e, rowIndex, "title")}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.description}
                        placeholder="Description"
                        onChange={(e) => handleCellChange(e, rowIndex, "description")}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="url"
                        value={row.link}
                        placeholder="Product Link"
                        onChange={(e) => handleCellChange(e, rowIndex, "link")}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 items-center">
                        {imageURLs[rowIndex] && (
                          <img
                            src={imageURLs[rowIndex]}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-md mb-2 cursor-pointer"
                            onDoubleClick={() => setFullImageUrl(imageURLs[rowIndex])}
                          />
                        )}
                        <div className="relative w-full">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadToBlob(e, rowIndex, "image_link")}
                            className="w-full text-xs opacity-0 absolute top-0 left-0 cursor-pointer z-10"
                          />
                          <Button 
                            variant="outline" 
                            className="w-full text-xs"
                          >
                            Upload Image
                          </Button>
                        </div>
                      </div>

                      {fullImageUrl && (
                        <Dialog open={!!fullImageUrl} onOpenChange={() => setFullImageUrl(null)}>
                          <DialogContent className="max-w-4xl">
                            <img 
                              src={fullImageUrl} 
                              alt="Full Image" 
                              className="w-full h-auto max-h-[80vh] object-contain"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.condition}
                        onValueChange={(value) => 
                          handleCellChange({ target: { value } }, rowIndex, "condition")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.quantity}
                        placeholder="Qty"
                        onChange={(e) => handleCellChange(e, rowIndex, "quantity")}
                        min="0"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.price}
                        placeholder="Price"
                        onChange={(e) => handleCellChange(e, rowIndex, "price")}
                        min="0"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={row.brand}
                        placeholder="Brand"
                        onChange={(e) => handleCellChange(e, rowIndex, "brand")}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={row.status}
                        onValueChange={(value) => 
                          handleCellChange({ target: { value } }, rowIndex, "status")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteRow(rowIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <Button
          className="rounded-full h-12 w-12"
          onClick={addRow}
        >
          <Plus className="h-6 w-6" />
        </Button>
        <Button
          className="px-6"
          onClick={handleSubmitCatalog}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Catalog ID</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="catalogId">Catalog ID</Label>
              <Input
                id="catalogId"
                value={catalogID}
                onChange={handleInputChange}
                placeholder="Enter new Catalog ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={() => {
              handleSaveCatalogID();
              setIsDialogOpen(false);
            }}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading catalog data...
          </div>
        </div>
      )}
=======
  
  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div className="bp-catalog absolute right-0">
      {tableData &&  tableData.length > 0 ? (
        <>
      {/* Division: Catalog Management Section */}
      <div className="catalog-management-section flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 rounded-lg gap-4">



        {/* Catalog ID */}
        <div className="relative hidden lg:flex items-center input-catalogid">
          <b>Catalog ID: {catalogID}</b>
          <Edit 
            style={{ position: 'relative', marginLeft: '12px', cursor: 'pointer' }} 
            size={18} 
            onClick={handleEditClick}
          />
          <div
            className={`absolute mt-2 p-2 bg-white border border-gray-300 shadow-lg rounded popup ${
              isPopupVisible ? 'popup-enter' : 'popup-exit'
            }`}
            style={{ top: '45px', left: '10px', transformOrigin: '85px -15px', borderRadius: '7px' }}
          >
            <p>Catalog ID:</p>
            <input 
              type="text" 
              placeholder="Enter new Catalog ID" 
              className="mt-2 p-1 border rounded" 
              value={catalogID} 
              onChange={handleInputChange}
            />
            <button 
              onClick={handleSaveCatalogID} 
              className="mt-2 p-1 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-2xl md:text-3xl font-semibold text-center mt-4 lg:mt-0 flex-grow"
        >
          Catalog Management
        </h1>


        {/* Copy Link */}
        <div 
          className={`copy-text-box ${textToCopy.display === "Copied!" ? "copied" : ""}`} 
          onClick={handleCopyText}
          style={{ marginBottom: '10px' }} // Add spacing for mobile
        >
          {textToCopy.display}
        </div>
        

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table id="dt" className="w-full text-left border border-gray-300">
  <thead>
    <tr className="bg-gray-200">
      <th></th>
      <th>Product ID</th>
      <th>Product Name</th>
      <th>Description</th>
      <th>Product Link</th>
      <th>Image</th>
      <th>Condition</th>
      <th>Quantity</th>
      <th>Item Price</th>
      <th>Brand</th>
      <th>Status</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {tableData.map((row, rowIndex) => (
      <tr
        key={rowIndex}
        className={`${
          duplicateIndex === rowIndex ? "duplicate-input" : ""
        } odd:bg-white even:bg-gray-100 hover:bg-gray-200`}
      >
        <td>{rowIndex + 1}</td>
        <td>
          <input
            type="text"
            value={row.product_id || ""}
            onChange={(e) => handleCellChange(e, rowIndex, "product_id")}
            className="column-bg"
          />
        </td>
        <td>
          <input
            type="text"
            value={row.title}
            placeholder="Product Name"
            onChange={(e) => handleCellChange(e, rowIndex, "title")}
            className="column-bg"
          />
        </td>
        <td>
          <input
            type="text"
            value={row.description}
            placeholder="Description"
            onChange={(e) => handleCellChange(e, rowIndex, "description")}
            className="column-bg"
          />
        </td>
        <td>
          <input
            type="url"
            value={row.link}
            placeholder="Product Link"
            onChange={(e) => handleCellChange(e, rowIndex, "link")}
            className="column-bg"
          />
        </td>
        <td className="flex items-center space-x-4">
          {imageURLs[rowIndex] && (
            <img
              src={imageURLs[rowIndex]}
              alt="Preview"
              style={{ width: "70px", height: "70px" }}
            />
          )}
          <input
            type="file"
            accept="image/"
            placeholder="Image"
            onChange={(e) => uploadToBlob(e, rowIndex, "image_link")}
            className="column-bg"
          />
        </td>
        <td>
          <select
            value={row.condition}
            onChange={(e) => handleCellChange(e, rowIndex, "condition")}
            className="column-bg"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </td>
        <td>
          <input
            type="number"
            value={row.quantity}
            placeholder="Quantity"
            onChange={(e) => handleCellChange(e, rowIndex, "quantity")}
            className="column-bg"
            min="0"
          />
        </td>
        <td>
          <input
            type="number"
            value={row.price}
            placeholder="Price"
            onChange={(e) => handleCellChange(e, rowIndex, "price")}
            className="column-bg"
            min="0"
          />
        </td>
        <td>
          <input
            type="text"
            value={row.brand}
            placeholder="Brand Name"
            onChange={(e) => handleCellChange(e, rowIndex, "brand")}
            className="column-bg"
          />
        </td>
        <td>
          <select
            value={row.status}
            onChange={(e) => handleCellChange(e, rowIndex, "status")}
            className="column-bg"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </td>
        <td>
          <button
            className="btn btn-delete"
            title="Delete"
            onClick={() => deleteRow(rowIndex)}
          >
            <Trash2 className="trash-icon" size={18} />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>

      {/* Division: Submit Button */}
      <div className="submit-container">
    <button className="submit-button px-6 py-2 bg-green-500 text-white rounded-lg text-base lg:text-lg hover:bg-green-600 transition duration-200" onClick={handleSubmitCatalog}>
      {isSubmitting? 'Submitting...': 'Submit'}
    </button>
      </div>
      </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 text-lg">No data available.</p>
        </div>
      )}

      {/* Add Row Button */}
      <button 
        className="add-row-button fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full text-lg shadow-lg hover:bg-blue-600 lg:bottom-6 lg:right-6 lg:p-5"
        onClick={addRow}
      >
        +
      </button>


>>>>>>> 7f436435a6bc388de154d3aba540ae88ae480b8c
    </div>
    
  );
<<<<<<< HEAD
};
=======
  
}
>>>>>>> 7f436435a6bc388de154d3aba540ae88ae480b8c

export default Catalog;