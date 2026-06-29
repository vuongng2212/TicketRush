## 1. Backend gRPC Server Setup & Protobuf Integration

- [ ] 1.1 Add gRPC Server dependencies and protobuf maven plugin to backend pom.xml
- [ ] 1.2 Create ticket.proto file and compile classes using Maven
- [ ] 1.3 Implement TicketGrpcService extending Generated TicketServiceGrpc.TicketServiceImplBase
- [ ] 1.4 Expose secure/unsecure gRPC endpoint on port 50051 with check-in verification logic in DB

## 2. Next.js Client Admin Scanner & gRPC Client Gateway

- [ ] 2.1 Add @grpc/grpc-js, @grpc/proto-loader, and html5-qrcode dependencies to Next.js package.json
- [ ] 2.2 Implement Next.js API API route `/api/admin/check-in` acting as gRPC client connecting to backend on 50051
- [ ] 2.3 Create Admin Layout and Scanner Page `/admin/scanner` with QR camera detection
- [ ] 2.4 Handle camera request permissions, display scan feedback notifications (Success/Failure/Duplicate)

## 3. k6 Performance Load Testing Setup & Execution

- [ ] 3.1 Create directory `load-tests/` at project root and create `booking-load-test.js` script
- [ ] 3.2 Implement booking scenario: registration, login, fetch concert details, select seat, call holdSeat mutation
- [ ] 3.3 Run load test script using k6 local engine and log performance results to a benchmark summary file
