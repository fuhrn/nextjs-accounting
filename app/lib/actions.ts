// By adding the 'use server', you mark all the exported functions within the file as server functions.
// These server functions can then be imported into Client and Server components,
// making them extremely versatile.
// You can also write Server Actions directly inside Server Components by adding "use server" inside the action.
// But for this course, we'll keep them all organized in a separate file.
// Behind the scenes, Server Actions create a POST API endpoint. This is why you
// don't need to create API endpoints manually when using Server Actions.
'use server';

// In your actions.ts file, import Zod and define a schema that matches the shape of your form object. This schema will validate
// the formData before saving it to a database.
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// FormSchema is a Zod schema that matches the shape of the form data defined
// in app/lib/definitions.ts. It's used to validate the form data before saving it to the database.
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// Inspired by TypeScript's built-in Pick and Omit utility types, all Zod object schemas
// have.pick and.omit methods that return a modified version.
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// You can then pass your rawFormData to CreateInvoice to validate the types:
export async function createInvoice(formData: FormData) {
  // CreateInvoice no valida id y date. El id no se valida porque es un campo que se genera automáticamente en la base de datos.
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // It's usually good practice to store monetary values in cents in your database to eliminate JavaScript
  // floating - point errors and ensure greater accuracy.
  const amountInCents = amount * 100;

  // Finally, let's create a new date with the format "YYYY-MM-DD" for the invoice's creation date:
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');

  // Test it out:
  // console.log(rawFormData);
}

// UPDATE INVOICE
// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// DELETE INVOICE
// Since this action is being called in the /dashboard/invoices path, you don't need to call redirect. 
// Calling revalidatePath will trigger a new server request and re - render the table.
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
