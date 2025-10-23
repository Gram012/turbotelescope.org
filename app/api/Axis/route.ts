import { list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { blobs } = await list({
            limit: 10000,
            prefix: 'Axis_Cam/capture_',
        });

        if (blobs.length === 0) {
            return NextResponse.json({ url: null, error: 'No images found' });
        }

        const sortedBlobs = blobs.sort((a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        if (sortedBlobs.length > 20) {
            const blobsToDelete = sortedBlobs.slice(20);
            await Promise.all(
                blobsToDelete.map(blob => del(blob.url))
            );
        }

        const latestBlob = sortedBlobs[0];
        // console.log(latestBlob)

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

export const dynamic = 'force-dynamic'; 