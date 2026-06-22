import { getAdminCustomers, toggleCustomerBlock } from "@/actions/admin/management";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = { title: "Manage Customers" };

interface CustomersPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const { search } = await searchParams;
  const customers = await getAdminCustomers(search);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      <form className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name, email, or phone..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Orders</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b">
                <td className="p-3 font-medium">{customer.name}</td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.phone || "-"}</td>
                <td className="p-3">{customer._count.orders}</td>
                <td className="p-3">{format(new Date(customer.createdAt), "dd MMM yyyy")}</td>
                <td className="p-3">
                  <Badge variant={customer.isBlocked ? "destructive" : "default"}>
                    {customer.isBlocked ? "Blocked" : "Active"}
                  </Badge>
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      await toggleCustomerBlock(customer.id);
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm">
                      {customer.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
