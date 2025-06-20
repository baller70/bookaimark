/// <reference types="jest" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import TimelineClusterView from '../components/TimelineClusterView';
import { FolderContainer } from '../types';

const mockFolder: FolderContainer = {
  id: 'folder1',
  name: 'My Folder',
  items: [],
};

describe('TimelineClusterView component', () => {
  it('renders folder name and wireframe placeholders', () => {
    render(<TimelineClusterView folder={mockFolder} />);

    // Folder name appears twice (wireframe + live pane)
    const titles = screen.getAllByText(/My Folder/);
    expect(titles.length).toBe(2);

    // Expect 10 placeholder slots in wireframe view
    const placeholders = screen.getAllByText((content, node) => {
      return !!node?.classList.contains('text-gray-400');
    });
    expect(placeholders.length).toBe(10);
  });
});