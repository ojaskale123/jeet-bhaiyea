import templates from './whatsappTemplates.json';

// Shop configuration
const SHOP_CONFIG = {
  name: 'Your Shop Name',
  phone: '+91XXXXXXXXXX'
};

export const setShopConfig = (name, phone) => {
  localStorage.setItem('shopConfig', JSON.stringify({ name, phone }));
};

export const getShopConfig = () => {
  const config = localStorage.getItem('shopConfig');
  return config ? JSON.parse(config) : SHOP_CONFIG;
};

// Generate WhatsApp message from template
export const generateMessage = (templateKey, variables) => {
  const template = templates[templateKey];
  if (!template) return '';
  
  const shopConfig = getShopConfig();
  let message = template.template;
  
  // Replace all variables
  const allVariables = {
    ...variables,
    shopName: shopConfig.name
  };
  
  Object.keys(allVariables).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    message = message.replace(regex, allVariables[key]);
  });
  
  return message;
};

// Open WhatsApp Web with pre-filled message
export const sendWhatsAppMessage = (phoneNumber, message) => {
  // Remove any non-numeric characters from phone
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp Web URL
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  
  // Open in new window
  window.open(whatsappUrl, '_blank');
};

// Template helpers
export const sendRepairReceivedMessage = (customer, repair) => {
  const message = generateMessage('repairReceived', {
    customerName: customer.name,
    deviceDetails: repair.deviceDetails,
    repairId: repair.id
  });
  sendWhatsAppMessage(customer.phone, message);
};

export const sendWorkerAssignedMessage = (customer, repair, workerName) => {
  const message = generateMessage('workerAssigned', {
    customerName: customer.name,
    workerName: workerName,
    deviceDetails: repair.deviceDetails,
    repairId: repair.id
  });
  sendWhatsAppMessage(customer.phone, message);
};

export const sendDeviceReadyMessage = (customer, repair) => {
  const message = generateMessage('deviceReady', {
    customerName: customer.name,
    deviceDetails: repair.deviceDetails,
    repairId: repair.id
  });
  sendWhatsAppMessage(customer.phone, message);
};

export const sendDeviceDeliveredMessage = (customer) => {
  const message = generateMessage('deviceDelivered', {
    customerName: customer.name
  });
  sendWhatsAppMessage(customer.phone, message);
};

export const sendPurchaseThankYouMessage = (customer, amount, itemCount) => {
  const message = generateMessage('purchaseComplete', {
    customerName: customer.name,
    amount: amount.toLocaleString('en-IN'),
    itemCount: itemCount
  });
  sendWhatsAppMessage(customer.phone, message);
};
