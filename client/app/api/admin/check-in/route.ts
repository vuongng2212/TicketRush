import { NextRequest, NextResponse } from 'next/server';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

// Load proto file
const PROTO_PATH = join(process.cwd(), '..', 'server', 'src', 'main', 'proto', 'ticket.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as {
  ticket?: {
    TicketService?: grpc.ServiceClientConstructor;
  };
};

const TicketService = protoDescriptor.ticket?.TicketService;

if (!TicketService) {
  throw new Error('Failed to load TicketService from proto file');
}

const GRPC_SERVER_URL = process.env.GRPC_SERVER_URL || 'localhost:50051';

interface CheckInRequestBody {
  ticketToken: string;
}

interface CheckInResponse {
  status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID_TICKET' | 'UNAUTHORIZED' | 'UNKNOWN';
  ticketId?: string;
  concertTitle?: string;
  seatNumber?: string;
  attendeeName?: string;
  checkedInAt?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CheckInResponse>> {
  try {
    const body = (await request.json()) as CheckInRequestBody;
    const { ticketToken } = body;

    if (!ticketToken) {
      return NextResponse.json(
        { status: 'INVALID_TICKET', error: 'Missing ticketToken' },
        { status: 400 }
      );
    }

    // Create gRPC client with non-null assertion since we checked above
    const client = new TicketService!(
      GRPC_SERVER_URL,
      grpc.credentials.createInsecure()
    ) as grpc.Client & Record<string, unknown>;

    // Call gRPC method
    return await new Promise((resolve) => {
      const checkInMethod = client.CheckInTicket as unknown as (
        req: { ticketToken: string; adminSecret: string },
        cb: (err: grpc.ServiceError | null, res?: Record<string, unknown>) => void
      ) => void;
      
      checkInMethod(
        {
          ticketToken,
          adminSecret: process.env.ADMIN_SECRET || 'dev-admin-secret',
        },
        (error, response) => {
          client.close();

          if (error) {
            console.error('gRPC error:', error);
            return resolve(
              NextResponse.json(
                { status: 'UNKNOWN', error: error.message },
                { status: 500 }
              )
            );
          }

          if (!response) {
            return resolve(
              NextResponse.json(
                { status: 'UNKNOWN', error: 'No response from server' },
                { status: 500 }
              )
            );
          }

          // Map gRPC enum to string
          const statusMap: Record<number, CheckInResponse['status']> = {
            0: 'UNKNOWN',
            1: 'SUCCESS',
            2: 'ALREADY_CHECKED_IN',
            3: 'INVALID_TICKET',
            4: 'UNAUTHORIZED',
          };

          const result: CheckInResponse = {
            status: statusMap[response.status as number] || 'UNKNOWN',
            ticketId: response.ticketId as string,
            concertTitle: response.concertTitle as string,
            seatNumber: response.seatNumber as string,
            attendeeName: response.attendeeName as string,
            checkedInAt: response.checkedInAt as string,
          };

          return resolve(NextResponse.json(result));
        }
      );
    });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { status: 'UNKNOWN', error: (err as Error).message },
      { status: 500 }
    );
  }
}
