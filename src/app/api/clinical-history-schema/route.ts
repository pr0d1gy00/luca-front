import { NextResponse } from 'next/server';
import type { ClinicalHistorySchema } from '@/features/clinical-history-builder/types';
import { getSchemas, getSchema, setSchema, deleteSchema } from '@/lib/api/clinical-history/shared-store';

// ─── GET ──────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ schemas: Array.from(getSchemas().values()) });
  }

  const schema = getSchema(id);
  if (!schema) {
    return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
  }

  return NextResponse.json({ schema });
}

// ─── POST ─────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.name || !body.canvas) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, canvas' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const existing = getSchema(body.id);

    const saved = {
      ...body,
      id: body.id,
      version: existing
        ? String(parseFloat(existing.version) + 0.1)
        : '1.0.0',
      status: body.status ?? existing?.status ?? 'draft',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    setSchema(body.id, saved as ClinicalHistorySchema);

    return NextResponse.json(
      { schema: saved },
      { status: existing ? 200 : 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

// ─── DELETE ────────────────────────────────────────────────────
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
  }

  if (!getSchema(id)) {
    return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
  }

  deleteSchema(id);
  return NextResponse.json({ deleted: id });
}
