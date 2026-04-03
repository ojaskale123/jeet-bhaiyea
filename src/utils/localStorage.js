// LocalStorage utility functions for Wholesale Shop Management

// Initialize default data
export const initializeData = () => {
  // Initialize users if not exists
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      { id: '1', username: 'owner', password: '1234', role: 'OWNER', createdAt: new Date().toISOString() },
      { id: '2', username: 'manager', password: '1234', role: 'MANAGER', createdAt: new Date().toISOString() },
      { id: '3', username: 'worker', password: '1234', role: 'WORKER', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  // Initialize products if not exists
  if (!localStorage.getItem('products')) {
    const defaultProducts = [
      { id: '1', name: 'Rice 25kg', sku: 'RICE-25', buyPrice: 1200, sellPrice: 1500, quantity: 50, category: 'Grains', minStock: 10, createdAt: new Date().toISOString() },
      { id: '2', name: 'Wheat Flour 10kg', sku: 'WHEAT-10', buyPrice: 350, sellPrice: 450, quantity: 80, category: 'Grains', minStock: 15, createdAt: new Date().toISOString() },
      { id: '3', name: 'Sugar 50kg', sku: 'SUGAR-50', buyPrice: 2000, sellPrice: 2500, quantity: 30, category: 'Sweeteners', minStock: 5, createdAt: new Date().toISOString() },
      { id: '4', name: 'Cooking Oil 5L', sku: 'OIL-5L', buyPrice: 700, sellPrice: 850, quantity: 3, category: 'Oils', minStock: 5, createdAt: new Date().toISOString() },
      { id: '5', name: 'Tea Leaves 1kg', sku: 'TEA-1K', buyPrice: 250, sellPrice: 320, quantity: 0, category: 'Beverages', minStock: 5, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('products', JSON.stringify(defaultProducts));
  }

  // Initialize customers if not exists
  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify([]));
  }

  // Initialize repairs if not exists
  if (!localStorage.getItem('repairs')) {
    localStorage.setItem('repairs', JSON.stringify([]));
  }

  // Initialize sales if not exists
  if (!localStorage.getItem('sales')) {
    localStorage.setItem('sales', JSON.stringify([]));
  }

  // Initialize categories if not exists
  if (!localStorage.getItem('categories')) {
    const defaultCategories = ['Grains', 'Oils', 'Sweeteners', 'Beverages', 'Dairy', 'Spices', 'Snacks', 'Others'];
    localStorage.setItem('categories', JSON.stringify(defaultCategories));
  }
};

// User functions
export const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const addUser = (user) => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const deleteUser = (userId) => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  localStorage.setItem('users', JSON.stringify(filtered));
};

export const authenticateUser = (username, password) => {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// Product functions
export const getProducts = () => {
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
};

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  localStorage.setItem('products', JSON.stringify(products));
  return newProduct;
};

export const updateProduct = (productId, updates) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    localStorage.setItem('products', JSON.stringify(products));
    return products[index];
  }
  return null;
};

export const deleteProduct = (productId) => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  localStorage.setItem('products', JSON.stringify(filtered));
};

export const getProductBySku = (sku) => {
  const products = getProducts();
  return products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
};

// Sales functions
export const getSales = () => {
  const sales = localStorage.getItem('sales');
  return sales ? JSON.parse(sales) : [];
};

export const addSale = (sale) => {
  const sales = getSales();
  const newSale = {
    ...sale,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  sales.push(newSale);
  localStorage.setItem('sales', JSON.stringify(sales));
  return newSale;
};

// Category functions
export const getCategories = () => {
  const categories = localStorage.getItem('categories');
  return categories ? JSON.parse(categories) : [];
};

export const addCategory = (category) => {
  const categories = getCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    localStorage.setItem('categories', JSON.stringify(categories));
  }
};

// Stats functions
export const getStats = () => {
  const products = getProducts();
  const sales = getSales();
  
  return {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.quantity, 0),
    lowStock: products.filter(p => p.quantity > 0 && p.quantity < (p.minStock || 5)).length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0)
  };
};


// Customer functions
export const getCustomers = () => {
  const customers = localStorage.getItem('customers');
  return customers ? JSON.parse(customers) : [];
};

export const addCustomer = (customer) => {
  const customers = getCustomers();
  const existingCustomer = customers.find(c => c.phone === customer.phone);
  
  if (existingCustomer) {
    return existingCustomer;
  }
  
  const newCustomer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    totalPurchases: 0,
    totalSpent: 0
  };
  customers.push(newCustomer);
  localStorage.setItem('customers', JSON.stringify(customers));
  return newCustomer;
};

export const updateCustomer = (customerId, updates) => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customerId);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updates };
    localStorage.setItem('customers', JSON.stringify(customers));
    return customers[index];
  }
  return null;
};

export const getCustomerByPhone = (phone) => {
  const customers = getCustomers();
  return customers.find(c => c.phone === phone);
};

// Repair functions
export const getRepairs = () => {
  const repairs = localStorage.getItem('repairs');
  return repairs ? JSON.parse(repairs) : [];
};

export const addRepair = (repair) => {
  const repairs = getRepairs();
  const newRepair = {
    ...repair,
    id: 'R' + Date.now().toString(),
    status: 'Received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  repairs.push(newRepair);
  localStorage.setItem('repairs', JSON.stringify(repairs));
  return newRepair;
};

export const updateRepair = (repairId, updates) => {
  const repairs = getRepairs();
  const index = repairs.findIndex(r => r.id === repairId);
  if (index !== -1) {
    repairs[index] = { 
      ...repairs[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('repairs', JSON.stringify(repairs));
    return repairs[index];
  }
  return null;
};

export const deleteRepair = (repairId) => {
  const repairs = getRepairs();
  const filtered = repairs.filter(r => r.id !== repairId);
  localStorage.setItem('repairs', JSON.stringify(filtered));
};

// Add stock to existing product
export const addStockToProduct = (productId, quantityToAdd) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products[index].quantity += quantityToAdd;
    products[index].lastStockUpdate = new Date().toISOString();
    localStorage.setItem('products', JSON.stringify(products));
    return products[index];
  }
  return null;
};
