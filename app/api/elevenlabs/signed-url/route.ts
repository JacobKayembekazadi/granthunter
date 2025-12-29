import { NextRequest, NextResponse } from 'next/server';

// API route to get a signed URL for ElevenLabs Conversational AI
// This keeps the API key secure on the server side
export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        const agentId = process.env.ELEVENLABS_AGENT_ID;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'ElevenLabs API key not configured' },
                { status: 500 }
            );
        }

        if (!agentId) {
            return NextResponse.json(
                { error: 'ElevenLabs Agent ID not configured' },
                { status: 500 }
            );
        }

        // Get signed URL from ElevenLabs
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                method: 'GET',
                headers: {
                    'xi-api-key': apiKey,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get signed URL from ElevenLabs' },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            signedUrl: data.signed_url,
            agentId
        });
    } catch (error: any) {
        console.error('Error getting ElevenLabs signed URL:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
