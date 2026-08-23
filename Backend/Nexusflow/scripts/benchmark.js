const axios = require('axios');

const API_URL = 'http://localhost:3000/api/telemetry/bulk';
const BATCH_SIZE = 1000;
const TOTAL_RECORDS = 5000;

async function runBenchmark() {
    console.log(`Starting benchmark: Sending ${TOTAL_RECORDS} records to ${API_URL}...`);
    
    const data = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
        data.push({
            sensorId: 'sensor-1',
            sensorType: 'sensorTurbine',
            value: Math.random() * 100,
            metadata: { location: 'Factory Floor 1' }
        });
    }

    const start = Date.now();
    let sent = 0;

    try {
        while (sent < TOTAL_RECORDS) {
            await axios.post(API_URL, data);
            sent += BATCH_SIZE;
            console.log(`Sent ${sent}/${TOTAL_RECORDS}...`);
        }
        const end = Date.now();
        const duration = (end - start) / 1000;
        console.log(`\n✅ Benchmark Complete!`);
        console.log(`Total Records: ${TOTAL_RECORDS}`);
        console.log(`Time taken: ${duration} seconds`);
        console.log(`Throughput: ${(TOTAL_RECORDS / duration).toFixed(2)} writes/sec`);

    } catch (err) {
        console.error('Error during benchmark:', err.message);
    }
}

runBenchmark();
