import { Fa } from "@/components/sites/lienstore/shared/icons";

interface ProductShareProps {
  name: string;
  slug: string;
}

/** Sassy Social Share row (Facebook Like / Share) under the product meta. */
export function ProductShare({ name, slug }: ProductShareProps) {
  const url = `https://linconnn.io.vn/product/${slug}/`;
  const share = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  return (
    <div className="heateor_sss_sharing_container mt-2 flex items-center gap-2 text-[12.8px] font-bold leading-[19px]">
      <a
        href={share}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-[20px] items-center gap-1 rounded-[3px] bg-[#1877f2] px-2 text-white no-underline hover:bg-[#166fe5]"
        aria-label={`Thích ${name} trên Facebook`}
      >
        <Fa name="facebook" className="text-[12px]" /> Like
      </a>
      <a
        href={share}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-[20px] items-center gap-1 rounded-[3px] bg-[#1877f2] px-2 text-white no-underline hover:bg-[#166fe5]"
        aria-label={`Chia sẻ ${name} lên Facebook`}
      >
        <Fa name="facebook" className="text-[12px]" /> Share
      </a>
    </div>
  );
}
