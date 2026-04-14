import { supabaseAdmin } from './src/config/supabase';

const newProducts = [
  {
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    description: "Industry Leading Noise Canceling with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30-hour battery life with quick charging.",
    price: 34990,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B09Y23L27H",
    external_rating: 4.8,
    external_review_count: "24,510+"
  },
  {
    title: "Apple MacBook Air M2 (13.6-inch)",
    description: "Incredibly thin and light laptop with M2 chip. 13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD storage, back-lit keyboard, and 1080p FaceTime HD camera.",
    price: 94900,
    category: "computers",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B0B3C9BKS8",
    external_rating: 4.9,
    external_review_count: "15,800+"
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G AI Smartphone",
    description: "Titanium exterior, 200MP camera, Snapdragon 8 Gen 3, embedded S Pen, and Galaxy AI features for live translation and circle-to-search.",
    price: 129999,
    category: "phones",
    image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B0CQYL783T",
    external_rating: 4.7,
    external_review_count: "8,900+"
  },
  {
    title: "Kindle Paperwhite (16 GB) - Signature Edition",
    description: "Now with a 6.8\" display, wireless charging, and auto-adjusting front light. Flush-front design and 300 ppi glare-free display that reads like real paper.",
    price: 17999,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B08N3J8GKP",
    external_rating: 4.6,
    external_review_count: "12,250+"
  },
  {
    title: "KitchenAid Artisan Series 5-Quart Stand Mixer",
    description: "Choose from over 20 different colors to perfectly match your kitchen design. Features 10 speeds and a 5-quart stainless steel bowl for all mixing needs.",
    price: 44990,
    category: "home-kitchen",
    image_url: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B00005UP2P",
    external_rating: 4.9,
    external_review_count: "55,000+"
  },
  {
    title: "GoPro HERO12 Black - Waterproof Action Camera",
    description: "Incredible 5.3K video, high dynamic range (HDR) for photos and video, HyperSmooth 6.0 video stabilization, and much longer battery runtime.",
    price: 37990,
    category: "camera",
    image_url: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B0CG7K5312",
    external_rating: 4.5,
    external_review_count: "4,100+"
  },
  {
    title: "Apple AirPods Pro (2nd Generation)",
    description: "Active Noise Cancellation reduces unwanted background noise. Adaptive Transparency lets outside sounds in while reducing loud noises. Spatial Audio.",
    price: 24900,
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1606220588913-b328bc6e6f48?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B0CHWRN4M7",
    external_rating: 4.8,
    external_review_count: "89,000+"
  },
  {
    title: "Dyson V15 Detect Extra Cordless Vacuum Cleaner",
    description: "The most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. Intelligently optimizes suction and run time.",
    price: 64900,
    category: "home-kitchen",
    image_url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B0B5P2R5CH",
    external_rating: 4.6,
    external_review_count: "6,400+"
  },
  {
    title: "Logitech MX Master 3S Wireless Mouse",
    description: "Quiet Clicks, 8K DPI Any-Surface Tracking, MagSpeed Scrolling, Ergonomic Design. Compatible with Windows, macOS, Linux.",
    price: 9999,
    category: "computers",
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B0B11NJZHC",
    external_rating: 4.8,
    external_review_count: "14,350+"
  },
  {
    title: "Hydro Flask Standard Mouth Water Bottle (24 oz)",
    description: "TempShield insulation eliminates condensation and keeps beverages cold up to 24 hours or hot up to 12 hours. Professional grade stainless steel.",
    price: 3499,
    category: "sports",
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800",
    amazon_link: "https://www.amazon.in/dp/B01KXHGWPA",
    external_rating: 4.9,
    external_review_count: "102,000+"
  }
];

async function seed() {
    const { data, error } = await supabaseAdmin.from('products').insert(newProducts);
    if (error) {
        console.error("Error seeding products:", error);
    } else {
        console.log("Successfully seeded 10 Amazon products!");
    }
}

seed();
