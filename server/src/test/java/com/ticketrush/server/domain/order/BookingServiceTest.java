package com.ticketrush.server.domain.order;

import com.ticketrush.server.domain.concert.Seat;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.concert.SeatStatus;
import com.ticketrush.server.domain.concert.SeatUpdatedPayload;
import com.ticketrush.server.domain.concert.SeatZone;
import com.ticketrush.server.domain.concert.SeatZoneRepository;
import com.ticketrush.server.infrastructure.graphql.SeatEventPublisher;
import com.ticketrush.server.infrastructure.rabbitmq.ExpirationMessageProducer;
import com.ticketrush.server.infrastructure.redis.RedisReservationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private SeatRepository seatRepository;
    @Mock
    private SeatZoneRepository seatZoneRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private RedisReservationService redisReservationService;
    @Mock
    private ExpirationMessageProducer expirationProducer;
    @Mock
    private SeatEventPublisher seatEventPublisher;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void holdSeat_seatNotFound() {
        UUID seatId = UUID.randomUUID();
        when(seatRepository.findById(seatId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.holdSeat(seatId, UUID.randomUUID(), 1000L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Seat not found");
    }

    @Test
    void holdSeat_zoneNotFound() {
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.AVAILABLE).build();
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        when(seatZoneRepository.findById(zoneId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.holdSeat(seatId, UUID.randomUUID(), 1000L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Seat zone not found");
    }

    @Test
    void holdSeat_redisAlreadyLocked() {
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID concertId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.AVAILABLE).build();
        SeatZone zone = SeatZone.builder().id(zoneId).concertId(concertId).price(BigDecimal.TEN).totalSeats(1).build();

        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        when(seatZoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(redisReservationService.holdSeat(concertId, seatId, userId)).thenReturn(false);

        assertThatThrownBy(() -> bookingService.holdSeat(seatId, userId, 1000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already held");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void holdSeat_seatNotAvailableInDb() {
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID concertId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.SOLD).build();
        SeatZone zone = SeatZone.builder().id(zoneId).concertId(concertId).price(BigDecimal.TEN).totalSeats(1).build();

        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        when(seatZoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(redisReservationService.holdSeat(concertId, seatId, userId)).thenReturn(true);

        assertThatThrownBy(() -> bookingService.holdSeat(seatId, userId, 1000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not available");

        verify(redisReservationService).releaseSeat(concertId, seatId);
    }

    @Test
    void holdSeat_success() {
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID concertId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.AVAILABLE).build();
        SeatZone zone = SeatZone.builder().id(zoneId).concertId(concertId).price(BigDecimal.TEN).totalSeats(1).build();

        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        when(seatZoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(redisReservationService.holdSeat(concertId, seatId, userId)).thenReturn(true);
        when(seatRepository.save(any(Seat.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        Order order = bookingService.holdSeat(seatId, userId, 1000L);

        assertThat(order).isNotNull();
        assertThat(order.getUserId()).isEqualTo(userId);
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(seat.getStatus()).isEqualTo(SeatStatus.HELD);
        assertThat(seat.getHeldByUserId()).isEqualTo(userId);
        verify(expirationProducer).sendExpirationMessage(any(UUID.class), anyLong());
        verify(seatEventPublisher).publish(any(SeatUpdatedPayload.class));
        verify(ticketRepository).save(any(Ticket.class));
    }

    @Test
    void holdSeat_dbFailureReleasesRedis() {
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID concertId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.AVAILABLE).build();
        SeatZone zone = SeatZone.builder().id(zoneId).concertId(concertId).price(BigDecimal.TEN).totalSeats(1).build();

        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        when(seatZoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(redisReservationService.holdSeat(concertId, seatId, userId)).thenReturn(true);
        when(seatRepository.save(any(Seat.class))).thenThrow(new RuntimeException("db down"));

        assertThatThrownBy(() -> bookingService.holdSeat(seatId, userId, 1000L))
                .isInstanceOf(RuntimeException.class);

        verify(redisReservationService).releaseSeat(concertId, seatId);
    }

    @Test
    void releaseExpiredOrder_orderNotFound() {
        UUID orderId = UUID.randomUUID();
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        bookingService.releaseExpiredOrder(orderId);

        verify(ticketRepository, never()).findByOrderId(any(UUID.class));
    }

    @Test
    void releaseExpiredOrder_orderNotPending() {
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder().id(orderId).status(OrderStatus.COMPLETED).build();
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        bookingService.releaseExpiredOrder(orderId);

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void releaseExpiredOrder_releasesHeldSeats() {
        UUID orderId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        UUID concertId = UUID.randomUUID();
        Order order = Order.builder().id(orderId).status(OrderStatus.PENDING_PAYMENT).build();
        Ticket ticket = Ticket.builder().id(UUID.randomUUID()).orderId(orderId).seatId(seatId).build();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.HELD).build();
        SeatZone zone = SeatZone.builder().id(zoneId).concertId(concertId).build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ticketRepository.findByOrderId(orderId)).thenReturn(List.of(ticket));
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        when(seatZoneRepository.findById(zoneId)).thenReturn(Optional.of(zone));
        when(seatRepository.save(any(Seat.class))).thenAnswer(inv -> inv.getArgument(0));

        bookingService.releaseExpiredOrder(orderId);

        assertThat(order.getStatus()).isEqualTo(OrderStatus.EXPIRED);
        assertThat(seat.getStatus()).isEqualTo(SeatStatus.AVAILABLE);
        assertThat(seat.getHeldByUserId()).isNull();
        assertThat(seat.getHeldUntil()).isNull();
        verify(redisReservationService).releaseSeat(concertId, seatId);
        verify(seatEventPublisher).publish(any(SeatUpdatedPayload.class));
    }

    @Test
    void releaseExpiredOrder_skipsNonHeldSeats() {
        UUID orderId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        Order order = Order.builder().id(orderId).status(OrderStatus.PENDING_PAYMENT).build();
        Ticket ticket = Ticket.builder().id(UUID.randomUUID()).orderId(orderId).seatId(seatId).build();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.SOLD).build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(ticketRepository.findByOrderId(orderId)).thenReturn(List.of(ticket));
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));

        bookingService.releaseExpiredOrder(orderId);

        verify(redisReservationService, never()).releaseSeat(any(UUID.class), any(UUID.class));
        verify(seatEventPublisher, never()).publish(any(SeatUpdatedPayload.class));
    }

    @Test
    void releaseExpiredOrder_skipsSeatsWithMissingZone() {
        UUID orderId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID zoneId = UUID.randomUUID();
        Order order = Order.builder().id(orderId).status(OrderStatus.PENDING_PAYMENT).build();
        Ticket ticket = Ticket.builder().id(UUID.randomUUID()).orderId(orderId).seatId(seatId).build();
        Seat seat = Seat.builder().id(seatId).seatZoneId(zoneId).status(SeatStatus.HELD).build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(ticketRepository.findByOrderId(orderId)).thenReturn(List.of(ticket));
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(seat));
        when(seatZoneRepository.findById(zoneId)).thenReturn(Optional.empty());

        bookingService.releaseExpiredOrder(orderId);

        verify(redisReservationService, never()).releaseSeat(any(UUID.class), any(UUID.class));
    }

    @Test
    void releaseExpiredOrder_skipsMissingSeats() {
        UUID orderId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        Order order = Order.builder().id(orderId).status(OrderStatus.PENDING_PAYMENT).build();
        Ticket ticket = Ticket.builder().id(UUID.randomUUID()).orderId(orderId).seatId(seatId).build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(ticketRepository.findByOrderId(orderId)).thenReturn(List.of(ticket));
        when(seatRepository.findById(seatId)).thenReturn(Optional.empty());

        bookingService.releaseExpiredOrder(orderId);
    }
}
