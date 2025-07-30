export interface TimeSlot {
  time: string
  available: boolean
  formatted: string
}

export interface DayAvailability {
  enabled: boolean
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

export interface WeeklyAvailability {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30,
  breakStart?: string,
  breakEnd?: string
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  
  const current = new Date(start)
  
  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5)
    const isBreakTime = breakStart && breakEnd && 
      timeString >= breakStart && timeString < breakEnd
    
    slots.push({
      time: timeString,
      available: !isBreakTime,
      formatted: formatTimeSlot(timeString)
    })
    
    current.setMinutes(current.getMinutes() + intervalMinutes)
  }
  
  return slots
}

// Overloaded function for Date input
export function generateTimeSlotsFromDate(
  date: Date,
  availability: WeeklyAvailability,
  intervalMinutes: number = 30,
  blockedSlots: string[] = []
): TimeSlot[] {
  const dayOfWeek = getDayOfWeek(date)
  const dayAvailability = availability[dayOfWeek]
  
  if (!dayAvailability.enabled) {
    return []
  }
  
  const slots = generateTimeSlots(
    dayAvailability.startTime,
    dayAvailability.endTime,
    intervalMinutes,
    dayAvailability.breakStart,
    dayAvailability.breakEnd
  )
  
  // Filter out blocked slots
  return slots.map(slot => ({
    ...slot,
    available: slot.available && !blockedSlots.includes(slot.time)
  }))
}

export function formatTimeSlot(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function combineDateAndTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`)
}

export function getDayOfWeek(date: Date): keyof WeeklyAvailability {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[date.getDay()] as keyof WeeklyAvailability
}

export function isDateAvailable(
  date: Date,
  availability: WeeklyAvailability
): boolean {
  const dayOfWeek = getDayOfWeek(date)
  return availability[dayOfWeek].enabled
}

export function getAvailableTimeSlots(
  date: Date,
  availability: WeeklyAvailability,
  intervalMinutes: number = 30
): TimeSlot[] {
  const dayOfWeek = getDayOfWeek(date)
  const dayAvailability = availability[dayOfWeek]
  
  if (!dayAvailability.enabled) {
    return []
  }
  
  return generateTimeSlots(
    dayAvailability.startTime,
    dayAvailability.endTime,
    intervalMinutes,
    dayAvailability.breakStart,
    dayAvailability.breakEnd
  )
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function getNextAvailableDate(
  startDate: Date,
  availability: WeeklyAvailability,
  maxDays: number = 30
): Date | null {
  let currentDate = new Date(startDate)
  
  for (let i = 0; i < maxDays; i++) {
    if (isDateAvailable(currentDate, availability)) {
      return currentDate
    }
    currentDate = addDays(currentDate, 1)
  }
  
  return null
} 