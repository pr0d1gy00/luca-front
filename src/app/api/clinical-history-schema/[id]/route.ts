import { NextResponse } from 'next/server';
import type { ClinicalHistorySchema } from '@/features/clinical-history-builder/types';
import { getSchema, setSchema, deleteSchema } from '../../../../lib/api/clinical-history/shared-store';

// ─── GET: Single schema ─────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const schema = getSchema(id);
  if (!schema) {
    return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
  }

  return NextResponse.json({ schema });
}

// ─── PATCH: Partial update (status, name, etc.) ─────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const existing = getSchema(id);
  if (!existing) {
    return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;

    const updated = {
      ...existing,
      ...body,
      id, // prevent id override
      updatedAt: new Date().toISOString(),
    };

    setSchema(id, updated as ClinicalHistorySchema);

    return NextResponse.json({ schema: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

// ─── DELETE ─────────────────────────────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  if (!getSchema(id)) {
    return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
  }

  deleteSchema(id);
  return NextResponse.json({ deleted: id });
}