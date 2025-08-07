import { NavPath } from '@/app_interfaces';
import Link from 'next/link';
import { PrimaryButton } from '@/components/buttons';

interface NavButtonProps {
  navPath: NavPath;
  activeBtn: string;
  callback: (btnId: string) => void;
}

export default function NavButton({
  navPath,
  activeBtn,
  callback,
}: NavButtonProps) {
  return navPath.children && navPath.children.length > 0 ? (
    <PrimaryButton
      isActive={false}
      withIcon={true}
      icon={navPath.icon}
      buttonText={navPath.name}
      withDropdown={true}
      dropdownButtons={navPath.children.map((childPath) => (
        <Link
          key={`${navPath.name}-${childPath.name}`}
          href={childPath.path || '#'}
        >
          <PrimaryButton
            isActive={activeBtn === childPath.path}
            withIcon={true}
            icon={childPath.icon}
            buttonText={childPath.name}
            onClick={() => callback(childPath.path || '')}
          />
        </Link>
      ))}
      onClick={
        () => {} // Dropdowns never going to be active
      }
    />
  ) : (
    <Link href={navPath.path || '#'}>
      <PrimaryButton
        isActive={activeBtn === navPath.path}
        withIcon={true}
        icon={navPath.icon}
        buttonText={navPath.name}
        onClick={() => callback(navPath.path || '')}
      />
    </Link>
  );
}
