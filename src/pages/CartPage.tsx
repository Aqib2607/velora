import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
              <Link to={`/product/${item.product.id}`}>
                <img src={item.product.image} alt={item.product.name} className="h-24 w-24 rounded-lg object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.id}`}>
                  <h3 className="font-medium truncate hover:text-primary transition-colors">{item.product.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">{item.product.seller}</p>
                <p className="font-bold mt-1">${item.product.price.toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-destructive hover:opacity-70 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{total > 50 ? "Free" : "$5.99"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${(total * 0.08).toFixed(2)}</span></div>
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${(total + (total > 50 ? 0 : 5.99) + total * 0.08).toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-4 w-full flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
