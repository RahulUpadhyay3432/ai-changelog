"use client";

import { useRouter } from "next/navigation";
import { CategoryCard } from "./CategoryCard";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const router = useRouter();

  const handleCategoryPress = (slug: string) => {
    router.push(`/?category=${slug}`);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        padding: "0 16px 24px",
      }}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category.slug}
          category={category}
          onPress={handleCategoryPress}
        />
      ))}
    </div>
  );
}
