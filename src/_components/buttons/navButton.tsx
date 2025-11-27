import { NavPath } from '@/types';
import Link from 'next/link';
import { PrimaryButton } from '@/components/buttons';
import { usePathname } from 'next/navigation';

interface NavButtonProps {
  navPath: NavPath;
  userRoles: string[];
}

export default function NavButton({ navPath, userRoles }: NavButtonProps) {
  const path = usePathname();

  return navPath.children && navPath.children.length > 0 ? (
    <PrimaryButton
      isActive={false}
      withIcon={true}
      icon={navPath.icon}
      buttonText={navPath.name}
      withDropdown={true}
      dropdownButtons={navPath.children.map((childPath) =>
        userRoles.some((role) => childPath.roles.includes(role, 0)) ? (
          <Link
            key={`${navPath.name}-${childPath.name}`}
            href={childPath.path || '#'}
            className="w-full"
          >
            <PrimaryButton
              isActive={path === childPath.path}
              withIcon={true}
              icon={childPath.icon}
              buttonText={childPath.name}
              onClick={() => {}}
              tw_width="w-full"
            />
          </Link>
        ) : (
          <></>
        ),
      )}
      onClick={() => {}}
      tw_width="w-full"
    />
  ) : (
    <Link href={navPath.path || '#'} className="w-full">
      <PrimaryButton
        isActive={path === navPath.path}
        withIcon={true}
        icon={navPath.icon}
        buttonText={navPath.name}
        onClick={() => {}}
        tw_width="w-full"
      />
    </Link>
  );
}
