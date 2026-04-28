export async function POST(req) {
  try {
    const body = await req.json()
    return new Response(JSON.stringify({ success: true, received: body }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
