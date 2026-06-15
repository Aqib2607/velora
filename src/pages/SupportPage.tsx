import { LifeBuoy, Send, MessageSquare } from "lucide-react";
import { useState } from "react";

const SupportPage = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Real implementation would POST to /v1/support/tickets
  };

  return (
    <div className="container-premium py-8 lg:py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="h-16 w-16 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
          <LifeBuoy className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">How can we help you?</h1>
        <p className="text-muted-foreground">Submit a support ticket and our team will get back to you within 24 hours.</p>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-10 text-center">
          <div className="h-12 w-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Ticket Submitted</h2>
          <p className="text-muted-foreground mb-6">Your ticket ID is #TCK-8829. We've sent a confirmation email.</p>
          <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 border border-border rounded-xl font-semibold hover:bg-muted/50 transition-colors">
            Submit Another Ticket
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input 
                type="text" 
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none"
              >
                <option value="low">Low - General Question</option>
                <option value="normal">Normal - Issue with an order</option>
                <option value="high">High - Payment or access issue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Detailed Message
              </label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Please provide as much detail as possible..."
                className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none resize-none"
              />
            </div>

            <button type="submit" className="w-full py-4 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm">
              <Send className="h-4 w-4" /> Submit Ticket
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
