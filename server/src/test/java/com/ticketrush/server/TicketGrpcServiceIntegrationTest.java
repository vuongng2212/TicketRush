package com.ticketrush.server;

import com.ticketrush.server.grpc.CheckInRequest;
import com.ticketrush.server.grpc.CheckInResponse;
import com.ticketrush.server.grpc.TicketServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import com.ticketrush.server.domain.order.Ticket;
import com.ticketrush.server.domain.order.TicketRepository;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class TicketGrpcServiceIntegrationTest {

    private ManagedChannel channel;
    private TicketServiceGrpc.TicketServiceBlockingStub blockingStub;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    @BeforeEach
    public void setup() {
        channel = ManagedChannelBuilder.forAddress("localhost", 50051)
                .usePlaintext()
                .build();
        blockingStub = TicketServiceGrpc.newBlockingStub(channel);
        transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @AfterEach
    public void tearDown() {
        if (channel != null) {
            channel.shutdown();
        }
    }

    @Test
    public void testCheckInSuccess() {
        // Prepare ticket in DB (using TransactionTemplate to ensure it is committed outside the test thread's transaction context)
        String ticketCode = "TICKET-GRPC-TEST-" + UUID.randomUUID();
        Ticket ticket = transactionTemplate.execute(status -> {
            Ticket t = Ticket.builder()
                    .orderId(UUID.randomUUID())
                    .seatId(UUID.randomUUID())
                    .ticketCode(ticketCode)
                    .checkInStatus(false)
                    .build();
            return ticketRepository.save(t);
        });

        assertNotNull(ticket);

        CheckInRequest request = CheckInRequest.newBuilder()
                .setTicketToken(ticketCode)
                .setAdminSecret("super-admin-secret-key-123456")
                .build();

        CheckInResponse response = blockingStub.checkInTicket(request);

        assertNotNull(response);
        assertEquals(CheckInResponse.Status.SUCCESS, response.getStatus());
        assertEquals(ticket.getId().toString(), response.getTicketId());

        // Reload from DB and verify status
        Ticket updatedTicket = ticketRepository.findById(ticket.getId()).orElseThrow();
        assertEquals(true, updatedTicket.getCheckInStatus());
        assertNotNull(updatedTicket.getCheckInTime());
    }

    @Test
    public void testCheckInInvalidToken() {
        CheckInRequest request = CheckInRequest.newBuilder()
                .setTicketToken("INVALID-TOKEN-12345")
                .setAdminSecret("super-admin-secret-key-123456")
                .build();

        CheckInResponse response = blockingStub.checkInTicket(request);

        assertNotNull(response);
        assertEquals(CheckInResponse.Status.INVALID_TICKET, response.getStatus());
    }

    @Test
    public void testCheckInAlreadyCheckedIn() {
        String ticketCode = "TICKET-GRPC-TEST-USED-" + UUID.randomUUID();
        Ticket ticket = transactionTemplate.execute(status -> {
            Ticket t = Ticket.builder()
                    .orderId(UUID.randomUUID())
                    .seatId(UUID.randomUUID())
                    .ticketCode(ticketCode)
                    .checkInStatus(true) // already checked in
                    .build();
            return ticketRepository.save(t);
        });

        assertNotNull(ticket);

        CheckInRequest request = CheckInRequest.newBuilder()
                .setTicketToken(ticketCode)
                .setAdminSecret("super-admin-secret-key-123456")
                .build();

        CheckInResponse response = blockingStub.checkInTicket(request);

        assertNotNull(response);
        assertEquals(CheckInResponse.Status.ALREADY_CHECKED_IN, response.getStatus());
    }

    @Test
    public void testCheckInUnauthorized() {
        CheckInRequest request = CheckInRequest.newBuilder()
                .setTicketToken("SOME-TOKEN")
                .setAdminSecret("WRONG-SECRET")
                .build();

        CheckInResponse response = blockingStub.checkInTicket(request);

        assertNotNull(response);
        assertEquals(CheckInResponse.Status.UNAUTHORIZED, response.getStatus());
    }
}
