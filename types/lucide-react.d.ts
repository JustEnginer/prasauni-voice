declare module "lucide-react" {
  import type * as React from "react";

  export type LucideProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  };

  export const ArrowLeft: (props: LucideProps) => React.ReactElement;
  export const ArrowUpRight: (props: LucideProps) => React.ReactElement;
  export const ShieldCheck: (props: LucideProps) => React.ReactElement;
}
