// src/app/api/racks/[rackId]/items/route.ts

import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { connectToDatabase } from './../../../../../lib/mongodb'; // <-- Import düzeltildi

// Belirli bir rafa ait ürünleri GET (listele)
export async function GET(req: Request, { params }: { params: { rackId: string } }) {
  try {
    const { rackId } = params;

    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('items');

    const items = await collection.find({ rackId: rackId }).toArray();

    return NextResponse.json(items, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching items for rack:', error);
    return NextResponse.json(
      { message: 'Error fetching items', error: error.message },
      { status: 500 },
    );
  }
}

// Belirli bir rafa yeni ürün POST (ekle)
export async function POST(req: Request, { params }: { params: { rackId: string } }) {
  try {
    const { rackId } = params;
    const body = await req.json();

    const { mongoClient: client, db: database } = await connectToDatabase(); // <-- Kullanım düzeltildi
    const collection = database.collection('items');

    const newItem = {
      rackId: rackId,
      productCode: body.productCode,
      productName: body.productName,
      quantity: Number(body.quantity),
      unit: body.unit,
      status: body.status || 'Mevcut',
      addedBy: body.addedBy || 'Operatör',
      addedAt: new Date(),
      lastEditedAt: new Date(),
    };

    const result = await collection.insertOne(newItem);
    console.log('Item added to rack successfully:', result.insertedId);

    return NextResponse.json(
      { message: 'Item added successfully', item: newItem, id: result.insertedId },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error adding item to rack:', error);
    return NextResponse.json(
      { message: 'Error adding item', error: error.message },
      { status: 500 },
    );
  }
}
