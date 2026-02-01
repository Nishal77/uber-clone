# Razorpay Integration Guide

## Test Credentials Setup

### Backend (.env)
```
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=EqLvLmvWYGOZdJmLwgzWkQVf
```

## Test Card Details for Payment

When the Razorpay payment modal opens, use these test credentials:

### **Successful Payment (Card)**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits (e.g., 123)
Expiry: Any future date (e.g., 12/25)
Cardholder Name: Any name
```

### **Successful Payment (UPI)**
```
UPI ID: success@razorpay
```

### **Successful Payment (Net Banking)**
- Select any bank
- Choose "Success" from the payment options

### **Failed Payment (for testing failure scenarios)**
```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

## How It Works

1. **User selects "Online Payment"** on the ride confirmation screen
2. **Frontend sends request** to `/payment/create-order` with ride ID and amount
3. **Backend creates Razorpay order** and returns order details
4. **Razorpay modal opens** showing payment interface
5. **User completes payment** using test credentials
6. **Payment verified** by backend using webhook/signature
7. **Ride confirmed** and driver search begins

## Payment Flow

```
User clicks "Confirm Ride" (Online Payment selected)
         ↓
   createRide('online')
         ↓
   initiateRazorpayPayment(ride)
         ↓
   POST /payment/create-order
         ↓
   Backend creates Razorpay order
         ↓
   Razorpay modal opens
         ↓
   User enters test card details
         ↓
   Payment success callback
         ↓
   POST /payment/verify-payment
         ↓
   Backend verifies signature
         ↓
   Ride confirmed + Driver search starts
```

## Testing Steps

1. **Start both servers**:
   - Backend: `cd backend && node src/server.js`
   - Frontend: `cd frontend && npm run dev`

2. **Login as user**

3. **Book a ride**:
   - Enter pickup location
   - Enter destination
   - Select vehicle type
   - Select "Online Payment"
   - Click "Confirm Ride"

4. **Razorpay modal appears**:
   - Use test card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
   - Click "Pay"

5. **Payment processed**:
   - Check console for logs
   - Modal closes
   - Ride confirmed
   - Driver search starts

## Troubleshooting

### Error: "Payment gateway not configured"
- Check if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are in backend/.env
- Restart backend server after adding credentials

### Error: "Razorpay script not loaded"
- Refresh the page
- Check if Razorpay script is in index.html `<head>` section

### Error: "Payment verification failed"
- Check backend console for signature verification logs
- Ensure RAZORPAY_KEY_SECRET matches exactly

### Order creation fails (500 error)
- Check backend console for detailed error
- Verify Razorpay credentials are correct
- Ensure ride was created successfully first

## Backend Logs to Monitor

When payment is initiated, you should see:
```
Creating Razorpay order for ride: <rideId> Amount: <amount>
Razorpay order options: { amount: <paise>, currency: 'INR', ... }
Razorpay order created: { id: 'order_xxx', ... }
```

When payment is verified:
```
Verifying payment for ride: <rideId>
✅ Payment verified successfully for ride: <rideId>
```

## Important Notes

- Test mode keys start with `rzp_test_`
- All test payments are free
- No real money is charged
- Test cards work only in test mode
- In production, use `rzp_live_` keys
