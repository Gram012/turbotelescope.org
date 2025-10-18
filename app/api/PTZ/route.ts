import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // List all blobs and get the most recent one
        const { blobs } = await list({
            limit: 100, // Adjust based on how many files you expect
            prefix: 'capture_', // Match your filename pattern from the batch script
        });

        if (blobs.length === 0) {
            return NextResponse.json({ url: null, error: 'No images found' });
        }

        // Sort by uploadedAt to get the most recent
        const sortedBlobs = blobs.sort((a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        const latestBlob = sortedBlobs[0];

        return NextResponse.json({
            url: latestBlob.url,
            uploadedAt: latestBlob.uploadedAt,
            filename: latestBlob.pathname
        });
    } catch (error) {
        console.error('Error fetching latest image:', error);
        return NextResponse.json({ url: null, error: 'Failed to fetch image' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; // Disable caching for this route