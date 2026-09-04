"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { WooNotice, wooButtonClass, wooInputClass } from "./cart/WooUi";

/** WordPress comment form ("Trả lời") under a blog post. Client-only: submitting shows a "pending moderation" notice. */
export function PostCommentForm({ postTitle }: { postTitle: string }) {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    e.currentTarget.reset();
  };
  const label = "mb-1 block text-[16px] font-semibold leading-8 text-lien-input-text";
  return (
    <div id="respond" className="comment-respond mt-12">
      <h3 className="comment-reply-title mb-3 font-oswald text-[22px] font-light leading-[30.8px] text-lien-heading">Trả lời</h3>
      {sent ? <WooNotice kind="message">Bình luận của bạn đang chờ kiểm duyệt. Cảm ơn bạn đã chia sẻ về “{postTitle}”.</WooNotice> : null}
      <form onSubmit={onSubmit} className="comment-form">
        <p className="comment-notes mb-4 text-[14.72px] leading-[22.08px] text-lien-muted">
          Email của bạn sẽ không được hiển thị công khai. Các trường bắt buộc được đánh dấu <span className="text-[#e2401c]">*</span>
        </p>
        <p className="comment-form-comment mb-4">
          <label htmlFor="comment" className={label}>
            Bình luận <span className="text-[#e2401c]">*</span>
          </label>
          <textarea id="comment" name="comment" rows={8} required className={cn(wooInputClass, "h-auto")} />
        </p>
        <div className="flex flex-wrap gap-x-6">
          <p className="comment-form-author mb-4 flex-1 basis-[200px]">
            <label htmlFor="author" className={label}>
              Tên <span className="text-[#e2401c]">*</span>
            </label>
            <input id="author" name="author" required className={wooInputClass} />
          </p>
          <p className="comment-form-email mb-4 flex-1 basis-[200px]">
            <label htmlFor="email" className={label}>
              Email <span className="text-[#e2401c]">*</span>
            </label>
            <input id="email" name="email" type="email" required className={wooInputClass} />
          </p>
          <p className="comment-form-url mb-4 flex-1 basis-[200px]">
            <label htmlFor="url" className={label}>
              Trang web
            </label>
            <input id="url" name="url" type="url" className={wooInputClass} />
          </p>
        </div>
        <p className="comment-form-cookies-consent mb-4 flex items-center gap-2 text-[14.72px]">
          <input id="wp-comment-cookies-consent" name="wp-comment-cookies-consent" type="checkbox" className="h-4 w-4" />
          <label htmlFor="wp-comment-cookies-consent">Lưu tên của tôi, email, và trang web trong trình duyệt này cho lần bình luận kế tiếp của tôi.</label>
        </p>
        <p className="form-submit">
          <button type="submit" className={cn(wooButtonClass, "font-arial")}>
            Phản hồi
          </button>
        </p>
      </form>
    </div>
  );
}
