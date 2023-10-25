addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    try {
        if (request.method === 'OPTIONS') {
            return handleCORS(request);
        } else if (request.method === 'POST') {
            const formData = await request.formData();
            const ipfsCID = formData.get('ipfsCID');

            if (!ipfsCID) {
                return new Response('IPFS hash not provided.', {
                    status: 400,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }

            // MongoDB Atlas Data API Details
            const dataApiUrl = `https://us-east-2.aws.data.mongodb-api.com/app/data-uucwm//endpoint/data/v1/action/insertOne`;
            const clusterName = '<your-cluster-name>';
            const databaseName = '<your-database-name>';
            const collectionName = '<your-collection-name>';
            const dataApiKey = '<your-data-api-key>';

            const documentToInsert = {
                ipfsCID: ipfsCID,
                // ... any other fields you want to insert ...
            };

            const responseFromMongoDB = await fetch(dataApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Headers': '*',
                    'api-key': dataApiKey,
                },
                body: JSON.stringify({
                    collection: collectionName,
                    database: databaseName,
                    dataSource: clusterName,
                    document: documentToInsert,
                }),
            });

            if (!responseFromMongoDB.ok) {
                console.error('Failed to insert document into MongoDB Atlas');
                return new Response('Failed to process the request.', {
                    status: 500,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }

            // If you reach this point, the document has been successfully inserted
            return new Response('IPFS CID and other data saved successfully!', {
                status: 200,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });

        } else {
            return new Response('Please send a POST request.', {
                status: 400,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }
    } catch (error) {
        console.error(error);
        return new Response('Failed to process the request.', {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}

function handleCORS(request) {
    let headers = request.headers;

    if (
        headers.get("Origin") !== null &&
        headers.get("Access-Control-Request-Method") !== null &&
        headers.get("Access-Control-Request-Headers") !== null
    ) {
        let respHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": headers.get("Access-Control-Request-Headers"),
            "Access-Control-Max-Age": "86400",
        }

        return new Response(null, { headers: respHeaders });
    } else {
        return new Response('CORS header check failed', { status: 400 });
    }
}
