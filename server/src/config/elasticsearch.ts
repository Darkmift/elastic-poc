import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200',
});

// Test the connection
async function testConnection() {
  try {
    const info = await client.info();
    console.log('ElasticSearch connected successfully');
    console.log('Cluster name:', info.cluster_name);
    console.log('Cluster version:', info.version.number);
  } catch (error) {
    console.error('Error connecting to ElasticSearch:', error);
  }
}

export { client, testConnection }; 