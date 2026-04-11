import { Metadata } from 'next';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = params.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  try {
    // We use native fetch here for App Router caching benefits
    const res = await fetch(`${apiUrl}/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Product fetch failed');
    
    const product = await res.json();

    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    const description = product.description.substring(0, 160) + (product.description.length > 160 ? '...' : '');

    return {
      title: product.title,
      description: description,
      openGraph: {
        title: product.title,
        description: description,
        url: `https://dropbest.vercel.app/products/${id}`,
        images: [
          {
            url: product.image_url, // Highly powerful SEO tool -> rich image preview anywhere the link is shared
            width: 800,
            height: 800,
            alt: product.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: description,
        images: [product.image_url], 
      },
    };
  } catch (error) {
    return {
      title: 'Product Details',
    }
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
