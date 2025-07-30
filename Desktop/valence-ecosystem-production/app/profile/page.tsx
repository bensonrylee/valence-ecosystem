'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAuth, onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { 
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  Save,
  User,
  Lock,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  phone: string;
  location: string;
  bio: string;
  createdAt: Date;
  isProvider: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      setUser(user);
      await loadUserProfile(user.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadUserProfile = async (userId: string) => {
    try {
      // Try to get user document
      const userDoc = await getDoc(doc(db, 'users', userId));
      let profileData: UserProfile;
      
      if (userDoc.exists()) {
        profileData = userDoc.data() as UserProfile;
      } else {
        // Check if user is a provider
        const providerDoc = await getDoc(doc(db, 'providers', userId));
        
        profileData = {
          displayName: getAuth().currentUser?.displayName || '',
          email: getAuth().currentUser?.email || '',
          photoURL: getAuth().currentUser?.photoURL || '',
          phone: '',
          location: '',
          bio: '',
          createdAt: new Date(),
          isProvider: providerDoc.exists(),
          emailNotifications: true,
          smsNotifications: false
        };
      }
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      // Update auth profile
      await updateProfile(user, { photoURL });
      
      // Update Firestore
      await updateDoc(doc(db, profile?.isProvider ? 'providers' : 'users', user.uid), {
        photoURL,
        updatedAt: new Date()
      });
      
      setProfile({ ...profile!, photoURL });
      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    
    try {
      // Update auth profile
      await updateProfile(user, {
        displayName: profile.displayName
      });
      
      // Update Firestore
      const collectionName = profile.isProvider ? 'providers' : 'users';
      await updateDoc(doc(db, collectionName, user.uid), {
        displayName: profile.displayName,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        updatedAt: new Date()
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) throw new Error('No user logged in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.current
      );
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.new);
      
      toast.success('Password updated successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (type: 'email' | 'sms', value: boolean) => {
    if (!user || !profile) return;
    
    try {
      const updates = {
        emailNotifications: type === 'email' ? value : profile.emailNotifications,
        smsNotifications: type === 'sms' ? value : profile.smsNotifications,
        updatedAt: new Date()
      };
      
      const collectionName = profile.isProvider ? 'providers' : 'users';
      await updateDoc(doc(db, collectionName, user.uid), updates);
      
      setProfile({ ...profile, ...updates });
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleLogout = async () => {
    try {
      await getAuth().signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-dark p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-glass-light">
                {profile.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt={profile.displayName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-accent rounded-full p-2 cursor-pointer hover:bg-accent/80 transition-colors">
                <Camera className="w-4 h-4 text-dark" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.displayName}</h1>
              <p className="text-gray-400">{profile.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-400">
                  Member since {formatDistanceToNow(profile.createdAt, { addSuffix: true })}
                </span>
                {profile.isProvider && (
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold">
                    Provider
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="glass-panel px-4 py-2 rounded-lg hover:border-red-500/30 hover:text-red-500 transition-all flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-panel p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'security'
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'notifications'
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="glass-input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="glass-input w-full opacity-50 cursor-not-allowed flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  {profile.email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="glass-input w-full"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="glass-input w-full"
                  placeholder="City, State"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="glass-input w-full h-32 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="glass-button-primary px-6 py-3 rounded-xl flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={handlePasswordUpdate} className="glass-panel p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="glass-input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="glass-input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="glass-input w-full"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="glass-button-primary px-6 py-3 rounded-xl flex items-center gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Two-Factor Authentication</h2>
              <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
              <button className="glass-panel px-4 py-2 rounded-lg hover:border-accent/30 transition-all">
                Enable 2FA
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="text-white font-medium">Email Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive booking updates and reminders via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.emailNotifications}
                    onChange={(e) => handleNotificationUpdate('email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-glass-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="text-white font-medium">SMS Notifications</h3>
                    <p className="text-gray-400 text-sm">Get text messages for urgent updates</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.smsNotifications}
                    onChange={(e) => handleNotificationUpdate('sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-glass-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}