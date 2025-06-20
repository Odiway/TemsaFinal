// src/app/api/racks/[rackId]/route.ts

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { connectToDatabase } from './../../../../lib/mongodb'; // <-- Import düzeltildi

// Belirli bir rafı GET (al)
export async function GET(req: Request, { params }: { params: { rackId: string } }) {
  try {
    const { rackId } = params;

    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('racks');

    const rack = await collection.findOne({ rackId: rackId });

    if (!rack) {
      return NextResponse.json({ message: 'Rack not found' }, { status: 404 });
    }

    return NextResponse.json(rack, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching rack:', error);
    return NextResponse.json(
      { message: 'Error fetching rack', error: error.message },
      { status: 500 },
    );
  }
}

// Belirli bir rafı PUT (güncelle)
export async function PUT(req: Request, { params }: { params: { rackId: string } }) {
  try {
    const { rackId } = params;
    const body = await req.json();

    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('racks');

    const result = await collection.updateOne(
      { rackId: rackId },
      { $set: { ...body, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Rack not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Rack updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating rack:', error);
    return NextResponse.json(
      { message: 'Error updating rack', error: error.message },
      { status: 500 },
    );
  }
}

// Belirli bir rafı DELETE (sil)
export async function DELETE(req: Request, { params }: { params: { rackId: string } }) {
  try {
    const { rackId } = params;

    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('racks');

    const result = await collection.deleteOne({ rackId: rackId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Rack not found' }, { status: 404 });
    }

    // Rafla ilişkili tüm ürünleri de sil (Cascading delete)
    const itemsCollection = database.collection('items');
    await itemsCollection.deleteMany({ rackId: rackId });

    return NextResponse.json(
      { message: 'Rack and its items deleted successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error deleting rack:', error);
    return NextResponse.json(
      { message: 'Error deleting rack', error: error.message },
      { status: 500 },
    );
  }
}
