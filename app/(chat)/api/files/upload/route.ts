import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';
import type { PutBlobResult } from '@vercel/blob';
import { getPdfContentFromUrl, getTextContentFromUrl } from '@/lib/utils/fileHandler'
import { createResource, saveChat } from '@/lib/db/queries';
import { TopicIds } from '@/lib/definitions';
const allowedFileTypes = ['image/png', 'image/jpeg', 'application/pdf', 'text/plain', 'text/markdown']
// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => allowedFileTypes.includes(file.type), {
      message: 'File type should be images (jpeg,png) or files (pdf)',
    }),
});

const createResourceByBlob = async (fileId: string, chatId: string, data: PutBlobResult) => {
  let content: string;

  if (data.contentType === "application/pdf") {
    content = await getPdfContentFromUrl(data.downloadUrl);
  } else if (data.contentType === "text/plain" || data.contentType === "text/markdown") {
    content = await getTextContentFromUrl(data.downloadUrl);
  } else {
    throw new Error("Unsupported file type");
  }
  await createResource({ id: fileId, content, chatId });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const fileId = formData.get('fileId') as string;
    const chatId = formData.get('chatId') as string;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get('file') as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${filename}`, fileBuffer, {
        access: 'public',
      });
      // chat entry placeholder for the source foreign key
      await saveChat({
        id: chatId, userId: session.user.id,
        title: "new chat start with attachment",
        topicId: TopicIds.general, topicInputValues: null
      });
      await createResourceByBlob(fileId, chatId, data);


      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
