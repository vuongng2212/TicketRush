package com.ticketrush.server.grpc;

import com.ticketrush.server.domain.concert.Concert;
import com.ticketrush.server.domain.concert.ConcertRepository;
import com.ticketrush.server.domain.concert.SeatRepository;
import com.ticketrush.server.domain.order.OrderRepository;
import com.ticketrush.server.domain.order.TicketRepository;
import com.ticketrush.server.domain.user.UserRepository;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TicketGrpcServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private ConcertRepository concertRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TicketGrpcService ticketGrpcService;

    @Mock
    private StreamObserver<CheckInResponse> responseObserver;

    @Test
    public void testCheckInSuccess_ExceptionHandling() {
        // Mock a scenario where concertRepository.findAll() throws an exception
        CheckInRequest request = CheckInRequest.newBuilder()
                .setTicketToken("TOKEN")
                .setAdminSecret("super-admin-secret-key-123456")
                .build();

        when(ticketRepository.findByTicketCode("TOKEN")).thenReturn(Optional.of(
                com.ticketrush.server.domain.order.Ticket.builder()
                        .id(java.util.UUID.randomUUID())
                        .ticketCode("TOKEN")
                        .seatId(java.util.UUID.randomUUID())
                        .checkInStatus(false)
                        .build()
        ));
        when(seatRepository.findById(any())).thenReturn(Optional.of(
                com.ticketrush.server.domain.concert.Seat.builder().seatNumber("A1").build()
        ));
        when(concertRepository.findAll()).thenThrow(new RuntimeException("DB Error"));

        ticketGrpcService.checkInTicket(request, responseObserver);

        verify(responseObserver).onNext(any(CheckInResponse.class));
        verify(responseObserver).onCompleted();
    }
}
