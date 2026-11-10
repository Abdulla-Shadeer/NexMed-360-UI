import { NavPath } from '@/types';
import Link from 'next/link';
import { PrimaryButton } from '@/components/buttons';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '_context';

export default function NavButton({ navPath }: { navPath: NavPath }) {
  const path = usePathname();

  const { workspace } = useWorkspace();
  const children = navPath.children?.filter(
    (child) => workspace && child.modes.includes(workspace.mode),
  );
  const button = (route: NavPath) => (
    <Link key={route.path} href={route.path || '#'} className="w-full">
      <PrimaryButton
        isActive={path === route.path}
        withIcon
        icon={route.icon}
        buttonText={route.name}
        onClick={() => {}}
        tw_width="w-full"
      />
    </Link>
  );
  return children ? (
    <PrimaryButton
      isActive={false}
      withIcon
      icon={navPath.icon}
      buttonText={navPath.name}
      withDropdown
      dropdownButtons={children.map(button)}
      onClick={() => {}}
      tw_width="w-full"
    />
  ) : (
    button(navPath)
  );
}
