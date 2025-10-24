// MongoDB initialization script for Docker
db = db.getSiblingDB('ktpm_ecommerce');

// Create collections
db.createCollection('users');
db.createCollection('shops');
db.createCollection('items');
db.createCollection('orders');
db.createCollection('drones');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.shops.createIndex({ "ownerId": 1 });
db.items.createIndex({ "shopId": 1 });
db.items.createIndex({ "category": 1 });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.drones.createIndex({ "status": 1 });

print('Database initialized successfully!');
