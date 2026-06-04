import { Link } from "react-router-dom";
import { useOrdersQuery } from "@/hooks/useOrdersQuery";

const OrdersPage = () => {
  const { data: orders = [], isLoading } = useOrdersQuery();

  return (
    <div className="container-premium py-8 lg:py-12">
      <h1 className="font-display text-3xl font-bold mb-6">My Orders</h1>
      {isLoading ? (
          <div>Loading orders...</div>
      ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.createdAt} · {order.items?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${order.totalAmount?.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : order.status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default OrdersPage;
