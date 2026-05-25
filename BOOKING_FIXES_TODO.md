# TODO: Booking Calendar Fixes

## 1. Add RWD to BookingCalendar ✅ (Partially - need to test)
Location: `/frontend/src/components/booking/BookingCalendar.tsx`
- Add responsive classes for mobile/tablet
- Test on different screen sizes
- Ensure weekly view is scrollable on mobile

## 2. Add Cancel Button for Clients in BookingsList
Location: `/frontend/src/components/bookings/BookingsList.tsx`
- Import `useCancelBooking` and `CancelBookingModal`
- Add cancel button for clients when status is PENDING or CONFIRMED
- Show CancelBookingModal on click
- Pass `cancelledBy: 'client'` to mutation

## 3. Fix Backend Bug - Red Slot Issue
**Problem**: After canceling booking at 17:00, slot shows as red (booked) instead of green (available)
**Possible causes**:
- Booking not deleted from database properly
- Cache not invalidated after cancellation
- Query not refetching after mutation

**Investigation needed**:
1. Check `/backend/src/bookings/bookings.service.ts` - `cancelBooking` method
2. Verify booking is actually marked as CANCELLED in database
3. Check if frontend query invalidation works: `queryClient.invalidateQueries({ queryKey: ['availableSlots'] })`
4. Add logging to see if slots are being filtered correctly

## 4. Fix Toast Error Messages Language
**Problem**: Error messages appear in English instead of Polish
**Location**: Check all mutation error handlers
- `/frontend/src/hooks/useCreateBooking.ts`
- `/frontend/src/hooks/useCancelBooking.ts`
- `/frontend/src/hooks/useBookingActions.ts`

**Solution**: Ensure error messages use `t()` translations, not hardcoded strings

## 5. Add "Today" indicator to calendar legend ✅ DONE
- Added todayLabel to BookingLegend component
- Added translations

## Implementation Priority:
1. **HIGH**: Fix backend bug with red slot (critical - prevents bookings)
2. **HIGH**: Add cancel button for clients
3. **MEDIUM**: Fix error message language
4. **LOW**: RWD improvements (if needed after testing)
