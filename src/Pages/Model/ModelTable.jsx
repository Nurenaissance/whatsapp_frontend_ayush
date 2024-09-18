import React, { useState, useEffect } from 'react';
import axiosInstance from "../../api.jsx";
import { UploadCloud, Download, FileText, Plus } from 'lucide-react';

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    return pathArray.length >= 2 ? pathArray[1] : null;
};

const Models = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const tenantId = getTenantIdFromUrl();
    const [selectedModel, setSelectedModel] = useState(null);
    const [modelData, setModelData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axiosInstance.get('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/dynamic-models/');
                setModels(response.data);
            } catch (error) {
                console.error('Error fetching models:', error);
                setErrorMessage('Failed to fetch models');
            }
        };

        fetchModels();
    }, []);

    const handleModelSelect = async (model) => {
        setSelectedModel(model);
        setLoading(true);
        try {
            const response = await axiosInstance.get(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/dynamic-model-data/${model.model_name}/`);
            setModelData(response.data);
        } catch (error) {
            console.error('Error fetching model data:', error);
            setErrorMessage('Failed to fetch model data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/dynamic-model-data/${selectedModel.model_name}/`, formValues, {
                headers: {
                    'X-Tenant-Id': tenantId
                }
            });
            console.log('Data sent successfully:', response.data);
            setShowModal(false);
            // Refresh model data
            const updatedData = await axiosInstance.get(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/dynamic-model-data/${selectedModel.model_name}/`);
            setModelData(updatedData.data);
        } catch (error) {
            console.error('Error submitting data:', error);
            setErrorMessage('Failed to submit data');
        }
    };

    const handleEntryClick = (entry) => {
        setSelectedEntry(entry);
        setShowInfoModal(true);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                await axiosInstance.post('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/upload/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-Tenant-Id': tenantId
                    }
                });
                // Refresh model data after successful upload
                const updatedData = await axiosInstance.get(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/dynamic-model-data/${selectedModel.model_name}/`);
                setModelData(updatedData.data);
            } catch (error) {
                console.error('Error uploading file:', error);
                setErrorMessage('Failed to upload file');
            }
        }
    };

    const handleDownload = async (format) => {
        try {
            const response = await axiosInstance.get(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/download/${selectedModel.model_name}/${format}/`, {
                responseType: 'blob',
                headers: {
                    'X-Tenant-Id': tenantId
                }
            });
            const blob = new Blob([response.data], { type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${selectedModel.model_name}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            link.click();
        } catch (error) {
            console.error(`Error downloading ${format}:`, error);
            setErrorMessage(`Failed to download ${format}`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100" style={{width:"98vw"}}>
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Models Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {models.map((model) => (
                        <button
                            key={model.model_name}
                            onClick={() => handleModelSelect(model)}
                            className={`px-4 py-2 rounded ${selectedModel?.model_name === model.model_name ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
                        >
                            {model.model_name}
                        </button>
                    ))}
                </div>
                {selectedModel && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">{selectedModel.model_name} Model</h2>
                        <p className="mb-2">Created by: {selectedModel.created_by}</p>
                        <h3 className="text-xl font-semibold mb-2">Fields:</h3>
                        <ul className="list-disc list-inside mb-4">
                            {selectedModel.fields.map((field, index) => (
                                <li key={index}>{field.field_name} ({field.field_type})</li>
                            ))}
                        </ul>
                        <div className="flex flex-wrap gap-4 mb-4">
                            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                                <UploadCloud className="mr-2" />
                                Import Excel
                                <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx, .xls" />
                            </label>
                            <button onClick={() => handleDownload('excel')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                <Download className="mr-2" />
                                Download Excel
                            </button>
                            <button onClick={() => handleDownload('pdf')} className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                <FileText className="mr-2" />
                                Download PDF
                            </button>
                        </div>
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : modelData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-200">
                                        <tr>
                                            {selectedModel.fields.map((field) => (
                                                <th key={field.field_name} className="px-4 py-2 text-left text-gray-600 uppercase text-sm font-semibold">
                                                    {field.field_name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modelData.map((item, index) => (
                                            <tr key={index} onClick={() => handleEntryClick(item)} className="hover:bg-gray-100 cursor-pointer">
                                                {selectedModel.fields.map((field) => (
                                                    <td key={field.field_name} className="border px-4 py-2">{item[field.field_name]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4">No data available</div>
                        )}
                        <button onClick={() => setShowModal(true)} className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            <Plus className="mr-2" />
                            Add Data
                        </button>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Add New Entry</h2>
                        <form onSubmit={handleSubmit}>
                            {selectedModel.fields.map((field) => (
                                <div key={field.field_name} className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field.field_name}>
                                        {field.field_name}:
                                    </label>
                                    <input
                                        type={field.field_type === 'bigint' ? 'number' : 'text'}
                                        id={field.field_name}
                                        name={field.field_name}
                                        value={formValues[field.field_name] || ''}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                            ))}
                            <div className="flex items-center justify-between">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Submit
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                    </div>
                </div>
            )}

            {showInfoModal && selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Entry Details</h2>
                        {selectedModel.fields.map((field) => (
                            <p key={field.field_name} className="mb-2">
                                <span className="font-semibold">{field.field_name}:</span> {selectedEntry[field.field_name]}
                            </p>
                        ))}
                        <button onClick={() => setShowInfoModal(false)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Models;