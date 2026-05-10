import { bookingService } from "../services/booking.service.js";

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getTrainerBookings(req.user);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const bookAndPay = async (req, res, next) => {
  try {
    const payment = await bookingService.bookAndPay(req.body, req.user);

    res.status(201).json({
      success: true,
      message: "Booking confirmed and payment received",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
