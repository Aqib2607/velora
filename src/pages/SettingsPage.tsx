import { Bell, Lock, Shield, Eye, Database } from "lucide-react";
import { useState } from "react";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    order_updates: true,
    promotions: false,
    two_factor_auth: false,
    public_profile: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleGDPRExport = () => {
    alert("GDPR data export initiated. You will receive an email shortly with your data archive.");
  };

  const handleDeleteAccount = () => {
    const conf = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (conf) {
      alert("Account deletion request submitted. Support will contact you shortly.");
    }
  };

  return (
    <div className="container-premium py-8 lg:py-12 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { id: 'email_notifications', label: 'Email Notifications', desc: 'Receive daily updates and alerts via email.' },
              { id: 'sms_notifications', label: 'SMS Notifications', desc: 'Receive critical alerts via SMS.' },
              { id: 'order_updates', label: 'Order Updates', desc: 'Get notified when order status changes.' },
              { id: 'promotions', label: 'Promotional Offers', desc: 'Receive exclusive deals and discounts.' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <button 
                  onClick={() => handleToggle(item.id as keyof typeof settings)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[item.id as keyof typeof settings] ? 'bg-foreground' : 'bg-muted-foreground/30'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${settings[item.id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy & Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div>
                <p className="font-medium flex items-center gap-2"><Lock className="h-4 w-4" /> Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
              <button onClick={() => handleToggle('two_factor_auth')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.two_factor_auth ? 'bg-green-500' : 'bg-muted-foreground/30'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${settings.two_factor_auth ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
              <div>
                <p className="font-medium flex items-center gap-2"><Eye className="h-4 w-4" /> Public Profile</p>
                <p className="text-sm text-muted-foreground">Allow others to view your public wishlists and reviews.</p>
              </div>
              <button onClick={() => handleToggle('public_profile')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.public_profile ? 'bg-foreground' : 'bg-muted-foreground/30'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${settings.public_profile ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* GDPR & Data */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2 text-red-600 dark:text-red-400"><Database className="h-5 w-5" /> Data & Account Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export My Data (GDPR)</p>
                <p className="text-sm text-muted-foreground">Download a copy of all personal data associated with your account.</p>
              </div>
              <button onClick={handleGDPRExport} className="px-4 py-2 border border-border rounded-xl font-medium hover:bg-muted/50 transition-colors">
                Request Export
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-red-500/20">
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">Permanently remove your account and all associated data.</p>
              </div>
              <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
