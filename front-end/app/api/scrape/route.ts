import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 })
  }

  try {
    // Simple mock scraping - in production, you'd use a proper scraping service
    // For now, return mock data to demonstrate the functionality
    const mockData = {
      title: 'Sample Opportunity Title',
      description: 'This is a sample description extracted from the link. In production, this would contain the actual content from the webpage.',
      organization: 'Sample Organization',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop'
    }

    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({ 
      success: true, 
      ...mockData 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to scrape the URL' 
    }, { status: 500 })
  }
}
