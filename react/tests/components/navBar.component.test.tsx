import { it, describe, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import React from 'react'
import { NavBar } from '../../src/components/navBar.component';
import { BrowserRouter } from 'react-router-dom';



describe ('NavBar', () => {
    it('should render a button saying new room', () => {
        render(<BrowserRouter><NavBar /></BrowserRouter>);

        const button = screen.getByRole('button');

        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(/new room/i);
    });
});