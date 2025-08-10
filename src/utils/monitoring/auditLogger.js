import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

class AuditLogger {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Add a log entry to the queue
  async log(action, details = {}, userId = null) {
    const logEntry = {
      action,
      details,
      userId,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Add to queue for batch processing
    this.queue.push(logEntry);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Process the queue of log entries
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    let batch = [];

    try {
      batch = this.queue.splice(0, 10); // Process up to 10 entries at once
      
      for (const entry of batch) {
        await this.saveLogEntry(entry);
      }
    } catch (error) {
      console.error('Error processing audit log queue:', error);
      
      // Re-add failed entries to the front of the queue for retry
      if (batch.length > 0) {
        this.queue.unshift(...batch);
      }
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more entries
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  // Save a single log entry with retry logic
  async saveLogEntry(entry, attempt = 1) {
    try {
      const docRef = await addDoc(collection(db, 'auditLog'), {
        ...entry,
        timestamp: serverTimestamp(),
        createdAt: new Date(),
      });
      
      return docRef;
    } catch (error) {
      console.error(`Failed to save audit log entry (attempt ${attempt}):`, error);
      
      if (attempt < this.retryAttempts) {
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.saveLogEntry(entry, attempt + 1);
      } else {
        // Log to console as fallback
        console.warn('Audit log entry failed after retries:', entry);
        throw error;
      }
    }
  }

  // Convenience methods for common actions
  async logUserLogin(userId, email) {
    await this.log('User Login', { email }, userId);
  }

  async logUserLogout(userId) {
    await this.log('User Logout', {}, userId);
  }

  async logOrderCreated(orderId, patientName, tests) {
    await this.log('Order Created', {
      orderId,
      patientName,
      testCount: tests?.length || 0,
    });
  }

  async logOrderUpdated(orderId, changes) {
    await this.log('Order Updated', {
      orderId,
      changes,
    });
  }

  async logOrderCompleted(orderId, completedBy) {
    await this.log('Order Completed', {
      orderId,
      completedBy,
    });
  }

  async logTestResultEntered(orderId, testName, result, enteredBy) {
    await this.log('Test Result Entered', {
      orderId,
      testName,
      result,
      enteredBy,
    });
  }

  async logCriticalValue(orderId, testName, value, acknowledgedBy) {
    await this.log('Critical Value Acknowledged', {
      orderId,
      testName,
      value,
      acknowledgedBy,
    });
  }

  async logSampleRejected(orderId, reason, rejectedBy) {
    await this.log('Sample Rejected', {
      orderId,
      reason,
      rejectedBy,
    });
  }

  async logReportAmended(orderId, testName, originalResult, amendedResult, reason, amendedBy) {
    await this.log('Report Amended', {
      orderId,
      testName,
      originalResult,
      amendedResult,
      reason,
      amendedBy,
    });
  }

  async logOrderCancelled(orderId, reason, cancelledBy) {
    await this.log('Order Cancelled', {
      orderId,
      reason,
      cancelledBy,
    });
  }

  async logTestCancelled(orderId, testName, reason, cancelledBy) {
    await this.log('Test Cancelled', {
      orderId,
      testName,
      reason,
      cancelledBy,
    });
  }

  async logSettingsChanged(settingName, oldValue, newValue, changedBy) {
    await this.log('Settings Changed', {
      settingName,
      oldValue,
      newValue,
      changedBy,
    });
  }

  async logError(error, context = {}) {
    await this.log('Error Occurred', {
      error: error.message,
      stack: error.stack,
      context,
    });
  }

  // Get queue status for debugging
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }

  // Clear the queue (useful for testing)
  clearQueue() {
    this.queue = [];
  }
}

// Create a singleton instance
const auditLogger = new AuditLogger();

// Export the logAuditEvent function for backward compatibility
export const logAuditEvent = async (action, details = {}) => {
  return await auditLogger.log(action, details);
};

export default auditLogger;