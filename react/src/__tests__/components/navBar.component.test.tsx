import { render, screen } from '@testing-library/react';
import { NavBar } from '../../components/navBar.component';
import { BrowserRouter } from 'react-router-dom';



describe ('NavBar', () => {
    it('should render a button saying new room', () => {
        render(<BrowserRouter><NavBar /></BrowserRouter>);

        const button = screen.getByRole('button');

        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(/new room/i);
    });
});