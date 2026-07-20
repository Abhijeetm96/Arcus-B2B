import { test, describe, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { addBooking, getAllBookings, getBookingsByUserId, updateBookingStatus } from './RFQService';
import * as db from '../../database/db';

describe('RFQ / Booking Service Tests', () => {
  let mockBookings: any[] = [];

  before(() => {
    mock.method(db, 'readJsonDb', () => {
      return { bookings: mockBookings };
    });

    mock.method(db, 'writeJsonDb', (data: any) => {
      mockBookings = data.bookings;
      return true;
    });

    // Disable postgres mode
    (db as any).usePostgres = false;
  });

  after(() => {
    mock.reset();
  });

  test('should successfully add a booking and filter by userId', async () => {
    mockBookings = [];
    const newBooking = await addBooking({
      serviceName: 'Carpentry',
      date: '2026-07-28',
      name: 'Test Client',
      phone: '9876543210',
      userId: 'test-user-id',
      notes: 'Please call before arrival'
    });

    assert.ok(newBooking.id);
    assert.strictEqual(newBooking.userId, 'test-user-id');
    assert.strictEqual(newBooking.status, 'Pending');

    const all = await getAllBookings();
    assert.strictEqual(all.length, 1);

    const filteredById = await getBookingsByUserId('test-user-id');
    assert.strictEqual(filteredById.length, 1);
    assert.strictEqual(filteredById[0].phone, '9876543210');
  });

  test('should successfully update booking status', async () => {
    mockBookings = [{
      id: 'b-123',
      userId: 'test-user-id',
      status: 'Pending',
      serviceName: 'Carpentry',
      date: '2026-07-28',
      name: 'Test Client',
      phone: '9876543210'
    }];

    const success = await updateBookingStatus('b-123', 'Confirmed');
    assert.ok(success);

    const all = await getAllBookings();
    assert.strictEqual(all[0].status, 'Confirmed');
  });
});
