addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method === 'POST') {
        const formData = await request.formData();
        const ipfsCID = formData.get('ipfsCID');

        if (!ipfsCID) {
            return new Response('Invalid input. Please provide an IPFS CID.', {
                status: 400,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        try {
            const mongoDBEndpoint = MONGODB_ENDPOINT;
            const payload = {
                collection: COLLECTION_NAME,
                database: DATABASE_NAME,
                dataSource: DATA_SOURCE_NAME,
                document: { ipfsCID }
            };

            const mongoResponse = await fetch(`${mongoDBEndpoint}/action/insertOne`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Headers': '*',
                    'api-key': API_KEY
                },
                body: JSON.stringify(payload)
            });

            const mongoResult = await mongoResponse.json();

            if (mongoResponse.ok) {
                return new Response(`IPFS CID stored successfully: ${JSON.stringify(mongoResult)}`, {
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            } else {
                console.error('MongoDB Error:', mongoResult);
                return new Response('Failed to store the IPFS CID in MongoDB.', {
                    status: 500,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }
        } catch (error) {
            console.error('MongoDB Error:', error);
            return new Response('Failed to store the IPFS CID in MongoDB.', {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }
    } else if (request.method === 'OPTIONS') {
        return handleCORS(request);
    } else {
        return new Response('Please send a POST request.', {
            status: 400,
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
