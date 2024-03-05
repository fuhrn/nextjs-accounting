// Notice how it's similar to your /create invoice page, except it imports a different form
// (from the edit - form.tsx file).
import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';

// This form should be pre-populated with a defaultValue for the customer's name, invoice amount, and status.
// To pre - populate the form fields, you need to fetch the specific invoice using id.
// In addition to searchParams (ejemplo: ?query=Lee ), page components also accept a prop called params which you can use to access the id.
// Update your < Page > component to receive the prop: con esto obtengo el id de la factura
export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  // obtengo ambos valores, invoice and customers, al mismo tiempo, en paralelo. Al Form llegan ambos valores juntos.
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
