import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

const receiptSchema = z.object({
  amount: z.number().describe('The total amount from the receipt in euros'),
  date: z.string().describe('The date from the receipt in YYYY-MM-DD format'),
  confidence: z.number().min(0).max(1).describe('Confidence level of the extraction (0-1)'),
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'Tiedosto puuttuu' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type

    // Use OpenAI to extract receipt data
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: receiptSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: `data:${mimeType};base64,${base64}`,
            },
            {
              type: 'text',
              text: `Extract the following information from this receipt image:
1. The total amount (in euros)
2. The date of the purchase

If you cannot find a clear total amount, look for the largest monetary value or the final sum.
If you cannot find a clear date, use today's date.
Provide a confidence score for how certain you are about the extracted values.

Return the amount as a number (e.g., 45.50) and the date in YYYY-MM-DD format.`,
            },
          ],
        },
      ],
    })

    return Response.json({
      amount: object.amount,
      date: object.date,
      confidence: object.confidence,
    })
  } catch (error) {
    console.error('Receipt scan error:', error)
    return Response.json(
      { error: 'Kuitin lukeminen epäonnistui. Yritä uudelleen.' },
      { status: 500 }
    )
  }
}
