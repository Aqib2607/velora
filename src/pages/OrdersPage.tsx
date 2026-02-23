import { Link } from "react-router-dom";
import { mockOrders } from "@/data/mock";

const OrdersPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <p className="font-medium">{order.id}</p>
              <p className="text-sm text-muted-foreground">{order.date} · {order.items} items</p>
            </div>
            <div className="text-right">
              <p className="font-bold">${order.total.toFixed(2)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : order.status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
