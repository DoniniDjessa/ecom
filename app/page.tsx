"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import ProductSection from "@/components/ProductSection";
import SocialSection from "@/components/SocialSection";

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [others, setOthers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHomeProducts() {
      // Fetch Bestsellers
      const { data: bData } = await supabase
        .from("ecom-products")
        .select("*")
        .eq("is_bestseller", true)
        .limit(8);

      // Fetch New Arrivals
      const { data: nData } = await supabase
        .from("ecom-products")
        .select("*")
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(8);

      // Fetch Others (Not Best, Not New)
      const { data: oData } = await supabase
        .from("ecom-products")
        .select("*")
        .eq("is_bestseller", false)
        .eq("is_new", false)
        .limit(4);

      const mapProduct = (p: any) => ({
        id: p.id,
        name: p.name,
        nameFr: p.name_fr || p.name || "Produit Bling Store",
        price: p.price,
        category: p.category,
        image: p.images?.[0] || "/images/placeholder.jpg",
        badge: p.badge,
        isBestseller: p.is_bestseller,
        isNew: p.is_new,
        stock_qty: p.stock_qty,
      });

      if (bData) setBestsellers(bData.map(mapProduct));
      if (nData) setNewArrivals(nData.map(mapProduct));
      if (oData) setOthers(oData.map(mapProduct));
    }

    fetchHomeProducts();
  }, []);

  return (
    <>
      <HeroSection />
      <CategoryGrid />

      {bestsellers.length > 0 && (
        <ProductSection
          id="bestsellers"
          title="Mood & Tendance"
          subtitle="Nos articles préférés par la communauté"
          products={bestsellers}
          layout="scroll"
        />
      )}

      <div style={{ background: "var(--white)" }}>
        {newArrivals.length > 0 && (
          <ProductSection
            id="new-arrivals"
            title="Nouveaux Produits"
            subtitle="Les dernières tendances Hair & Fashion"
            products={newArrivals}
            layout="scroll"
          />
        )}
      </div>

      {others.length > 0 && (
        <ProductSection
          id="more-styles"
          title="Mood & Styles"
          subtitle="Une sélection variée pour tous les goûts"
          products={others}
          viewAllHref="/tous-les-produits"
          layout="grid"
        />
      )}

      <SocialSection />
    </>
  );
}
