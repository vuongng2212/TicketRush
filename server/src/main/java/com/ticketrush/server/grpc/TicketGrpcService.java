package com.ticketrush.server.grpc;

import com.ticketrush.server.domain.concert.Concert;
import com.ticketrush.server.domain.concert.ConcertRepository;
import com.ticketrush.server.domain.concert.Seat;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.order.Order;
import com.ticketrush.server.domain.order.OrderRepository;
import com.ticketrush.server.domain.order.Ticket;
import com.ticketrush.server.domain.order.TicketRepository;
import com.ticketrush.server.domain.user.User;
import com.ticketrush.server.domain.user.UserRepository;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class TicketGrpcService extends TicketServiceGrpc.TicketServiceImplBase {

    private final TicketRepository ticketRepository;
    private final OrderRepository orderRepository;
    private final SeatRepository seatRepository;
    private final ConcertRepository concertRepository;
    private final UserRepository userRepository;

    private static final String ADMIN_SECRET = "super-admin-secret-key-123456";

    @Override
    @Transactional
    public void checkInTicket(CheckInRequest request, StreamObserver<CheckInResponse> responseObserver) {
        log.info("Received gRPC check-in request for token: {}", request.getTicketToken());

        // Validate admin token
        if (!ADMIN_SECRET.equals(request.getAdminSecret())) {
            log.warn("Unauthorized gRPC check-in attempt using secret: {}", request.getAdminSecret());
            responseObserver.onNext(CheckInResponse.newBuilder()
                    .setStatus(CheckInResponse.Status.UNAUTHORIZED)
                    .build());
            responseObserver.onCompleted();
            return;
        }

        // Find ticket
        Optional<Ticket> ticketOpt = ticketRepository.findByTicketCode(request.getTicketToken());
        if (ticketOpt.isEmpty()) {
            log.warn("Ticket token not found: {}", request.getTicketToken());
            responseObserver.onNext(CheckInResponse.newBuilder()
                    .setStatus(CheckInResponse.Status.INVALID_TICKET)
                    .build());
            responseObserver.onCompleted();
            return;
        }

        Ticket ticket = ticketOpt.get();

        // Check if already checked in
        if (Boolean.TRUE.equals(ticket.getCheckInStatus())) {
            log.info("Ticket already checked in: {}", request.getTicketToken());
            responseObserver.onNext(CheckInResponse.newBuilder()
                    .setStatus(CheckInResponse.Status.ALREADY_CHECKED_IN)
                    .setTicketId(ticket.getId().toString())
                    .build());
            responseObserver.onCompleted();
            return;
        }

        // Complete check-in in DB
        ticket.setCheckInStatus(true);
        ticket.setCheckInTime(LocalDateTime.now());
        ticketRepository.saveAndFlush(ticket);

        // Fetch additional info for response
        String seatNumber = "Unknown Seat";
        String attendeeName = "Unknown Attendee";

        Optional<Order> orderOpt = orderRepository.findById(ticket.getOrderId());
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            Optional<User> userOpt = userRepository.findById(order.getUserId());
            if (userOpt.isPresent()) {
                attendeeName = userOpt.get().getEmail();
            }
        }

        Optional<Seat> seatOpt = seatRepository.findById(ticket.getSeatId());
        if (seatOpt.isPresent()) {
            Seat seat = seatOpt.get();
            seatNumber = seat.getSeatNumber();
        }

        String finalConcertTitle = getConcertTitleForTicket(ticket);

        CheckInResponse response = CheckInResponse.newBuilder()
                .setStatus(CheckInResponse.Status.SUCCESS)
                .setTicketId(ticket.getId().toString())
                .setConcertTitle(finalConcertTitle)
                .setSeatNumber(seatNumber)
                .setAttendeeName(attendeeName)
                .setCheckedInAt(ticket.getCheckInTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();

        log.info("gRPC check-in successful for ticket token: {}", request.getTicketToken());
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    private String getConcertTitleForTicket(Ticket ticket) {
        try {
            Optional<Seat> seatOpt = seatRepository.findById(ticket.getSeatId());
            if (seatOpt.isPresent()) {
                List<Concert> concerts = concertRepository.findAll();
                if (!concerts.isEmpty()) {
                    return concerts.get(0).getTitle();
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract concert title", e);
        }
        return "TicketRush Live Concert";
    }
}
