# Audit and Fix Implementation Plan

## Phase 1: Authentication Fixes
- [ ] 1.1 Add Firebase auth persistence (browserLocalPersistence)
- [ ] 1.2 Add authLoading state to prevent flickering
- [ ] 1.3 Fix signup infinite loading with proper try/catch/finally
- [ ] 1.4 Add error logging for Firebase errors
- [ ] 1.5 Update AuthContext to export authLoading state

## Phase 2: Cart Logic Fixes
- [ ] 2.1 Ensure addToCart uses serverTimestamp()
- [ ] 2.2 Fix Firestore write to use proper merge
- [ ] 2.3 Add real-time cart listener verification
- [ ] 2.4 Add cart item count badge dynamic update

## Phase 3: Checkout & Payment Fixes
- [ ] 3.1 Ensure checkout sidebar renders correctly
- [ ] 3.2 Fix MPesa payment method rendering
- [ ] 3.3 Set default payment method to IntaSend (as per requirement)
- [ ] 3.4 Add proper validation for checkout form

## Phase 4: Order Creation Fixes
- [ ] 4.1 Add proper validation (phone, email, address)
- [ ] 4.2 Wrap order creation in try/catch
- [ ] 4.3 Handle STK call failures properly
- [ ] 4.4 Always clear loading state in finally block

## Phase 5: Global Improvements
- [ ] 5.1 Add global error boundary component
- [ ] 5.2 Add loading spinners for auth, cart, checkout
- [ ] 5.3 Prevent infinite loops in useEffect
- [ ] 5.4 Add proper error display with MUI Alert
