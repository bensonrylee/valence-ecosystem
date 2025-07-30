import { supabase } from './config';

// Service CRUD operations
export const servicesService = {
  // Create a new service
  async createService(data: {
    provider_id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    duration: number;
    image_url?: string;
  }) {
    const { data: service, error } = await supabase
      .from('services')
      .insert(data)
      .select()
      .single();

    return { data: service, error };
  },

  // Get all services
  async getServices(filters?: {
    category?: string;
    provider_id?: string;
    is_active?: boolean;
  }) {
    let query = supabase.from('services').select(`
      *,
      provider:users!provider_id(
        id,
        display_name,
        image_url,
        provider_profile
      )
    `);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Get single service
  async getService(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:users!provider_id(
          id,
          display_name,
          image_url,
          provider_profile
        )
      `)
      .eq('id', id)
      .single();

    return { data, error };
  },

  // Update service
  async updateService(id: string, updates: Partial<{
    title: string;
    description: string;
    category: string;
    price: number;
    duration: number;
    image_url: string;
    is_active: boolean;
  }>) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  // Delete service
  async deleteService(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    return { error };
  },
};

// Booking operations
export const bookingsService = {
  // Create booking
  async createBooking(data: {
    service_id: string;
    customer_id: string;
    provider_id: string;
    start_time: Date;
    end_time: Date;
    price: number;
    platform_fee: number;
    notes?: string;
  }) {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(data)
      .select()
      .single();

    return { data: booking, error };
  },

  // Get bookings
  async getBookings(filters?: {
    customer_id?: string;
    provider_id?: string;
    status?: string;
    start_date?: Date;
    end_date?: Date;
  }) {
    let query = supabase.from('bookings').select(`
      *,
      service:services!service_id(
        id,
        title,
        duration,
        price
      ),
      customer:users!customer_id(
        id,
        display_name,
        image_url
      ),
      provider:users!provider_id(
        id,
        display_name,
        image_url
      )
    `);

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters?.provider_id) {
      query = query.eq('provider_id', filters.provider_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.start_date) {
      query = query.gte('start_time', filters.start_date.toISOString());
    }
    if (filters?.end_date) {
      query = query.lte('end_time', filters.end_date.toISOString());
    }

    const { data, error } = await query.order('start_time', { ascending: true });
    return { data, error };
  },

  // Update booking status
  async updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed', paymentDetails?: {
    stripe_payment_intent_id?: string;
    stripe_transfer_id?: string;
  }) {
    const updates: any = { status };
    if (paymentDetails) {
      Object.assign(updates, paymentDetails);
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },
};

// Messaging operations
export const messagesService = {
  // Send message
  async sendMessage(data: {
    conversation_id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
  }) {
    const { data: message, error } = await supabase
      .from('messages')
      .insert(data)
      .select()
      .single();

    return { data: message, error };
  },

  // Get conversation messages
  async getMessages(conversation_id: string, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(
          id,
          display_name,
          image_url
        )
      `)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data: data?.reverse(), error };
  },

  // Mark messages as read
  async markAsRead(recipient_id: string, conversation_id: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', recipient_id)
      .eq('conversation_id', conversation_id)
      .eq('is_read', false);

    return { error };
  },

  // Get conversations list
  async getConversations(user_id: string) {
    const { data, error } = await supabase
      .rpc('get_user_conversations', { user_id });

    return { data, error };
  },
};

// Availability operations
export const availabilityService = {
  // Set provider availability
  async setAvailability(provider_id: string, slots: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }>) {
    // First, delete existing availability
    await supabase
      .from('availability')
      .delete()
      .eq('provider_id', provider_id);

    // Insert new availability
    const { data, error } = await supabase
      .from('availability')
      .insert(
        slots.map(slot => ({
          ...slot,
          provider_id,
        }))
      )
      .select();

    return { data, error };
  },

  // Get provider availability
  async getAvailability(provider_id: string) {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('provider_id', provider_id)
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time');

    return { data, error };
  },

  // Check slot availability
  async checkSlotAvailability(provider_id: string, start_time: Date, end_time: Date) {
    // Check if provider has availability for this day/time
    const dayOfWeek = start_time.getDay();
    const startTimeStr = start_time.toTimeString().slice(0, 8);
    const endTimeStr = end_time.toTimeString().slice(0, 8);

    const { data: availability, error: availError } = await supabase
      .from('availability')
      .select('*')
      .eq('provider_id', provider_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .lte('start_time', startTimeStr)
      .gte('end_time', endTimeStr);

    if (availError || !availability?.length) {
      return { available: false, error: availError };
    }

    // Check for conflicting bookings
    const { data: conflicts, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('provider_id', provider_id)
      .in('status', ['pending', 'confirmed'])
      .or(`start_time.lt.${end_time.toISOString()},end_time.gt.${start_time.toISOString()}`);

    return {
      available: !conflicts?.length,
      error: bookingError,
    };
  },
};

// Reviews operations
export const reviewsService = {
  // Create review
  async createReview(data: {
    booking_id: string;
    reviewer_id: string;
    provider_id: string;
    rating: number;
    comment?: string;
  }) {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert(data)
      .select()
      .single();

    return { data: review, error };
  },

  // Get provider reviews
  async getProviderReviews(provider_id: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviewer_id(
          id,
          display_name,
          image_url
        ),
        booking:bookings!booking_id(
          service:services!service_id(
            title
          )
        )
      `)
      .eq('provider_id', provider_id)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get provider rating stats
  async getProviderRatingStats(provider_id: string) {
    const { data, error } = await supabase
      .rpc('get_provider_rating_stats', { provider_id });

    return { data: data?.[0], error };
  },
};