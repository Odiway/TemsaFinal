// src/app/api/racks/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from './../../../lib/mongodb'; // <-- Import düzeltildi
import { v4 as uuidv4 } from 'uuid'; // uuid kütüphanesini kullanacağız

// Tüm rafları GET (listele)
export async function GET(req: Request) {
  try {
    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('racks');

    const racks = await collection.find({}).toArray();

    return NextResponse.json(racks, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching racks:', error);
    return NextResponse.json(
      { message: 'Error fetching racks', error: error.message },
      { status: 500 },
    );
  }
}

// Yeni bir raf POST (oluştur)
export async function POST(req: Request) {
  try {
    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('racks');

    const body = await req.json();
    const newRack = {
      rackId: uuidv4(), // Benzersiz bir raf ID'si oluştur
      name: body.name,
      location: body.location,
      description: body.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newRack);
    console.log('Rack created successfully:', result.insertedId);

    // QR kod verisi olarak rackId'yi döndür
    return NextResponse.json(
      { message: 'Rack created successfully', rack: newRack, id: result.insertedId },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating rack:', error);
    return NextResponse.json(
      { message: 'Error creating rack', error: error.message },
      { status: 500 },
    );
  }
}
