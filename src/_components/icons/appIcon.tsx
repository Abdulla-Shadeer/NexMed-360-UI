interface IconProps {
  color?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export const AppIcon = ({
  color = 'currentColor',
  icon: Icon,
  width = 24,
  height = 24,
  strokeWidth = 1.5,
}: IconProps) => {
  return (
    <Icon
      height={height}
      width={width}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
    />
  );
};
