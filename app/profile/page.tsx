'use client';

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useAuth } from '@/hooks/useClerkAuth';
import { User, Mail, Phone, MapPin, Calendar, Star, Edit2, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isSignedIn } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.display_name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone_number || '+1 (555) 123-4567',
    location: user?.location || 'San Francisco, CA',
    bio: user?.bio || 'Passionate about wellness and helping others achieve their goals.'
  });

  const handleSave = () => {
    // Save profile logic here
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const stats = {
    bookingsCompleted: 42,
    averageRating: 4.8,
    memberSince: 'January 2024'
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please sign in to view your profile</h1>
          <Link
            href="/auth/sign-in"
            className="inline-block px-6 py-3 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-panel p-8">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-white"
                      placeholder="Enter your full name"
                      aria-label="Full name"
                    />
                  ) : (
                    formData.fullName
                  )}
                </h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Member since {stats.memberSince}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-[#00FFAD] mb-1">{stats.bookingsCompleted}</div>
              <div className="text-gray-400 text-sm">Bookings Completed</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-3xl font-bold text-white">{stats.averageRating}</span>
              </div>
              <div className="text-gray-400 text-sm">Average Rating</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">12</div>
              <div className="text-gray-400 text-sm">Reviews Given</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter your email"
                      aria-label="Email address"
                    />
                  ) : (
                    <span className="text-gray-300">{formData.email}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter your phone number"
                      aria-label="Phone number"
                    />
                  ) : (
                    <span className="text-gray-300">{formData.phone}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter your location"
                      aria-label="Location"
                    />
                  ) : (
                    <span className="text-gray-300">{formData.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">About Me</h2>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white resize-none"
                  placeholder="Tell us about yourself"
                  aria-label="Bio"
                />
              ) : (
                <p className="text-gray-300">{formData.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-800">
              <Link
                href="/bookings"
                className="flex-1 text-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Bookings
              </Link>
              <Link
                href="/dashboard/provider"
                className="flex-1 text-center px-6 py-3 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}