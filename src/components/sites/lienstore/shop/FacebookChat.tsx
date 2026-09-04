"use client";

import { useEffect } from "react";

/**
 * Facebook Messenger customer chat plugin (the original loads it for page 100282411711448).
 * Only rendered when NEXT_PUBLIC_FB_PAGE_ID is set, so the clone does not call Facebook by default.
 */
export function FacebookChat({ pageId }: { pageId: string }) {
  useEffect(() => {
    if (!pageId || document.getElementById("facebook-jssdk")) return;
    const root = document.createElement("div");
    root.id = "fb-root";
    document.body.appendChild(root);
    const chat = document.createElement("div");
    chat.className = "fb-customerchat";
    chat.setAttribute("attribution", "setup_tool");
    chat.setAttribute("page_id", pageId);
    document.body.appendChild(chat);
    const s = document.createElement("script");
    s.id = "facebook-jssdk";
    s.async = true;
    s.defer = true;
    s.src = "https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js#xfbml=1&version=v18.0";
    document.body.appendChild(s);
  }, [pageId]);
  return null;
}
