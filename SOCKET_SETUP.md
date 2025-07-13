# Socket.io Setup Guide

## Overview

SmartLab LIMS includes optional real-time notifications via Socket.io. This feature is disabled by default to prevent connection errors when no server is running.

## Configuration

### Option 1: Disable Real-time Notifications (Default)

By default, real-time notifications are disabled. The app will work normally without any socket connection attempts.

### Option 2: Enable Real-time Notifications

To enable real-time notifications, set the `VITE_SOCKET_URL` environment variable:

```bash
# In your .env.local file
VITE_SOCKET_URL=http://localhost:3001
```

## Socket Server Requirements

If you want to enable real-time notifications, you'll need to run a Socket.io server that:

1. **Listens on the configured port** (default: 3001)
2. **Handles authentication** via user ID and token
3. **Emits the following events**:
   - `order_update` - When orders are created, updated, or completed
   - `test_result` - When test results are ready
   - `inventory_alert` - When inventory items are running low
   - `qc_alert` - When QC samples fail

## Event Data Structure

### Order Update
```javascript
{
  action: 'created' | 'updated' | 'completed',
  data: {
    id: 'order-id',
    // other order data
  }
}
```

### Test Result
```javascript
{
  action: 'ready',
  data: {
    orderId: 'order-id',
    // other test data
  }
}
```

### Inventory Alert
```javascript
{
  action: 'low_stock',
  data: {
    itemName: 'Item Name',
    quantity: 5,
    // other inventory data
  }
}
```

### QC Alert
```javascript
{
  action: 'failed',
  data: {
    sampleId: 'sample-id',
    // other QC data
  }
}
```

## Error Handling

The app includes robust error handling for socket connections:

- **Connection errors** are logged but don't crash the app
- **User-friendly messages** are shown when notifications are unavailable
- **Automatic reconnection** attempts with exponential backoff
- **Graceful degradation** - the app works without real-time features

## Development

For development, you can:

1. **Leave socket disabled** - app works normally
2. **Mock the socket server** - create a simple server for testing
3. **Use a real socket server** - implement full real-time functionality

## Troubleshooting

### Common Issues

1. **Connection refused errors**: Socket URL is set but no server is running
   - Solution: Either disable socket URL or start a socket server

2. **Authentication errors**: Server doesn't handle the auth format
   - Solution: Ensure server accepts `userId` and `token` in auth object

3. **Event format errors**: Server emits events in wrong format
   - Solution: Ensure events match the expected data structure above

### Debug Mode

To see detailed socket connection logs, check the browser console for:
- Connection status messages
- Event emission logs
- Error details 