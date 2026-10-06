import {
  Button,
  type ButtonProps,
  Column,
  Icon,
  Row,
  Tooltip,
  TooltipTrigger,
} from '@umami/react-zen';
import { AdminNav } from '@/app/(main)/admin/AdminNav';
import { SettingsNav } from '@/app/(main)/settings/SettingsNav';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { IconLabel } from '@/components/common/IconLabel';
import Link from '@/components/common/Link';
import { OverlayScrollArea } from '@/components/common/OverlayScrollArea';
import styles from '@/components/common/OverlayScrollArea.module.css';
import { useGlobalState, useMessages, useNavigation } from '@/components/hooks';
import {
  Globe,
  Grid2x2,
  LayoutDashboard,
  LinkIcon,
  ChevronLeft,
  ChevronRight,
  PanelsLeftBottom,
} from '@/components/icons';
import { UserButton } from '@/components/input/UserButton';

export function SideNav(props: any) {
  const { t, labels } = useMessages();
  const { pathname, renderUrl, websiteId, teamId } = useNavigation();
  const [isCollapsed] = useGlobalState('sidenav-collapsed', false);

  const links = [
    ...(!teamId
      ? [
          {
            id: 'dashboard',
            label: t(labels.dashboard),
            path: '/dashboard',
            icon: <PanelsLeftBottom />,
          },
        ]
      : []),
    {
      id: 'boards',
      label: t(labels.boards),
      path: '/boards',
      icon: <LayoutDashboard />,
    },
    {
      id: 'websites',
      label: t(labels.websites),
      path: '/websites',
      icon: <Globe />,
    },
    {
      id: 'links',
      label: t(labels.links),
      path: '/links',
      icon: <LinkIcon />,
    },
    {
      id: 'pixels',
      label: t(labels.pixels),
      path: '/pixels',
      icon: <Grid2x2 />,
    },
  ];

  return (
    <Column
      {...props}
      className="chanwe-sidenav"
      data-collapsed={isCollapsed || undefined}
      backgroundColor="surface"
      border
      borderRadius
      padding="2"
      flexGrow="1"
      minHeight="0"
      margin="2"
      style={{
        // CHANWE app shell: 248px rail, 76px folded (chanwe-ui app-shell.css).
        width: isCollapsed ? '76px' : '248px',
        transition: 'width 0.2s ease-in-out',
        overflow: 'hidden',
      }}
    >
      <div className="chanwe-sidenav__head" style={{ flexShrink: 0 }}>
        {!isCollapsed && <span className="chanwe-sidenav__label">Secciones</span>}
      </div>
      <OverlayScrollArea
        className={isCollapsed ? styles.collapsed : undefined}
        style={{ flexGrow: 1, minHeight: 0 }}
      >
        {websiteId ? (
          <WebsiteNav websiteId={websiteId} isCollapsed={isCollapsed} />
        ) : pathname.includes('/settings') ? (
          <SettingsNav isCollapsed={isCollapsed} />
        ) : pathname.includes('/admin') ? (
          <AdminNav />
        ) : (
          <Column gap="2">
            {links.map(({ id, path, label, icon }) => {
              const isSelected = pathname.startsWith(renderUrl(path, false));
              const content = (
                <Row
                  tabIndex={0}
                  alignItems="center"
                  justifyContent={isCollapsed ? 'center' : undefined}
                  hover={{ backgroundColor: 'surface-sunken' }}
                  backgroundColor={isSelected ? 'surface-sunken' : undefined}
                  borderRadius
                  minHeight="9"
                >
                  <IconLabel
                    icon={icon}
                    label={isCollapsed ? '' : label}
                    weight={isSelected ? 'bold' : undefined}
                    padding
                  />
                </Row>
              );
              return (
                <Link key={id} href={renderUrl(path, false)} role="button">
                  {isCollapsed ? (
                    <TooltipTrigger delay={0}>
                      {content}
                      <Tooltip placement="right">{label}</Tooltip>
                    </TooltipTrigger>
                  ) : (
                    content
                  )}
                </Link>
              );
            })}
          </Column>
        )}
      </OverlayScrollArea>
      <Row
        paddingTop="2"
        width="100%"
        justifyContent={isCollapsed ? 'center' : undefined}
        style={{ flexShrink: 0 }}
      >
        <UserButton showText={!isCollapsed} />
      </Row>
    </Column>
  );
}

/** The kit's fold toggle: a white square on the rail's edge (App places it). */
export const PanelButton = (props: ButtonProps) => {
  const [isCollapsed, setIsCollapsed] = useGlobalState('sidenav-collapsed', false);
  return (
    <Button
      onPress={() => setIsCollapsed(!isCollapsed)}
      variant="zero"
      aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
      className="chanwe-rail-toggle"
      {...props}
    >
      <Icon size="sm">{isCollapsed ? <ChevronRight /> : <ChevronLeft />}</Icon>
    </Button>
  );
};
