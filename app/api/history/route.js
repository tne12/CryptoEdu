// app/api/history/route.js
import { NextResponse } from 'next/server';
import { insertHistory, fetchHistory, deleteHistory, deleteAllHistory } from '../../../lib/db';




// POST request: Insert new encryption history data into the database
export async function POST(req) {
  try {
    const { user_id, cipher_type, plaintext, encrypted_text, key_a, key_b, operation } = await req.json();
    const id = await insertHistory(user_id, cipher_type, plaintext, encrypted_text, key_a, key_b, operation);
    return NextResponse.json({ message: 'Data inserted successfully', id }, { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// GET request: Fetch encryption history data from the database
export async function GET() {
  try {
    const rows = await fetchHistory();
    const payload = rows.map(r => ({
      id:         r.id.toString(),
      // Convert "YYYY-MM-DD hh:mm:ss" → ISO string
      timestamp:  new Date(r.created_at.replace(' ', 'T') + 'Z').toISOString(),
      // Capitalize the first letter so it reads nicely
      cipherType: r.cipher_type.charAt(0).toUpperCase() + r.cipher_type.slice(1),
      input:      r.plaintext,
      output:     r.encrypted_text,
      // If you add an `operation` column, use it; otherwise default here:
      operation:  r.operation,     
      key:        r.key_a != null ? `${r.key_a}, ${r.key_b}` : undefined
    }));
    return NextResponse.json(payload);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Single‑row delete when ?id=123
    if (searchParams.has('id')) {
      const id = Number(searchParams.get('id'));
      const changes = await deleteHistory(id);
      if (changes === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Deleted', id }, { status: 200 });
    }

    // clear‐all delete
    if (searchParams.get('all') === 'true') {
      const userId = Number(searchParams.get('user_id'));
      if (!userId) {
        return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
      }
      const changes = await deleteAllHistory(userId);
      return NextResponse.json(
        { message: `Deleted ${changes} rows` },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Nothing to delete' }, { status: 400 });
  } catch (err) {
    console.error('DELETE /api/history error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}