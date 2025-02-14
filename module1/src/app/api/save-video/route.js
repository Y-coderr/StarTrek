// app/api/save-video/route.js
import { mkdir } from 'fs/promises';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST ( req )
{
        try
        {
                // Create videos directory if it doesn't exist
                const videoDir=join( process.cwd(), 'public', 'videos' );
                try
                {
                        await mkdir( videoDir, { recursive: true } );
                } catch ( err )
                {
                        if ( err.code!=='EEXIST' ) throw err;
                }

                const data=await req.blob();
                const fileName=`video_${ Date.now() }.webm`;
                const videoPath=join( videoDir, fileName );

                // Convert blob to buffer and save
                const buffer=Buffer.from( await data.arrayBuffer() );
                await writeFile( videoPath, buffer );

                return NextResponse.json( { success: true, path: `/videos/${ fileName }` } );
        } catch ( error )
        {
                console.error( 'Error saving video:', error );
                return NextResponse.json( { error: 'Error saving video' }, { status: 500 } );
        }
}       