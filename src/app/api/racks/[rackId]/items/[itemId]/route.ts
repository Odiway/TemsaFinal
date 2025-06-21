import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  context: { params: { rackId: string; itemId: string } },
) {
  const { rackId, itemId } = context.params;
  const { db } = await connectToDatabase();

  const item = await db.collection('items').findOne({ _id: new ObjectId(itemId), rackId });

  if (!item) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(
  request: NextRequest,
  context: { params: { rackId: string; itemId: string } },
) {
  const { rackId, itemId } = context.params;
  const body = await request.json();
  const { db } = await connectToDatabase();

  const result = await db
    .collection('items')
    .updateOne(
      { _id: new ObjectId(itemId), rackId },
      { $set: { ...body, lastEditedAt: new Date() } },
    );

  if (result.matchedCount === 0) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Item updated successfully' });
}

export async function DELETE(
  request: NextRequest,
  context: { params: { rackId: string; itemId: string } },
) {
  const { rackId, itemId } = context.params;
  const { db } = await connectToDatabase();

  const result = await db.collection('items').deleteOne({ _id: new ObjectId(itemId), rackId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Item deleted successfully' });
}
