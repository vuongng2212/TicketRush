import { NextResponse } from 'next/server';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

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

const ticketProto = grpc.loadPackageDefinition(packageDefinition).ticket as any;

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

    return new Promise((resolve) => {
      client.CheckInTicket(
        {
          ticketToken: ticketToken,
          adminSecret: 'super-admin-secret-key-123456',
        },
        (error: any, response: any) => {
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
  } catch (err: any) {
    console.error('API Handler Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
