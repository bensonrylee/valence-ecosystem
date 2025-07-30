'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { Shield, DollarSign, Calendar, Users, TrendingUp, Star, CheckCircle, ChevronRight, Award, Zap } from 'lucide-react';
import StripeConnectButton from '@/components/onboarding/StripeConnectButton';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ProviderStats {
  averageEarnings: string;
  topEarners: string;
  activeProviders: number;
}

export default function BecomeProviderPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      
      if (!user) {
        toast.error('Please log in to become a provider');
        router.push('/auth/login?redirect=/become-provider');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const providerStats: ProviderStats = {
    averageEarnings: '$3,500',
    topEarners: '$10,000+',
    activeProviders: 2847,
  };

  const handleOnboardingSuccess = () => {
    router.push('/dashboard/payments?success=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Join {providerStats.activeProviders.toLocaleString()} active providers
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Turn your expertise into income
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Share your skills with thousands of customers and build a thriving business on Ecosystem
            </p>
            
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-gray-900 mb-1">{providerStats.averageEarnings}</div>
                <div className="text-sm text-gray-600">Average monthly earnings</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-gray-900 mb-1">{providerStats.topEarners}</div>
                <div className="text-sm text-gray-600">Top providers earn</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-gray-900 mb-1">7%</div>
                <div className="text-sm text-gray-600">Low platform fee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why providers love Ecosystem</h2>
            <p className="text-lg text-gray-600">Everything you need to succeed, nothing you don't</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="bg-green-100 p-3 rounded-xl h-fit">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Keep more of what you earn</h3>
                <p className="text-gray-600">
                  With our competitive 7% platform fee, you take home 93% of every booking
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-100 p-3 rounded-xl h-fit">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Set your own schedule</h3>
                <p className="text-gray-600">
                  Work when you want, how you want. You're in complete control of your availability
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-purple-100 p-3 rounded-xl h-fit">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure payments</h3>
                <p className="text-gray-600">
                  Get paid safely with Stripe. Money goes directly to your bank account daily
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-orange-100 p-3 rounded-xl h-fit">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Access to customers</h3>
                <p className="text-gray-600">
                  Tap into our growing community of customers actively looking for your services
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-indigo-100 p-3 rounded-xl h-fit">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Grow your business</h3>
                <p className="text-gray-600">
                  Use our tools and insights to optimize your services and increase bookings
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-yellow-100 p-3 rounded-xl h-fit">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Build your reputation</h3>
                <p className="text-gray-600">
                  Collect reviews and ratings to showcase your expertise and attract more clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting started is easy</h2>
            <p className="text-lg text-gray-600">Be up and running in minutes</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Create your provider profile</h3>
                  <p className="text-gray-600">
                    Tell us about your services, set your rates, and upload photos to showcase your work
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Set up secure payments</h3>
                  <p className="text-gray-600">
                    Connect your bank account through Stripe to receive payments. It takes just 5 minutes
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">Get verified and go live</h3>
                  <p className="text-gray-600">
                    Once verified, your profile goes live and customers can start booking your services
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to start earning?</h3>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of providers already growing their business on Ecosystem
            </p>
            
            {user && (
              <div className="max-w-xl mx-auto">
                <StripeConnectButton 
                  onSuccess={handleOnboardingSuccess}
                  className="!bg-white !text-blue-600"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Trusted by 50,000+ users</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Verified providers only</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-4">Have questions about becoming a provider?</p>
          <Link
            href="/help/providers"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Visit our Provider Help Center
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}