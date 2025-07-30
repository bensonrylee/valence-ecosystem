export const DEFAULT_BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
};

export function generateTimeSlots(
  date: Date,
  blockedSlots: string[],
  startHour = DEFAULT_BUSINESS_HOURS.start,
  endHour = DEFAULT_BUSINESS_HOURS.end
): string[] {
  const slots: string[] = [];
  const blockedSet = new Set(blockedSlots);

  for (let hour = startHour; hour < endHour; hour++) {
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);
    
    // Skip if this slot is blocked
    if (!blockedSet.has(slotDate.toISOString())) {
      // Format as HH:mm
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
  }

  return slots;
}

export function formatTimeSlot(time: string): string {
  const [hour, minute] = time.split(':');
  const hourNum = parseInt(hour, 10);
  const period = hourNum >= 12 ? 'PM' : 'AM';
  const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  
  return `${displayHour}:${minute} ${period}`;
}

export function combineDateAndTime(date: Date, time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hour, minute, 0, 0);
  return combined.toISOString();
}