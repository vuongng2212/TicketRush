import { NextResponse } from 'next/server';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// Define gRPC service and message types
interface CheckInRequest {
  ticketToken: string;
  adminSecret: string;
}

interface CheckInResponse {
  status: string;
  ticketId?: string;
  concertTitle?: string;
  seatNumber?: string;
  attendeeName?: string;
  checkedInAt?: string;
  error?: string;
}

interface TicketServiceClient extends grpc.Client {
  CheckInTicket(
    request: CheckInRequest,
    callback: (error: grpc.ServiceError | null, response: CheckInResponse) => void
  ): void;
}

interface TicketProto {
  TicketService: new (
    address: string,
    credentials: grpc.ChannelCredentials
  ) => TicketServiceClient;
}

// Paths to proto file
const PROTO_PATH = path.join(process.cwd(), '../server/src/main/proto/ticket.proto');

// Load protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const ticketProto = (grpc.loadPackageDefinition(packageDefinition).ticket as unknown) as TicketProto;

// gRPC Client setup
const client = new ticketProto.TicketService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

export async function POST(request: Request) {
  try {
    const { ticketToken } = await request.json();

    if (!ticketToken) {
      return NextResponse.json({ error: 'Ticket token is required' }, { status: 400 });
    }

    return new Promise<Response>((resolve) => {
      client.CheckInTicket(
        {
          ticketToken: ticketToken,
          adminSecret: 'super-admin-secret-key-123456',
        },
        (error: grpc.ServiceError | null, response: CheckInResponse) => {
          if (error) {
            console.error('gRPC CheckIn Error:', error);
            resolve(
              NextResponse.json(
                { error: error.message || 'gRPC Server Connection Failed' },
                { status: 500 }
              )
            );
          } else {
            resolve(NextResponse.json(response));
          }
        }
      );
    });
  } catch (err) {
    console.error('API Handler Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
