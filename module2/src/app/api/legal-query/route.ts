// // src/app/api/legal-query/route.ts
// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// // Initialize OpenAI client
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// // Define request body type
// interface RequestBody {
//   query: string;
//   language: string;
// }

// // Language prompts for different languages
// const languagePrompts: { [key: string]: string } = {
//   en: "You are a legal expert assistant. Please provide a clear and accurate response to the following legal query:",
//   es: "Eres un asistente experto legal. Por favor, proporciona una respuesta clara y precisa a la siguiente consulta legal:",
//   fr: "Vous êtes un assistant juridique expert. Veuillez fournir une réponse claire et précise à la requête juridique suivante :",
//   de: "Sie sind ein juristischer Experten-Assistent. Bitte geben Sie eine klare und präzise Antwort auf die folgende rechtliche Anfrage:",
//   zh: "您是一位法律专家助手。请对以下法律咨询提供清晰准确的回答："
// };

// export async function POST(request: Request) {
//   try {
//     // Validate request body
//     const body: RequestBody = await request.json();
    
//     if (!body.query || !body.language) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Validate language
//     if (!languagePrompts[body.language]) {
//       return NextResponse.json(
//         { error: 'Unsupported language' },
//         { status: 400 }
//       );
//     }

//     // Construct the prompt
//     const systemPrompt = languagePrompts[body.language];
    
//     // Call OpenAI API
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4", // Using GPT-4 for better legal understanding
//       messages: [
//         {
//           role: "system",
//           content: `${systemPrompt}\n\nProvide responses that are:\n1. Legally accurate\n2. Easy to understand\n3. Include relevant citations when appropriate\n4. Note any jurisdiction-specific considerations\n5. Highlight any limitations or uncertainties in the advice`
//         },
//         {
//           role: "user",
//           content: body.query
//         }
//       ],
//       temperature: 0.7,
//       max_tokens: 1000
//     });

//     // Extract the response
//     const response = completion.choices[0]?.message?.content || 'No response generated';

//     // Return the response
//     return NextResponse.json({
//       response,
//       language: body.language
//     });

//   } catch (error: any) {
//     console.error('Error processing legal query:', error);

//     // Handle different types of errors
//     if (error instanceof OpenAI.APIError) {
//       return NextResponse.json(
//         { error: 'Failed to process query with AI service' },
//         { status: 500 }
//       );
//     }

//     if (error.code === 'ETIMEDOUT') {
//       return NextResponse.json(
//         { error: 'Request timed out' },
//         { status: 504 }
//       );
//     }

//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // Rate limiting and request validation middleware
// export const config = {
//   api: {
//     bodyParser: true,
//     externalResolver: true,
//   },
// };