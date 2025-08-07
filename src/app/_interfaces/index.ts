interface NavPath {
  name: string;
  path?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children?: NavPath[];
}

export type { NavPath };
