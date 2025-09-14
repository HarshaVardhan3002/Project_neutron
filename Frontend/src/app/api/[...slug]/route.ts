/**
 * @fileoverview A catch-all API route that proxies requests to the backend API.
 * This is a crucial part of the architecture for several reasons:
 * 1.  **CORS Prevention**: The browser will make requests to the same domain (`/api/...`),
 *     avoiding cross-origin issues.
 * 2.  **Hides Backend URL**: The actual backend URL is kept secret in environment variables
 *     on the server.
 * 3.  **Centralized Logic**: Allows for adding authentication, logging, or other middleware
 *     to all outgoing requests in one place.
 */
import { type NextRequest } from 'next/server';

/**
 * Handles all HTTP methods and forwards them to the backend API.
 * It dynamically constructs the target URL based on the incoming request's path.
 *
 * @param {NextRequest} req - The incoming Next.js request object.
 * @param {{ params: Promise<{ slug: string[] }> }} context - The context object containing the dynamic route parameters.
 * @returns {Promise<Response>} A promise that resolves to the response from the backend API.
 */
async function handler(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  // Reconstruct the path from the slug parameter.
  const path = resolvedParams.slug.join('/');
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    return new Response(JSON.stringify({ message: 'Backend API URL is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Append query parameters if they exist.
  const url = new URL(`${backendUrl}/${path}${req.nextUrl.search}`);

  // Create a new request to the backend, forwarding the method, headers, and body.
  const response = await fetch(url.toString(), {
    method: req.method,
    headers: req.headers, // Forward original headers
    body: req.body,
    // `duplex` is required by fetch to handle request bodies in certain environments (like Next.js middleware).
    // @ts-ignore
    duplex: 'half',
  });

  // Return the response from the backend directly to the client.
  return response;
}

// Export handlers for all common HTTP methods.
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
