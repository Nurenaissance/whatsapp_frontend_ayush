import React, { useCallback, useEffect, useRef, useState } from 'react';
import './BroadcastPage.css';
import {axiosInstance, fastURL, djangoURL} from '../../../api';
import axios from 'axios';
import { Edit2, Trash2, X } from 'lucide-react';
import {whatsappURL}  from '../../../Navbar';
import { v4 as uuidv4 } from 'uuid'; 
// import { uploadToBlob } from '../../../utils/azureStorage';
import { useAuth } from '../../../authContext';
import uploadToBlob from '../../../azureUpload';
import { MentionTextArea,convertMentionsForBackend, convertMentionsForFrontend } from '../../NewFlow/MentionTextArea';
import { base } from 'framer-motion/client';
import { Brightness4 } from '@mui/icons-material';
// import { NodeCache } from 'node-cache';

const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};


// const messageCache = new NodeCache({ stdTTL: 600 });

const initial_bg = [
  {id: 1, name: 'first group', contacts: [919548265904, 919864436756]}
]

const BroadcastPage = () => {
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState('history');
  const [showBroadcastPopup, setShowBroadcastPopup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [broadcastGroup, setBroadcastGroup] = useState(initial_bg)
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [selectedBCGroups, setSelectedBCGroups] = useState([])
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [headerType, setHeaderType] = useState('text');
  const [headerContent, setHeaderContent] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [buttons, setButtons] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [businessPhoneNumberId, setBusinessPhoneNumberId] = useState('');
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [headerMediaId, setHeaderMediaId] = useState('');
  const { userId } = useAuth();
  const fileInputRef = useRef(null);
  const tenantId=getTenantIdFromUrl();
  const [filteredBroadcastHistory, setFilteredBroadcastHistory] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [bodyVariables, setBodyVariables] = useState([]);
  const [headerVariables, setHeaderVariables] = useState([]);
  const [accountId, setAccountId] = useState('');




  const handleTemplateFilter = (query) => {
    setTemplateSearchQuery(query);
    const filtered = templates.filter(template =>
      template.name.toLowerCase().includes(query.toLowerCase()) ||
      template.category.toLowerCase().includes(query.toLowerCase()) ||
      template.language.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTemplates(filtered);
  };

  function calculateLocalStorageUsage() {
    let totalBytes = 0;

    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const keyBytes = key.length + localStorage.getItem(key).length;
            totalBytes += keyBytes;
        }
    }

    console.log(`Total localStorage usage: ${(totalBytes / 1024).toFixed(2)} KB`);
    return totalBytes;
}

 

    useEffect(() => {
      const fetchBusinessPhoneId = async () => {
        try {
          const response = await axiosInstance.get(`${fastURL}/whatsapp_tenant/`, {
            headers: {
              'X-Tenant-ID': tenantId
            }
          });
          console.log("response: ", response.data.whatsapp_data)
          console.log("bpid ac id at: ", response.data.whatsapp_data[0].access_token, response.data.whatsapp_data[0].business_phone_number_id, response.data.whatsapp_data[0].accountId)
          setBusinessPhoneNumberId(response.data.whatsapp_data[0].business_phone_number_id);
          setAccountId(response.data.whatsapp_data[0].business_account_id);
          setAccessToken(response.data.whatsapp_data[0].access_token)
          return response.data.whatsapp_data;
        } catch (error) {
          console.error('Error fetching business phone ID:', error);
        }
      };
  
      fetchBusinessPhoneId()
      // calculateLocalStorageUsage();
    }, [tenantId]);
  


    const handleEditTemplate = async (template) => {
      setIsEditing(true);
      setSelectedTemplate(template);
      setShowTemplatePopup(true);
      setTemplateName(template.name);
      setCategory(template.category);
      setLanguage(template.language);
      
      const headerComponent = template.components.find(c => c.type === "HEADER");
      if (headerComponent) {
        setHeaderType(headerComponent.format.toLowerCase());
        setHeaderContent(headerComponent.text || headerComponent.example?.header_handle?.[0] || '');
      }
  
      const bodyComponent = template.components.find(c => c.type === "BODY");
      if (bodyComponent) {
        setBodyText(bodyComponent.text);
      }
  
      const footerComponent = template.components.find(c => c.type === "FOOTER");
      if (footerComponent) {
        setFooterText(footerComponent.text);
      }
  
      const buttonsComponent = template.components.find(c => c.type === "BUTTONS");
      if (buttonsComponent) {
        setButtons(buttonsComponent.buttons.map(button => ({ text: button.text })));
      } else {
        setButtons([]);
      }
    };

      const fetchTemplates = useCallback(async () => {
    if (!accessToken || !accountId) return;
    try {
      const url = `https://graph.facebook.com/v20.0/${accountId}/message_templates?fields=name,status,components,language,category`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const formattedTemplates = response.data.data.map(template => ({
        ...template,
        components: template.components.map(component => {
          if (component.type === "BODY") {
            return {
              ...component,
              text: convertMentionsForFrontend(component.text)
            };
          }
          return component;
        })
      }));
      setTemplates(formattedTemplates);
      setFilteredTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, [accessToken, accountId]);


    useEffect(() => {
    console.log("at and ac id: ", accessToken, accountId)
      if (accessToken && accountId) {
        fetchTemplates();
        fetchBroadcastHistory();
      }
    }, [accessToken, accountId, fetchTemplates]);

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        const url = `https://graph.facebook.com/v20.0/${accountId}/message_templates?name=${templateId}`;
        await axios.delete(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        await fetchTemplates(); // Refresh the template list
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };


  const handleSendBroadcast = async () => {
    if (selectedPhones.length === 0 && selectedBCGroups.length === 0) {
      alert("Please select at least one contact or group and enter a message.");
      return;
    }
  
    setIsSendingBroadcast(true);
    
    try {
      // saveGroupToLocalStorage(newGroup);
      console.log("Selected BCGroups: ", selectedBCGroups)
      let bg_id;
      let bg_name;

      const phoneNumbers = [
        ...selectedPhones.map((contact) => {
        return parseInt(contact.phone);
      }),
      ...selectedBCGroups.flatMap((bgId) => {
        const bcg = broadcastGroup.find((bg) => bg.id === bgId);
        bg_id = bcg.id
        bg_name = bcg.name
        return bcg.members.map(member => parseInt(member.phone))
      }) 
    ].filter(Boolean)
  
      const payload = {
        bg_id: bg_id,
        bg_name: bg_name,
        template: {
          id: selectedTemplate.id,
          name: selectedTemplate?.name || "under_name",
        },
        business_phone_number_id: businessPhoneNumberId,
        phoneNumbers: phoneNumbers,
      };

      console.log("Payload: ", payload)
  
      // Send the broadcast message
      const response = await axios.post(`${whatsappURL}/send-template/`, payload,
        {
          headers: {
            'X-Tenant-ID': tenantId // Replace with the actual tenant_id
          }
        }
      );
  
      if (response.status === 200) {
        console.log("Broadcast sent successfully");
        alert("Broadcast message sent successfully!");
        handleCloseBroadcastPopup();

      } else {
        throw new Error("Failed to send broadcast");
      }
  
      // const broadcastMessageObj = { text: broadcastMessage, sender: 'bot' };
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert("Failed to send broadcast message. Please try again.");
    } finally {
      
      setIsSendingBroadcast(false);
    }
  };

  const handleCreateGroup = async () => {
    console.log("selected phones for groups: ", selectedPhones)
    console.log("group name: ", groupName)
    try{
      const members = selectedPhones.map(contact => ({
        phone: contact.phone,
        name: contact.name
      }))
      const payload = {
        members : members,
        id : uuidv4(),
        name: groupName
      };
      const response = await axiosInstance.post(`${fastURL}/broadcast-groups/`, payload,
        {
          headers: {
            'X-Tenant-ID': tenantId
          }
        }
      );

      if (response.status === 200) {
        console.log("Group created successfully");

        alert("Contacts added to group successfully!");
        console.log("Payload: ", payload)
        setBroadcastGroup((prevGroups) => [...prevGroups, payload]);
  
        // Clear selected phones after creating the group
        setSelectedPhones([]);
      } else {
        throw new Error("Failed to send broadcast");
      }
    } catch (error) {
      console.error("Error creating broadcast group:", error);
    }
  }


  const handleCloseBroadcastPopup = () => {
    setShowBroadcastPopup(false);
    setBroadcastMessage('');
    setSelectedPhones([]);
    setSelectedBCGroups([])
    setGroupName('');
    setIsSendingBroadcast(false);
  };

  const handleCloseGroupPopup = () => {
    setShowGroupPopup(false)
    setSelectedPhones([]);
    setSelectedBCGroups([])
    setGroupName('');
  }
  


  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    const components = [];

      if ((headerType === 'text' && headerContent.trim()) || (headerType === 'image' && headerMediaId)) {
        components.push({
          type: "HEADER",
          format: headerType.toUpperCase(),
          text: headerType === 'text' ? headerContent : undefined,
          example: headerType === 'image' ? { header_handle: [headerMediaId] } : undefined,
        });
      }
  
      // components.push({
      //   type: "BODY",
      //   text: convertBodyTextToIndexedFormat(bodyText),
      //   example: {
      //     body_text: [bodyVariables.map(variable => `{{${variable}}}`)]
      //   }
      // });

      const bodyComponent = {
        type: "BODY",
        text: convertBodyTextToIndexedFormat(bodyText),
      };
    
      if (bodyVariables && bodyVariables.length > 0) {
        bodyComponent.example = {
          body_text: [bodyVariables.map(variable => `{{${variable}}}`)]
        };
      }
    
      components.push(bodyComponent);
  
      if (footerText.trim()) {
        components.push({
          type: "FOOTER",
          text: footerText
        });
      }

    // if (footerText) {
    //   components.push({
    //     type: "FOOTER",
    //     text: footerText
    //   });
    // }

    if (buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttons.map(button => {
          switch (button.type) {
            case 'QUICK_REPLY':
              return {
                type: "QUICK_REPLY",
                text: button.text,
              };
            case 'PHONE_NUMBER':
              return {
                type: "PHONE_NUMBER",
                text: button.text,
                phone_number: button.phoneNumber,
              };
            case 'URL':
              return {
                type: "URL",
                text: button.text,
                url: button.url,
              };
            default:
              return null;
          }
        }).filter(Boolean)
      });
    }

    const templateData = {
      name: templateName,
      category: category,
      components: components,
      language: language
    };

    try {
      const url = `https://graph.facebook.com/v20.0/${accountId}/message_templates`;
      
      const response = await axios({
        method: 'post',
        url: url,
        data: templateData,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('Template created/updated:', response.data);
      setShowTemplatePopup(false);
      resetTemplateForm();
      await fetchTemplates();
      setActiveTab('templates');
    } catch (error) {
      console.error('Error creating/updating template:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };


  const fetchTemplateDetails = async (templateId) => {
    try {
      const url = `https://graph.facebook.com/v20.0/${templateId}?fields=name,status,components,language`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setSelectedTemplateDetails(response.data);
    } catch (error) {
      console.error('Error fetching template details:', error);
    }
  };


  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    fetchTemplateDetails(template.id);
  };

  const handleBroadcastMessage = () => {
    setShowBroadcastPopup(true);
  };

  const [showGroupPopup, setShowGroupPopup] = useState(false)

  const handleGroup = () => {
    setShowGroupPopup(true)
  }
  

  
  const resetTemplateForm = () => {
    setTemplateName('');
    setCategory('');
    setLanguage('');
    setHeaderType('text');
    setHeaderContent('');
    setBodyText('');
    setFooterText('');
    setButtons([]);
    setHeaderImage(null);
    setIsEditing(false);
    setSelectedTemplate(null);
  };
  
  const fetchBroadcastHistory = async () => {
    try {
      const response = await axiosInstance.get(`${fastURL}/get-status/`);
      const formattedHistory = formatBroadcastHistory(response.data);
      console.log("Formatted History: ", formattedHistory)
      setBroadcastHistory(formattedHistory);
      setFilteredBroadcastHistory(formattedHistory);
      const cacheKey = tenantId
      // localStorage.setItem(cacheKey, JSON.stringify(formattedHistory))
      // console.log("Local Storage: ", localStorage)
    } catch (error) {
      console.error('Error fetching broadcast history:', error);
    }
  };

  useEffect(() => {
    // const cacheKey = tenantId
    // let history = localStorage.getItem(cacheKey)
    // history = JSON.parse(history)
    // // console.log("Local Storage: ", JSON.parse(history))
    // if(history){
    //   setBroadcastHistory(history);
    //   setFilteredBroadcastHistory(history);
    // }
    // else{
    //   fetchBroadcastHistory()
    // }
  fetchBroadcastHistory()
  },[])

  // const handleDateFilter = () => {
  //   const filtered = broadcastHistory.filter(broadcast => {
  //     const broadcastDate = new Date(broadcast.date);
  //     const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
  //     const toDate = dateTo ? new Date(dateTo) : new Date();
  //     return broadcastDate >= fromDate && broadcastDate <= toDate;
  //   });
  //   setFilteredBroadcastHistory(filtered);
  // };


  const sortContacts = (contactsToSort) => {
    return contactsToSort.sort((a, b) => {
      if (a.hasNewMessage !== b.hasNewMessage) {
        return b.hasNewMessage ? 1 : -1;
      }
      if (a.lastMessageTime !== b.lastMessageTime) {
        return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
      }
      const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
      const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
      return nameA.localeCompare(nameB);
    });
  };

  const formatGroups = async (data) => {
    const groups = {};
    let idCounter = 1;
  
    data.forEach(group => {
      const groupName = group.name
  
      // Initialize the group if it doesn't exist
      // console.log("DOING GROUP: ", groupName)
      if (!groups[groupName]) {
        groups[groupName] = {
          id: group.id, // Increment ID for each new group
          name: groupName,
          contacts: group.members
        };
      }
    });
  
    // Convert the groups object into an array and join contact names with commas
    return Object.values(groups).map(group => ({
      id: group.id,
      name: group.name || null,
      members: group.contacts
    }));
  };


  const fetchContacts = async () => {
    try {
      const broadcastGroupPromise = axiosInstance.get(`${fastURL}/broadcast-groups/`)
      const response = await axiosInstance.get(`${fastURL}/contacts/`, {
        headers: {
          token: localStorage.getItem('token'),
        },
      });
      // Ensure all contacts have the necessary properties
      const processedContacts = response.data.map(contact => ({
        ...contact,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        lastMessageTime: contact.lastMessageTime || null,
        hasNewMessage: contact.hasNewMessage || false
      }));
      setContacts(sortContacts(processedContacts));

      const broadcastGroupResponse = await broadcastGroupPromise
      console.log("Broadcast Group Response: ", broadcastGroupResponse.data)
      const formattedGroups = await formatGroups(broadcastGroupResponse.data)
      console.log("Formatted groups: ", formattedGroups)
      setBroadcastGroup(formattedGroups)
    } catch (error) {
      console.error("Error fetching contacts data:", error);
    }
  };
  useEffect(() => {
    fetchContacts();
  }, []);


  // const formatBroadcastHistory = (messageStatuses) => {
  //   const groupedStatuses = messageStatuses.reduce((acc, status) => {
  //     if (!acc[status.broadcast_group]) {
  //       acc[status.broadcast_group] = [];
  //     }
  //     acc[status.broadcast_group].push(status);
  //     return acc;
  //   }, {});

  //   console.log("grouped status: " ,groupedStatuses)
  
  //   return Object.entries(groupedStatuses).map(([broadcastGroup, statuses]) => ({
  //     id: broadcastGroup,
  //     name: `Broadcast Group ${broadcastGroup}`,
  //     sent: statuses.length,
  //     delivered: statuses.filter(s => s.is_delivered).length,
  //     read: statuses.filter(s => s.is_read).length,
  //     replied: statuses.filter(s => s.is_replied).length,
  //     failed: statuses.filter(s => s.is_failed).length,
  //     date: new Date(statuses[0].timestamp).toLocaleDateString(), // Assuming there's a timestamp field
  //     status: statuses.every(s => s.is_delivered) ? 'Completed' : 'In Progress',
  //     recipients: statuses.map(s => s.user_phone_number)
  //   }));
  // };

  const formatBroadcastHistory = (groupedStatuses) => {
    return Object.entries(groupedStatuses).map(([broadcastGroup, statuses]) => ({
      id: broadcastGroup,
      name: statuses.name || `Broadcast Group ${broadcastGroup}`,
      sent: statuses.sent,
      delivered: statuses.delivered,
      read: statuses.read,
      replied: statuses.replied,
      failed: statuses.failed,
      status: statuses.delivered ? 'Completed' : 'In Progress'
    }));
  }

  const handlePhoneSelection = (contact) => {
    setSelectedPhones(prevSelected => 
      prevSelected.includes(contact)
        ? prevSelected.filter(id => id !== contact)
        : [...prevSelected, contact]
    );
  };

  const handleBCGroupSelection = (bgId) => {
    console.log("Broadcast::::::::", bgId)
    setSelectedBCGroups(prevSelected => 
      prevSelected.includes(bgId)
        ? prevSelected.filter(id => id !== bgId)
        : [...prevSelected, bgId]
    );
  };


 
  const addButton = () => {
    setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }]);
  };


  const updateButton = (index, field, value) => {
    const updatedButtons = buttons.map((button, i) => 
      i === index ? { ...button, [field]: value } : button
    );
    setButtons(updatedButtons);
  };

  const extractVariables = (text) => {
    const regex = /@(\w+)/g;
    const matches = text.match(regex);
    return matches ? matches.map(match => match.slice(1)) : [];
  };

  const convertBodyTextToIndexedFormat = (text) => {
    let indexCounter = 1;
    return text.replace(/@(\w+)/g, () => `{{${indexCounter++}}}`);
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') {
      fetchBroadcastHistory();
      fetchTemplates();
    }
  };
  
  const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Ensure the number starts with a '+'
    if (!digits.startsWith('+')) {
      return '+' + digits;
    }
    
    return digits;
  };

  const deleteButton = (index) => {
    const updatedButtons = buttons.filter((_, i) => i !== index);
    setButtons(updatedButtons);
  };

  const handleImageUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setHeaderImage(selectedFile);
      setHeaderContent(URL.createObjectURL(selectedFile));
  
      try {
        console.log('Uploading file to WhatsApp Media API...');
  
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'image');
        formData.append('messaging_product', 'whatsapp');
  
        const response = await axios.post(
          'https://my-template-whatsapp.vercel.app/uploadMedia',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            },
          }
        );
  
        console.log('File uploaded to WhatsApp, ID:', response.data.body.h);
        setHeaderMediaId(response.data.body.h);
        setUploadProgress(100);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress(0);
      }
    }
  };

  const [tableData, setTableData] = useState([]);

  const handleCellChange = (e, rowIndex, field) => {
    const newData = [...tableData];
    newData[rowIndex][field] = e.target.value;
    setTableData(newData);
  };

  const addRow = () => {
    const newRow = { id: tableData.length + 1, name: "", price: 0 };
    setTableData([...tableData, newRow]);
  };

  const deleteRow = (rowIndex) => {
    const newData = tableData.filter((_, index) => index !== rowIndex);
    setTableData(newData);
  };

  const handleSubmitCatalog  = async (tableData) => {
    console.log("tableDData: ", tableData)
    const response = await  axiosInstance.post('/catalog/', tableData)
    console.log("Response catalog: ", response)
  }

  // console.log("Broadcast Group Data:", broadcastGroup);

  return (
    <div className="bp-broadcast-page">
      <div className="bp-left-sidebar">
      <div className={`bp-menu-item ${activeTab === 'history' ? 'bp-active' : ''}`} onClick={() => handleTabChange('history')}>Broadcast History</div>
      <div className={`bp-menu-item ${activeTab === 'templates' ? 'bp-active' : ''}`} onClick={() => handleTabChange('templates')}>Template Messages</div>
      </div>
      <div className="bp-main-content">
      {activeTab === 'history' && (
        <div className="bp-broadcast-history">
          <h1 style={{fontSize:'36px', fontWeight:'600', fontFamily:'sans-serif'}}>Broadcast History</h1>
          <div className="bp-action-bar">
            <button className="bp-btn-create" onClick={handleBroadcastMessage}>New Broadcast</button>
            
            <button className="bp-btn-create" onClick={handleGroup}>New Group</button>
          </div>
      {showBroadcastPopup && (
  <div className="cb-broadcast-popup">
    <div className="cb-broadcast-content">
      <h2>Broadcast Message</h2>

      <div className="bp-template-actions">
        <select
          value={selectedTemplate?.id || ''}
          onChange={(e) => handleTemplateClick(templates.find(t => t.id === e.target.value))}
        >
          <option value="">Select Template</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <button className="bp-btn-create" onClick={() => setShowTemplatePopup(true)}>Create Template</button>
      </div>
      <div className="cb-broadcast-contact-list">
        <h3>Select Contacts:</h3>
        {contacts.map(contact => (
          <div key={contact.id} className="cb-broadcast-contact-item">
            <input
              type="checkbox"
              id={`contact-${contact.id}`}
              checked={selectedPhones.includes(contact)}
              onChange={() => handlePhoneSelection(contact)}
            />
            <label htmlFor={`contact-${contact.id}`}>
              <span className="cb-broadcast-contact-name">{contact.name}</span>
              <span className="cb-broadcast-contact-phone">({contact.phone})</span>
            </label>
          </div>
        ))}
        {broadcastGroup.map(bg =>{
          console.log("Broadcast group:", bg); // Logs the entire group object
          console.log("Contacts for group:", bg.members); // Specifically logs the contacts field
        
        return (
          <div key={bg.id} className="cb-broadcast-contact-item">
            <input
              type="checkbox"
              id={`broadcast-group-${bg.id}`}
              checked={selectedBCGroups.includes(bg.id)} //selectedBCGroups is an array of int
              onChange={() => handleBCGroupSelection(bg.id)}
            />
            <label htmlFor={`broadcast-group-${bg.id}`}>
              <span className="cb-broadcast-contact-name">{bg.name}</span>
              <span className="cb-broadcast-contact-phone">
              ({bg.members.map((contact) => contact.name).join(', ')})</span>
            </label>
          </div>
        )})}
      </div>
      <div className="cb-broadcast-actions">
        <button
          onClick={handleSendBroadcast}
          disabled={isSendingBroadcast || (selectedPhones.length === 0 && selectedBCGroups.length === 0) || !selectedTemplate }
          className="cb-send-broadcast-btn"
        >
          {isSendingBroadcast ? "Sending..." : "Send Broadcast"}
        </button>
        <button onClick={handleCloseBroadcastPopup} className="cb-cancel-broadcast-btn">Cancel</button>

      </div>
    </div>
  </div>
      )}
      {showGroupPopup && (
  <div className="cb-broadcast-popup">
  <div className="cb-broadcast-content">
    <h2>Create New Group</h2>
    <input
      type="text"
      value={groupName}
      onChange={(e) => setGroupName(e.target.value)}
      placeholder="Enter group name"

      className="cb-group-name-input"
    />
      <h1>Select Contacts:</h1>
    <div className="cb-broadcast-contact-list">
      {contacts.map(contact => (
        <div key={contact.id} className="cb-broadcast-contact-item">
          <input
            type="checkbox"
            id={`contact-${contact.id}`}
            checked={selectedPhones.includes(contact)}
            onChange={() => handlePhoneSelection(contact)}
          />
          <label htmlFor={`contact-${contact.id}`}>
            <span className="cb-broadcast-contact-name">{contact.name}</span>
            <span className="cb-broadcast-contact-phone">({contact.phone})</span>
          </label>
        </div>
      ))}
      </div>
      <h2 style={{textAlign: 'left'}} >Groups:</h2>
    <div className="cb-broadcast-contact-list">
      {broadcastGroup.map(bg =>{
        console.log("Broadcast group:", bg); // Logs the entire group object
      
      return (
        <div key={bg.id} className="cb-broadcast-contact-item">
          <label htmlFor={`broadcast-group-${bg.id}`}>
            <span className="cb-broadcast-contact-name">{bg.name}</span>
            <span className="cb-broadcast-contact-phone">
            ({bg.members.map((contact) => contact.name).join(', ')})</span>
          </label>
        </div>
      )})}
    </div>
    <div className="cb-broadcast-actions">
      <button onClick={handleCloseGroupPopup} className="cb-cancel-broadcast-btn">Cancel</button>
      <button 
      onClick={handleCreateGroup}
      disabled={selectedPhones.length === 0 || selectedBCGroups.length > 0}
      className='cb-create-group-btn'
      >Create Group</button>
    </div>
  </div>
</div>
      )}
          <div className="bp-broadcast-stats">
            <div className="bp-stat-item">
              <span className="bp-stat-value">{broadcastHistory.reduce((sum, b) => sum + b.sent, 0)}</span>
              <span className="bp-stat-label">Sent</span>
            </div>
            <div className="bp-stat-item">
              <span className="bp-stat-value">{broadcastHistory.reduce((sum, b) => sum + b.delivered, 0)}</span>
              <span className="bp-stat-label">Delivered</span>
            </div>
            <div className="bp-stat-item">
              <span className="bp-stat-value">{broadcastHistory.reduce((sum, b) => sum + b.read, 0)}</span>
              <span className="bp-stat-label">Read</span>
            </div>
            <div className="bp-stat-item">
    <span className="bp-stat-value">{broadcastHistory.reduce((sum, b) => sum + b.replied, 0)}</span>
    <span className="bp-stat-label">Replied</span>
  </div>
  <div className="bp-stat-item">
    <span className="bp-stat-value">{broadcastHistory.reduce((sum, b) => sum + b.failed, 0)}</span>
    <span className="bp-stat-label">Failed</span>
  </div>
          </div>
          <div className="bp-broadcast-list">
          <table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Sent</th>
      <th>Delivered</th>
      <th>Read</th>
      <th>Replied</th>
      <th>Failed</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {filteredBroadcastHistory.map(broadcast => (
      <tr key={broadcast.id}>
        <td>{broadcast.name}</td>
        <td>{broadcast.sent}</td>
        <td>{broadcast.delivered}</td>
        <td>{broadcast.read}</td>
        <td>{broadcast.replied}</td>
        <td>{broadcast.failed}</td>
        {/* <td>{broadcast.date}</td> */}
        <td><span className={`bp-status bp-${broadcast.status.toLowerCase().replace(' ', '-')}`}>{broadcast.status}</span></td>
      </tr>
    ))}
  </tbody>
</table>
          </div>
        </div>
      )}
      {activeTab === 'templates' && (
        <div className="bp-template-messages">
          <h1 style={{fontSize:'36px', fontWeight:'600', fontFamily:'sans-serif'}}>Template Messages</h1>
          <button className="bp-btn-create" onClick={() => {
            resetTemplateForm();
            setShowTemplatePopup(true);
          }}>Create Template</button>
          <div className="bp-template-list">
            {templates.map((template, index) => (
              <div key={index} className="bp-template-item">
                <h3>{template.name}</h3>
                <p className={`bp-status-${template.status.toLowerCase()}`}>
                  Status: {template.status}
                </p>
                <p>Category: {template.category}</p>
                <p>Language: {template.language}</p>
                <p>Body: {template.components.find(c => c.type === "BODY")?.text.substring(0, 50)}...</p>
                {template.components.find(c => c.type === "BUTTONS") && (
                  <p>Buttons: {template.components.find(c => c.type === "BUTTONS").buttons.length}</p>
                )}
                <div className="bp-template-actions">
                  <button onClick={() => handleEditTemplate(template)} className="bp-btn-edit">
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTemplate(template.name)} className="bp-btn-delete">
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      {showTemplatePopup && (
        <div className="bp-popup-overlay">
          <div className="bp-popup bp-template-popup">
            <h2>{isEditing ? 'Edit' : 'Create'} WhatsApp Template Message</h2>
            <div className="bp-template-form-container">
              <form onSubmit={handleCreateTemplate}>
                <div className="bp-form-group">
                  <label>Template Name</label>
                  <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} required />
                </div>
                <div className="bp-form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select category...</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
                <div className="bp-form-group">
                  <label>Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
                    <option value="">Select language...</option>
                    <option value="en_US">English (US)</option>
                    <option value="es_ES">Spanish (Spain)</option>
                  </select>
                </div>
                <div className="bp-form-group">
                  <label>Header (Optional)</label>
                  <select value={headerType} onChange={(e) => setHeaderType(e.target.value)}>
                    <option value="">No header</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                  {headerType === 'text' && (
                    <input
                      type="text"
                      value={headerContent}
                      onChange={(e) => setHeaderContent(e.target.value)}
                      placeholder="Header Text"
                    />
                  )}
                  {headerType === 'image' && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                      />
                      <button type="button" onClick={() => fileInputRef.current.click()} className="bp-btn-upload">
                        Upload Image
                      </button>
                      {headerImage && <span className="bp-file-name">{headerImage.name}</span>}
                      {uploadProgress > 0 && <progress value={uploadProgress} max="100" className="bp-upload-progress" />}
                    </>
                  )}
                </div>
                <div className="bp-form-group">
                  <label>Body Text</label>
                  <MentionTextArea
                    value={convertMentionsForFrontend(bodyText)}
                    onChange={(e) => {
                      setBodyText(e.target.value);
                      setBodyVariables(extractVariables(e.target.value));
                    }}
                    placeholder="Use @name, @phoneno, etc. for variables"
                  />
                </div>
                <div className="bp-form-group">
                  <label>Footer (Optional)</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Footer Text"
                  />
                </div>
                <div className="bp-form-group">
                  <label>Buttons (Optional)</label>
                  {buttons.map((button, index) => (
                    <div key={index} className="bp-button-inputs">
                      <select
                        value={button.type}
                        onChange={(e) => updateButton(index, 'type', e.target.value)}
                      >
                        <option value="QUICK_REPLY">Quick Reply</option>
                        <option value="PHONE_NUMBER">Phone Number</option>
                        <option value="URL">URL</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Button Text"
                        value={button.text}
                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                      />
                      {button.type === 'PHONE_NUMBER' && (
                        <input
                          type="tel"
                          placeholder="Phone Number (e.g., +1 555 123 4567)"
                          value={button.phoneNumber}
                          onChange={(e) => updateButton(index, 'phoneNumber', e.target.value)}
                        />
                      )}
                      {button.type === 'URL' && (
                        <input
                          type="url"
                          placeholder="URL"
                          value={button.url}
                          onChange={(e) => updateButton(index, 'url', e.target.value)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => deleteButton(index)}
                        className="bp-btn-delete-button"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addButton} className="bp-btn-add-button">Add Button</button>
                </div>
                <div className="bp-form-actions">
                  <button type="submit" className="bp-btn-save">
                    {isEditing ? 'Update' : 'Save'} Template
                  </button>
                  <button type="button" className="bp-btn-cancel" onClick={() => {
                    setShowTemplatePopup(false);
                    resetTemplateForm();
                  }}>Cancel</button>
                </div>
              </form>
              <div className="bp-template-preview">
                <div className="bp-whatsapp-preview">
                  <h3>WhatsApp Template Preview</h3>
                  <div className="bp-message-container">
                    {headerType === 'text' && headerContent && (
                      <div className="bp-message-header">{headerContent}</div>
                    )}
                    {headerType === 'image' && headerContent && (
                      <img src={headerContent} alt="Header" className="bp-message-header-image" />
                    )}
                    <div className="bp-message-body">
                      {convertMentionsForFrontend(bodyText)}
                    </div>
                    {footerText && <div className="bp-message-footer">{footerText}</div>}
                    {buttons.length > 0 && (
                      <div className="bp-message-buttons">
                        {buttons.map((button, index) => (
                          <a key={index} href={button.url} className="bp-message-button">
                            {button.text}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="bp-message-time">1:10 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastPage;