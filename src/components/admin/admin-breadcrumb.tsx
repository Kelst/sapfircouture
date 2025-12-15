"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

interface BreadcrumbInfo {
  label: string;
  href?: string;
}

// Map of known routes to their labels
const routeLabels: Record<string, string> = {
  admin: "Dashboard",
  collections: "Collections",
  styles: "Styles",
  new: "New",
  edit: "Edit",
  dresses: "Dresses",
};

// Check if a string is a UUID
function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function AdminBreadcrumb() {
  const pathname = usePathname();

  // Remove locale prefix if present (e.g., /en/admin/... -> /admin/...)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, "/");
  const segments = pathWithoutLocale.split("/").filter(Boolean);

  // Build breadcrumb items with proper path tracking
  const breadcrumbs: BreadcrumbInfo[] = [];
  let collectionId: string | null = null;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const prevSegment = i > 0 ? segments[i - 1] : null;

    // Track collection ID for later use
    if (prevSegment === "collections" && isUuid(segment)) {
      collectionId = segment;
      continue; // Skip UUID from breadcrumbs
    }

    // Skip dress ID (UUID after "dresses")
    if (prevSegment === "dresses" && isUuid(segment)) {
      continue;
    }

    // Skip any other UUID
    if (isUuid(segment)) {
      continue;
    }

    // Determine the label
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    // Determine the href
    let href: string | undefined;
    const isLastSegment = i === segments.length - 1;

    if (!isLastSegment) {
      if (segment === "admin") {
        href = "/admin";
      } else if (segment === "collections") {
        href = "/admin/collections";
      } else if (segment === "styles") {
        href = "/admin/styles";
      } else if (segment === "dresses" && collectionId) {
        // "Dresses" should link back to the collection detail page
        href = `/admin/collections/${collectionId}`;
      }
    }

    breadcrumbs.push({ label, href });
  }

  // Don't show breadcrumbs if we're at the admin root
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={`${crumb.label}-${index}`}>
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
