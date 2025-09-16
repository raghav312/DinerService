const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Check if CosmosDB emulator is configured
if (!process.env.COSMOS_ENDPOINT || !process.env.COSMOS_KEY) {
  console.error('❌ CosmosDB configuration missing!');
  console.log('📋 Please ensure the following:');
  console.log('   1. CosmosDB Emulator is installed and running');
  console.log('   2. Emulator is accessible at https://localhost:8081');
  console.log('   3. Environment variables are properly set in backend/.env');
  console.log('');
  console.log('🔧 To start CosmosDB Emulator:');
  console.log('   - Windows: Search for "Azure Cosmos DB Emulator" and start it');
  console.log('   - Or download from: https://aka.ms/cosmosdb-emulator');
  process.exit(1);
}

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
  connectionPolicy: {
    enableEndpointDiscovery: false,
    requestTimeout: 10000
  }
});

const databaseId = process.env.COSMOS_DATABASE_ID;

// Container configurations
const containers = [
  { id: 'customers', partitionKey: '/id' },
  { id: 'menuItems', partitionKey: '/id' },
  { id: 'orders', partitionKey: '/id' },
  { id: 'orderItems', partitionKey: '/orderId' },
  { id: 'staff', partitionKey: '/id' },
  { id: 'logs', partitionKey: '/id' }
];

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to CosmosDB...');
    console.log(`📍 Endpoint: ${process.env.COSMOS_ENDPOINT}`);
    
    // Test connection first
    await client.getDatabaseAccount();
    console.log('✅ CosmosDB connection successful');
    
    console.log('🔄 Initializing database...');
    // Create database if it doesn't exist
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    console.log(`✅ Database ${databaseId} ready`);

    // Create containers if they don't exist
    for (const containerConfig of containers) {
      const { container } = await database.containers.createIfNotExists({
        id: containerConfig.id,
        partitionKey: containerConfig.partitionKey
      });
      console.log(`✅ Container ${containerConfig.id} ready`);
    }

    console.log('🎉 Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🔧 CosmosDB Emulator Connection Failed');
      console.log('📋 Please ensure:');
      console.log('   1. Azure CosmosDB Emulator is installed and running');
      console.log('   2. Emulator is accessible at https://localhost:8081');
      console.log('   3. Windows Firewall allows the connection');
      console.log('');
      console.log('💡 To start CosmosDB Emulator:');
      console.log('   - Press Windows key and search "Azure Cosmos DB Emulator"');
      console.log('   - Or download from: https://aka.ms/cosmosdb-emulator');
      console.log('   - Wait for it to fully start (may take a few minutes)');
      console.log('');
    } else {
      console.error('Error details:', error.message);
    }
    
    throw error;
  }
}

function getContainer(containerId) {
  return client.database(databaseId).container(containerId);
}

module.exports = {
  client,
  initializeDatabase,
  getContainer
};