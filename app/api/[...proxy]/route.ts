import { NextRequest, NextResponse } from 'next/server';

const TARGET_HOST = "20.207.122.201";
const TARGET_IP = "[64:ff9b::14cf:7ac9]";

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ proxy: string[] }> }) {
    try {
        const resolvedParams = await params;
        const pathSegments = resolvedParams.proxy;
        const path = pathSegments.join('/');
        
        // Extract query parameters
        const url = new URL(request.url);
        const searchParams = url.searchParams.toString();
        const queryString = searchParams ? `?${searchParams}` : '';

        // Construct target URL using the NAT64 IPv6 address to ensure Node.js can route it
        const targetUrl = `http://${TARGET_IP}/evaluation-service/${path}${queryString}`;

        // Prepare headers, explicitly overriding the Host header
        const headers = new Headers(request.headers);
        headers.set('Host', TARGET_HOST);
        
        // Remove Next.js internal headers that might interfere
        headers.delete('x-forwarded-for');
        headers.delete('x-forwarded-host');
        headers.delete('x-forwarded-proto');
        headers.delete('connection');

        const fetchOptions: RequestInit = {
            method: request.method,
            headers,
            redirect: 'manual',
            cache: 'no-store',
        };

        // Only include body if it's not a GET/HEAD request
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const body = await request.text();
            if (body) {
                fetchOptions.body = body;
            }
        }

        const response = await fetch(targetUrl, fetchOptions);
        
        // Read the response body
        const responseData = await response.text();

        // Forward response headers
        const responseHeaders = new Headers(response.headers);
        // Clean up headers that might cause issues when proxied
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('transfer-encoding');

        return new NextResponse(responseData, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (error: any) {
        console.error("API Proxy Error:", error.message);
        return NextResponse.json({ error: "Internal Proxy Error", details: error.message }, { status: 500 });
    }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
