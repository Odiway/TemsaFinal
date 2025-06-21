import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

// MongoDB URI from environment
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// 🔧 Extend globalThis to define _mongoClientPromise
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Prevent multiple MongoClient instances during dev (HMR)
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const database = client.db('predictive_maintenance_sim');
    const collection = database.collection('bus_sensor_data');

    const body = await req.json();
    const newData = {
      ...body,
      receivedAt: new Date(),
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
    };

    const result = await collection.insertOne(newData);

    return NextResponse.json(
      { message: 'Data stored successfully', id: result.insertedId },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error storing data:', message);
    return NextResponse.json({ error: 'Error storing data', details: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const database = client.db('predictive_maintenance_sim');
    const collection = database.collection('bus_sensor_data');

    const data = await collection.find({}).sort({ timestamp: -1 }).limit(1).toArray();

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching data:', message);
    return NextResponse.json({ message: 'Error fetching data', error: message }, { status: 500 });
  }
}
