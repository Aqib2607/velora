import { LineChart, BarChart2, DollarSign, TrendingUp } from "lucide-react";

const AdminReports = () => {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Financial Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform revenue and seller analytics</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-foreground text-background font-semibold text-sm shadow-sm hover:opacity-90">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 h-96 flex flex-col">
          <h2 className="font-semibold flex items-center gap-2 mb-4"><LineChart className="h-5 w-5" /> Revenue Over Time</h2>
          <div className="flex-1 bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border">
            <p className="text-muted-foreground font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Chart Visualization Rendered Here</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <p className="text-sm text-muted-foreground mb-1">Total GMV (YTD)</p>
            <p className="font-display text-3xl font-bold">$1,284,500.00</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <BarChart2 className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-muted-foreground mb-1">Total Commission</p>
            <p className="font-display text-3xl font-bold">$64,225.00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
