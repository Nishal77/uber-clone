# 🔑 How to Get Razorpay Test Credentials

## ❌ Current Issue

**Error:** `Authentication failed` (401)

**Cause:** The Razorpay API keys in your `.env` file are invalid/fake. Razorpay requires you to create an account and use your own API keys.

---

## ✅ Solution: Get Your Own Razorpay Test Keys

### Step 1: Create Razorpay Account

1. Go to: **https://razorpay.com/**
2. Click **"Sign Up"** (top right)
3. Fill in your details:
   - Business Name
   - Email
   - Phone Number
   - Create Password
4. Click **"Create Account"**
5. Verify your email

### Step 2: Complete Account Setup

1. After email verification, login to Razorpay Dashboard
2. You'll be in **TEST MODE** by default (perfect for development!)
3. Skip any KYC/business verification for now (only needed for live mode)

### Step 3: Get API Keys

1. Go to: **https://dashboard.razorpay.com/app/keys**
2. You'll see two sections:
   - **Test Mode Keys** (for development)
   - **Live Mode Keys** (for production)

3. **Copy Test Mode Keys:**
   ```
   Test Key ID: rzp_test_xxxxxxxxxxxxx
   Test Key Secret: Click "Show" then copy
   ```

### Step 4: Update Your .env File

Open `/backend/.env` and replace:

```bash
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

With your actual keys:

```bash
RAZORPAY_KEY_ID=rzp_test_ABC123XYZ456
RAZORPAY_KEY_SECRET=abc123def456ghi789jkl012
```

### Step 5: Restart Backend Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
node src/server.js
```

---

## 🎯 Quick Visual Guide

### Dashboard Screenshot Areas:

```
┌─────────────────────────────────────────┐
│  Razorpay Dashboard                     │
├─────────────────────────────────────────┤
│  Settings > API Keys                    │
│                                         │
│  ⚙️ TEST MODE (toggle should be ON)    │
│                                         │
│  Key ID:                                │
│  [rzp_test_ABC123XYZ456]    [Copy]     │
│                                         │
│  Key Secret:                            │
│  [********************]     [Show]      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📝 Important Notes

### Test Mode vs Live Mode

**Test Mode** (use for development):
- ✅ No real money involved
- ✅ Test cards work
- ✅ No KYC required
- ✅ Free to use
- Keys start with: `rzp_test_`

**Live Mode** (for production):
- ❌ Real money transactions
- ❌ KYC required
- ❌ Business verification needed
- Keys start with: `rzp_live_`

### Security Tips

1. **Never commit API keys to GitHub**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Never share your Secret Key**
   - Keep it private
   - Don't expose in client-side code

3. **Use Test Mode for development**
   - Always use `rzp_test_` keys during development
   - Only switch to `rzp_live_` in production

---

## 🧪 Testing After Setup

### Test Card Details

Once you have valid API keys, use these test cards:

**Successful Payment:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

**Other Test Cards:**
```
Visa: 4012 8888 8888 1881
Mastercard: 5555 5555 5555 4444
Rupay: 6522 5445 4474 6067
```

**Test UPI:**
```
UPI ID: success@razorpay
```

---

## 🔍 Verification Steps

After updating `.env` with your keys:

1. **Check if keys are loaded:**
   ```javascript
   console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
   // Should show: rzp_test_xxxxx
   ```

2. **Test payment order creation:**
   - Try booking a ride with online payment
   - Check backend console
   - Should show: `Razorpay order created: { id: 'order_...' }`

3. **Expected backend logs:**
   ```
   Creating Razorpay order for ride: ... Amount: 183
   Razorpay order options: { amount: 18300, currency: 'INR', ... }
   Razorpay order created: { id: 'order_xxxxx', ... }  ✅
   ```

---

## ❌ Common Errors & Solutions

### Error: "Authentication failed"
**Cause:** Invalid API keys  
**Solution:** 
- Verify you copied the complete key (no extra spaces)
- Make sure you're using TEST keys (start with `rzp_test_`)
- Restart backend server after updating .env

### Error: "Payment gateway not configured"
**Cause:** Environment variables not loaded  
**Solution:**
- Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are in .env
- Restart server to reload environment variables
- Check for typos in variable names

### Can't find API keys in dashboard
**Solution:**
- Make sure you're logged in
- Go to Settings (gear icon) > API Keys
- Toggle should be on "Test Mode"
- If you don't see keys, click "Generate Test Keys"

---

## 🚀 Alternative: Stripe or Other Payment Gateways

If you don't want to use Razorpay, you can:

1. **Skip payment integration temporarily:**
   - Only use "Cash" payment method
   - Comment out Razorpay code

2. **Use another payment gateway:**
   - Stripe (international)
   - PayPal
   - Paytm

3. **Mock payment for testing:**
   - Create a dummy payment endpoint
   - Simulate successful payment without actual gateway

---

## 📞 Need Help?

**Razorpay Support:**
- Email: support@razorpay.com
- Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/

**Common Resources:**
- Dashboard: https://dashboard.razorpay.com/
- API Keys: https://dashboard.razorpay.com/app/keys
- Test Guide: https://razorpay.com/docs/payments/payments/test-integration/

---

## ✅ Checklist

Before testing payment integration:

- [ ] Created Razorpay account
- [ ] Verified email
- [ ] Logged into dashboard
- [ ] Copied TEST mode Key ID
- [ ] Copied TEST mode Key Secret
- [ ] Updated backend/.env file
- [ ] Restarted backend server
- [ ] Verified keys are loaded (check logs)
- [ ] Tested payment with test card

---

**Once you have your API keys, the Razorpay integration will work perfectly!** 🎉
