// FolderTree.tsx
import React from 'react';
import './styles.css';

export type FolderPath = {
  path: string;
  files: number;
  id: string;
};

type FolderNode = {
  name: string;
  files?: number;
  id?: string;
  children?: FolderNode[];
};

const buildTree = (items: FolderPath[]): FolderNode[] => {
  const root: FolderNode[] = [];

  items.forEach(({ path, files, id }) => {
    const parts = path.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      let existing = currentLevel.find(node => node.name === part);
      if (!existing) {
        existing = { name: part, children: [] };
        currentLevel.push(existing);
      }

      if (index === parts.length - 1) {
        existing.files = files;
        existing.id = id;
      }

      currentLevel = existing.children!;
    });
  });

  return root;
};



const FolderView: React.FC<{
  nodes: FolderNode[];
  onItemClick: (id: string) => void;
}> = ({ nodes, onItemClick }) => {
  return (
    <ul className="tree">
      {nodes.map((node, index) => (
        <li key={`${node.name}-${index}`}>
          <div className="tree-node">
            <div
              className={ node.id ? 'item' : '' }
              onClick={() => node.id && onItemClick(node.id)}
              style={{ cursor: node.id ? 'pointer' : 'default' }}
            >
              {node.name}
              {typeof node.files === 'number' && node.files > 0 && (
                <span style={{ marginLeft: '8px', color: '#ccc' }}>
                  <i className="bi bi-person-fill" style={{ marginRight: '4px' }}></i>
                  {node.files}
                </span>
              )}
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <FolderView nodes={node.children} onItemClick={onItemClick} />
          )}
        </li>
      ))}
    </ul>
  );
};

type Props = {
  folders: FolderPath[];
  onItemClick: (id: string) => void;
};

export const FolderTree: React.FC<Props> = ({ folders, onItemClick }) => {
  const tree = buildTree(folders);

  return (
    <ul className="tree root">
      {tree.map((node, index) => (
        <li key={`${node.name}-${index}`}>
          <div className="tree-node">
            <div
              className={ node.id ? 'item' : '' }
              onClick={() => node.id && onItemClick(node.id)}
              style={{ cursor: node.id ? 'pointer' : 'default' }}
            >
              {node.name}
              {typeof node.files === 'number' && node.files > 0 && (
                <span style={{ marginLeft: '8px', color: '#ccc' }}>
                  <i className="bi bi-person-fill" style={{ marginRight: '4px' }}></i>
                  {node.files}
                </span>
              )}
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <FolderView nodes={node.children} onItemClick={onItemClick} />
          )}
        </li>
      ))}
    </ul>
  );
};
