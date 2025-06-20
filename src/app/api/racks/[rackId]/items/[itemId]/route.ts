// src/app/api/racks/[rackId]/items/[itemId]/route.ts

import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { connectToDatabase } from './../../../../../../lib/mongodb'; // <-- Import düzeltildi

// Belirli bir ürünü PUT (güncelle)
export async function PUT(
  req: Request,
  { params }: { params: { rackId: string; itemId: string } },
) {
  try {
    const { rackId, itemId } = params;
    const body = await req.json();

    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('items');

    const result = await collection.updateOne(
      { _id: new ObjectId(itemId), rackId: rackId }, // Hem ID hem rackId ile eşleştir
      { $set: { ...body, lastEditedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Item not found in this rack' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { message: 'Error updating item', error: error.message },
      { status: 500 },
    );
  }
}

// Belirli bir ürünü DELETE (sil)
export async function DELETE(
  req: Request,
  { params }: { params: { rackId: string; itemId: string } },
) {
  try {
    const { rackId, itemId } = params;

    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('items');

    const result = await collection.deleteOne({ _id: new ObjectId(itemId), rackId: rackId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Item not found in this rack' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { message: 'Error deleting item', error: error.message },
      { status: 500 },
    );
  }
}
