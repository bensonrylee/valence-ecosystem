'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ServiceDocument } from '@/lib/firebase-collections';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Calendar,
  DollarSign,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Load provider's services
      await loadServices(user.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadServices = async (userId: string) => {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, where('providerId', '==', userId));
      const snapshot = await getDocs(q);
      
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceDocument));
      
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'services', serviceId), {
        active: !currentStatus,
        updatedAt: new Date()
      });
      
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, active: !currentStatus }
          : service
      ));
      
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service status');
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await deleteDoc(doc(db, 'services', serviceId));
      setServices(services.filter(service => service.id !== serviceId));
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && service.active) ||
                         (filterStatus === 'inactive' && !service.active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Services</h1>
              <p className="text-gray-400">Manage your service offerings</p>
            </div>
            <Link
              href="/dashboard/services/new"
              className="glass-button-primary px-6 py-3 rounded-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Service
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="glass-panel p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filterStatus === 'all' 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'glass-panel text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filterStatus === 'active' 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'glass-panel text-gray-400 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filterStatus === 'inactive' 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'glass-panel text-gray-400 hover:text-white'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <div className="text-gray-400">
              {searchQuery || filterStatus !== 'all' 
                ? 'No services found matching your criteria' 
                : 'No services yet. Create your first service!'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="glass-panel p-6 hover:border-accent/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.active 
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-500 border border-red-500/30'
                  }`}>
                    {service.active ? 'Active' : 'Inactive'}
                  </div>
                  <button
                    onClick={() => toggleServiceStatus(service.id!, service.active)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {service.active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <span className="text-white">{formatCurrency(service.price)}</span>
                    <span className="text-gray-400">per {service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-white">{service.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({service.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-400">{service.completedBookings} bookings</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/services/${service.id}/edit`}
                    className="flex-1 glass-panel px-4 py-2 rounded-lg text-center text-sm hover:border-accent/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteService(service.id!)}
                    className="glass-panel px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}