import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/user/mcp-tokens/[tokenId] - Update MCP token status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { tokenId } = resolvedParams;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify token belongs to user
    const existingToken = await prisma.mCPToken.findFirst({
      where: { id: tokenId, userId: user.id },
    });

    if (!existingToken) {
      return NextResponse.json({ error: 'MCP token not found' }, { status: 404 });
    }

    // Update token status
    const updatedToken = await prisma.mCPToken.update({
      where: { id: tokenId },
      data: { isActive },
    });

    return NextResponse.json({
      message: 'MCP token updated successfully',
      token: {
        id: updatedToken.id,
        name: updatedToken.name,
        keyPrefix: updatedToken.keyPrefix,
        isActive: updatedToken.isActive,
        lastUsed: updatedToken.lastUsed,
        createdAt: updatedToken.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating MCP token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/mcp-tokens/[tokenId] - Delete MCP token
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { tokenId } = resolvedParams;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify token belongs to user
    const existingToken = await prisma.mCPToken.findFirst({
      where: { id: tokenId, userId: user.id },
    });

    if (!existingToken) {
      return NextResponse.json({ error: 'MCP token not found' }, { status: 404 });
    }

    // Delete token
    await prisma.mCPToken.delete({
      where: { id: tokenId },
    });

    return NextResponse.json({ message: 'MCP token deleted successfully' });
  } catch (error) {
    console.error('Error deleting MCP token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}