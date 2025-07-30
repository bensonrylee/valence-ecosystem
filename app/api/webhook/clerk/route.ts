import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('Clerk webhook event:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, username, phone_numbers } = evt.data;

    console.log('User event:', {
      id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim(),
    });

    // Here you would sync the user data to your database
    // For example, creating or updating a user record in Firebase/Supabase
    // 
    // Example:
    // await createOrUpdateUser({
    //   clerkId: id,
    //   email: email_addresses?.[0]?.email_address,
    //   name: `${first_name || ''} ${last_name || ''}`.trim(),
    //   imageUrl: image_url,
    //   username,
    //   phoneNumber: phone_numbers?.[0]?.phone_number,
    // });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    console.log('User deleted:', id);
    
    // Here you would handle user deletion
    // For example, anonymizing or deleting user data
  }

  return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
}