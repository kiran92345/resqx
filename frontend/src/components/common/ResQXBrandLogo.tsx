import React from "react";
import clsx from "clsx";
import resqxLogo from "../../assets/resqx-logo.png";
import resqxWordmark from "../../assets/resqx-wordmark.png";
import resqxIconHeader from "../../assets/resqx-icon-header.png";

export type BrandLogoVariant = "wordmark" | "icon" | "header-ref";

const SOURCES: Record<BrandLogoVariant, string> = {
  wordmark: resqxWordmark,
  icon: resqxLogo,
  /** Shield icon in white box — matches admin header reference */
  "header-ref": resqxIconHeader,
};

export function ResQXBrandLogo({
  className,
  size = "header",
  variant = "wordmark",
}: {
  className?: string;
  size?: "header" | "sidebar" | "lg";
  variant?: BrandLogoVariant;
}) {
  const heights = {
    wordmark: {
      header: "h-8 sm:h-9",
      sidebar: "h-8",
      lg: "h-12",
    },
    icon: {
      header: "h-10 sm:h-11",
      sidebar: "h-10",
      lg: "h-14",
    },
    "header-ref": {
      header: "h-10 sm:h-11",
      sidebar: "h-10",
      lg: "h-12",
    },
  }[variant];

  const wrapClass =
    variant === "header-ref"
      ? "dashboard-brand-logo-wrap dashboard-brand-logo-wrap--icon"
      : variant === "wordmark"
        ? "dashboard-brand-logo-wrap dashboard-brand-logo-wrap--wordmark"
        : "dashboard-brand-logo-wrap";

  return (
    <div className={clsx(wrapClass, className)}>
      <img
        src={SOURCES[variant]}
        alt="ResQ-X — AI Emergency Response"
        className={clsx("dashboard-brand-logo w-auto object-contain", heights[size])}
        draggable={false}
      />
    </div>
  );
}
