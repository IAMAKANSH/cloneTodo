import * as ContextMenu from '@radix-ui/react-context-menu';
import { Pencil, Trash2, Palette } from 'lucide-react';
import { listActions } from '../../stores/listStore';
import { useUIStore } from '../../stores';
import type { TaskList } from '../../types';
import { THEME_COLORS } from '../../lib/constants';

interface ListContextMenuProps {
  list: TaskList;
  children: React.ReactNode;
}

export function ListContextMenu({ list, children }: ListContextMenuProps) {
  const { setActiveView, setEditingListId } = useUIStore();

  if (list.isDefault) {
    return <>{children}</>;
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="context-menu z-50">
          <ContextMenu.Item
            className="context-menu-item"
            onSelect={() => setEditingListId(list.id)}
          >
            <Pencil size={16} />
            Rename list
          </ContextMenu.Item>

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="context-menu-item">
              <Palette size={16} />
              <span className="flex-1">Change theme</span>
              <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>&#9656;</span>
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent
                className="rounded-[var(--radius-md)] p-3 z-50"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-16)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="grid grid-cols-4 gap-2">
                  {THEME_COLORS.map((color) => (
                    <ContextMenu.Item key={color} asChild>
                      <button
                        onClick={() => listActions.updateList(list.id, { themeColor: color })}
                        className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 outline-none"
                        style={{
                          backgroundColor: color,
                          outline: list.themeColor === color ? '2px solid var(--color-text)' : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    </ContextMenu.Item>
                  ))}
                </div>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          <ContextMenu.Separator className="h-px my-1" style={{ backgroundColor: 'var(--color-divider)' }} />

          <ContextMenu.Item
            className="context-menu-item"
            style={{ color: 'var(--color-danger)' }}
            onSelect={async () => {
              await listActions.deleteList(list.id);
              setActiveView('myday');
            }}
          >
            <Trash2 size={16} />
            Delete list
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
