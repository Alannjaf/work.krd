import { ResumeData } from '@/types/resume';

// Shared temporary store for PDF generation
export const tempStore = new Map<string, { 
  data: ResumeData; 
  template: string; 
  userId: string; 
  createdAt: number 
}>();

// Clean up old entries every 5 minutes (reduced from 1 hour to prevent unbounded growth)
const tempStoreCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tempStore.entries()) {
    if (now - value.createdAt > 3600000) { // 1 hour
      tempStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Prevent the timer from keeping the process alive in serverless environments
if (tempStoreCleanupInterval.unref) {
  tempStoreCleanupInterval.unref();
}