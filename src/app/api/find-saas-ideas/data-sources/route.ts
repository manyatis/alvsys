import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all data sources
export async function GET() {
  try {
    const dataSources = await prisma.dataSource.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      dataSources
    });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}

// POST new data source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, url, config, isActive, scrapeInterval } = body;

    const dataSource = await prisma.dataSource.create({
      data: {
        name,
        type,
        url,
        config: config || {},
        isActive: isActive ?? true,
        scrapeInterval
      }
    });

    return NextResponse.json({
      success: true,
      dataSource
    });
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    );
  }
}

// PUT update data source
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const dataSource = await prisma.dataSource.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      dataSource
    });
  } catch (error) {
    console.error('Error updating data source:', error);
    return NextResponse.json(
      { error: 'Failed to update data source' },
      { status: 500 }
    );
  }
}

// DELETE data source
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.dataSource.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Data source deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting data source:', error);
    return NextResponse.json(
      { error: 'Failed to delete data source' },
      { status: 500 }
    );
  }
}