import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileUpdate, usePasswordUpdate } from "@/hooks/useProfileQuery";
import { Camera, Save, Lock, User, Phone } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending: isUpdating } = useProfileUpdate();
  const { mutate: changePassword, isPending: isChangingPwd } = usePasswordUpdate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.avatar || "");

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (phone) formData.append("phone", phone);
    if (avatar) formData.append("avatar", avatar);
    updateProfile(formData, {
      onSuccess: () => alert("Profile updated successfully")
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword(passwords, {
      onSuccess: () => {
        alert("Password changed successfully");
        setPasswords({ current_password: "", new_password: "", new_password_confirmation: "" });
      },
      onError: (err: any) => alert(err.message || "Failed to change password")
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (!user) return <div className="container-premium py-20 text-center">Please login to view your profile.</div>;

  return (
    <div className="container-premium py-8 lg:py-12 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Profile Form */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="h-24 w-24 rounded-full bg-muted overflow-hidden border-2 border-border group-hover:border-foreground transition-colors">
                    {preview ? (
                      <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div>
                  <p className="font-medium">Profile Photo</p>
                  <p className="text-sm text-muted-foreground mt-1">Click the avatar to upload a new photo. Max size 2MB.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Email address cannot be changed.</p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Form */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><Lock className="h-5 w-5" /> Security</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">New Password</label>
                <input 
                  type="password" 
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwords.new_password_confirmation}
                  onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 focus:outline-none"
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isChangingPwd}
                  className="px-6 py-2.5 border border-border bg-background font-semibold rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {isChangingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Account Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Type</p>
                <p className="font-semibold capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
