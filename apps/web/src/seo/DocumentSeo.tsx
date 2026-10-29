import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { syncDocumentSeo } from "./document-meta.js";
import { isIndexablePublicPath } from "./public-site.js";

/**
 * Client-navigation SEO. First document load of /app and similar paths is
 * covered by the synchronous snippet in index.html.
 */
export function DocumentSeo() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation("landing-v2");

  useEffect(() => {
    if (isIndexablePublicPath(pathname)) {
      syncDocumentSeo(pathname, {
        title: t("metaTitle"),
        description: t("metaDescription"),
      });
      return;
    }
    syncDocumentSeo(pathname);
  }, [pathname, t, i18n.language]);

  return null;
}
