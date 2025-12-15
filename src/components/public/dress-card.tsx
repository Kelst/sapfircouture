"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface DressCardProps {
  id: string;
  name: string;
  slug: string;
  image?: string;
  category?: string;
  isPopular?: boolean;
}

export function DressCard({
  name,
  slug,
  image,
  category,
  isPopular,
}: DressCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/catalog/${slug}`}>
        <Card className="overflow-hidden cursor-pointer group">
          <div className="relative aspect-[3/4] bg-muted">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}
            {isPopular && (
              <Badge className="absolute top-2 right-2">Popular</Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate">{name}</h3>
            {category && (
              <p className="text-sm text-muted-foreground">{category}</p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
