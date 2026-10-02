// The CHANWE wordmark plus the product name, in place of Umami's logo. The
// SVGs are copies of chanwe-ui brand/logos (brand-sync keeps them current).
// tone "auto" draws the ink wordmark and swaps to white on the dark theme;
// tone "inverse" is for dark surfaces such as the sidebar rail.
export function ChanweBrand({ tone = 'auto' }: { tone?: 'auto' | 'inverse' }) {
  const base = `${process.env.basePath || ''}/brand/logos`;

  return (
    <span className="chanwe-brand" data-tone={tone}>
      <img
        className="chanwe-brand__logo chanwe-brand__logo--ink"
        src={`${base}/chanwe-logo-black.svg`}
        alt="CHANWE"
        width={88}
        height={18}
      />
      <img
        className="chanwe-brand__logo chanwe-brand__logo--white"
        src={`${base}/chanwe-logo-white.svg`}
        alt="CHANWE"
        width={88}
        height={18}
      />
      <i aria-hidden="true" />
      <span className="chanwe-brand__product">Analytics</span>
    </span>
  );
}
