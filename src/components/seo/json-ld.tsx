import Script from "next/script";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sapfircouture.com";

interface OrganizationSchemaProps {
  name?: string;
  description?: string;
  logo?: string;
}

export function OrganizationSchema({
  name = "Sapfir Couture",
  description = "Premium wedding salon offering exquisite wedding dresses and bridal fashion",
  logo,
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url: baseUrl,
    logo: logo || `${baseUrl}/logo.png`,
    sameAs: [],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  address?: string;
  telephone?: string;
  email?: string;
  openingHours?: string;
}

export function LocalBusinessSchema({
  name = "Sapfir Couture",
  description = "Premium wedding salon offering exquisite wedding dresses and bridal fashion",
  address,
  telephone,
  email,
  openingHours,
}: LocalBusinessSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BridalShop",
    name,
    description,
    url: baseUrl,
    priceRange: "$$$",
  };

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: address,
    };
  }

  if (telephone) {
    schema.telephone = telephone;
  }

  if (email) {
    schema.email = email;
  }

  if (openingHours) {
    schema.openingHours = openingHours;
  }

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebSiteSchemaProps {
  name?: string;
  description?: string;
}

export function WebSiteSchema({
  name = "Sapfir Couture",
  description = "Premium wedding salon",
}: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/catalog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string[];
  url: string;
  brand?: string;
  category?: string;
}

export function ProductSchema({
  name,
  description,
  image,
  url,
  brand = "Sapfir Couture",
  category = "Wedding Dress",
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    url: `${baseUrl}${url}`,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    category,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "UAH",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      url: `${baseUrl}${url}`,
    },
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CollectionSchemaProps {
  name: string;
  description?: string;
  url: string;
  itemCount: number;
}

export function CollectionSchema({
  name,
  description,
  url,
  itemCount,
}: CollectionSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${baseUrl}${url}`,
    numberOfItems: itemCount,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: itemCount,
    },
  };

  return (
    <Script
      id="collection-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
