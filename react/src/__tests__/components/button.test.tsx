// Button.test.tsx

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button, ButtonSize } from '../../components/button.component'

describe('Button component', () => {
    it('renders children correctly', () => {
        render(<Button size={ButtonSize.md}>Click Me</Button>)

        const buttonElement = screen.getByRole('button', { name: /click me/i })
        expect(buttonElement).toBeInTheDocument()
        expect(buttonElement).toHaveTextContent('Click Me')
    })

    it('applies the correct size class', () => {
        render(<Button size={ButtonSize.sm}>Small Button</Button>)

        const buttonElement = screen.getByRole('button', {
            name: /small button/i,
        })
        // ButtonSize.sm = "px-2 py-1 text-base font-bold"
        expect(buttonElement).toHaveClass('px-2 py-1 text-base font-bold')
    })

    it('applies the primary styling correctly when primary is true', () => {
        render(
            <Button size={ButtonSize.md} primary>
                Primary Button
            </Button>,
        )

        const buttonElement = screen.getByRole('button', {
            name: /primary button/i,
        })
        // primary = true => border-white/60
        expect(buttonElement).toHaveClass('border-white/60')
    })

    it('applies the non-primary styling when primary is false', () => {
        render(
            <Button size={ButtonSize.md} primary={false}>
                Non-Primary Button
            </Button>,
        )

        const buttonElement = screen.getByRole('button', {
            name: /non-primary button/i,
        })
        // primary = false => border-white/20
        expect(buttonElement).toHaveClass('border-white/20')
    })

    it('adds any additional className passed', () => {
        render(
            <Button size={ButtonSize.md} className='custom-class'>
                Custom Class Button
            </Button>,
        )

        const buttonElement = screen.getByRole('button', {
            name: /custom class button/i,
        })
        expect(buttonElement).toHaveClass('custom-class')
    })
})
