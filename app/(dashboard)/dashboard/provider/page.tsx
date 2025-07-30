'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Card } from '@/components/ui/primitives/Card';
import { Button } from '@/components/ui/primitives/Button';
import { ArrowRight, Store, DollarSign, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProviderDashboard() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  const handleBecomeProvider = async () => {
    if (!isSignedIn) {
      router.push('/auth/sign-in');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_account' }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating provider account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: Store,
      title: 'List Your Services',
      description: 'Create and manage your service offerings with custom pricing and availability.',
    },
    {
      icon: DollarSign,
      title: 'Get Paid Instantly',
      description: 'Receive payments directly to your bank account with our secure payment system.',
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Verified customers, secure payments, and dispute protection built-in.',
    },
  ];

  if (isProvider) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Provider Dashboard</h1>
          {/* Provider dashboard content */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Become a Service Provider
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of professionals offering premium services on our platform
            </p>
          </div>

          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-[#00FFAD]/20 to-[#00FFAD]/10 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Start earning today
                  </h2>
                  <p className="text-gray-300">
                    Set up your provider account in just 2 minutes
                  </p>
                </div>
                <div className="text-[#00FFAD] text-5xl font-bold">
                  93%
                  <p className="text-sm text-gray-400 font-normal">earnings kept</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-[#00FFAD]/20 rounded-xl flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-[#00FFAD]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-[#00FFAD]/10 to-transparent">
            <div className="text-center py-8">
              <h3 className="text-2xl font-semibold text-white mb-6">
                Ready to get started?
              </h3>
              <Button
                variant="primary"
                size="lg"
                onClick={handleBecomeProvider}
                loading={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? 'Setting up...' : 'Become a Provider'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-400 mt-4">
                No upfront costs • Cancel anytime • Instant approval
              </p>
            </div>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Have questions? Check out our{' '}
              <a href="#" className="text-[#00FFAD] hover:underline">
                provider guide
              </a>{' '}
              or{' '}
              <a href="#" className="text-[#00FFAD] hover:underline">
                contact support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}