'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceDocument } from '@/lib/firebase-collections';
import { 
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  'Personal Training',
  'Life Coaching',
  'Business Consulting',
  'Nutrition Coaching',
  'Mental Health',
  'Career Coaching',
  'Financial Planning',
  'Yoga & Wellness',
  'Academic Tutoring',
  'Music Lessons',
  'Language Learning',
  'Tech Consulting',
  'Legal Services',
  'Marketing Strategy',
  'Other'
];

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    duration: '60',
    features: [''],
    requirements: [''],
    cancellationPolicy: '24',
    active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const auth = getAuth();
    if (!auth.currentUser) {
      toast.error('You must be logged in to create a service');
      return;
    }

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Get provider info
      const providerDoc = await getDoc(doc(db, 'providers', auth.currentUser.uid));
      const providerData = providerDoc.data();

      const serviceData: Omit<ServiceDocument, 'id'> = {
        providerId: auth.currentUser.uid,
        providerName: providerData?.displayName || auth.currentUser.displayName || 'Provider',
        providerAvatar: providerData?.photoURL || auth.currentUser.photoURL || '',
        name: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        currency: 'USD',
        duration: parseInt(formData.duration),
        rating: 0,
        reviewCount: 0,
        completedBookings: 0,
        images: [],
        tags: formData.features.filter(f => f.trim()),
        responseTime: 24, // default 24 hours
        active: formData.active,
        featured: false,
        verified: false,
        remote: true,
        coverImage: '',
        availability: {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '09:00', end: '17:00', enabled: false },
          sunday: { start: '09:00', end: '17:00', enabled: false }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'services'), serviceData);
      
      toast.success('Service created successfully!');
      router.push('/dashboard/services');
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ''] });
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  return (
    <div className="min-h-screen bg-dark p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">Create New Service</h1>
          </div>
          <p className="text-gray-400">Set up a new service offering for your clients</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input w-full"
                  placeholder="e.g., Personal Fitness Training"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full h-32 resize-none"
                  placeholder="Describe your service in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="glass-input w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing and Duration */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Pricing & Duration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="glass-input w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes) *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="glass-input w-full"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
            <p className="text-gray-400 text-sm mb-4">List what's included in your service</p>
            
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="glass-input flex-1"
                    placeholder="e.g., Personalized workout plan"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="glass-panel px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="glass-button-primary px-4 py-2 rounded-lg text-sm"
              >
                Add Feature
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
            <p className="text-gray-400 text-sm mb-4">What clients need to prepare or bring</p>
            
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="glass-input flex-1"
                    placeholder="e.g., Comfortable workout clothes"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="glass-panel px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="glass-button-primary px-4 py-2 rounded-lg text-sm"
              >
                Add Requirement
              </button>
            </div>
          </div>

          {/* Policies */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Policies</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cancellation Policy
                </label>
                <select
                  value={formData.cancellationPolicy}
                  onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                  className="glass-input w-full"
                >
                  <option value="0">Flexible - Free cancellation</option>
                  <option value="24">24 hours notice required</option>
                  <option value="48">48 hours notice required</option>
                  <option value="72">72 hours notice required</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-accent bg-glass-dark border-dark-border rounded focus:ring-accent/20"
                />
                <label htmlFor="active" className="text-sm text-gray-300">
                  Make this service active immediately
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="glass-panel px-6 py-3 rounded-xl hover:border-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary px-6 py-3 rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}