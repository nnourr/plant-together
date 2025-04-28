import { render, screen, fireEvent } from '@testing-library/react'
import { InputField } from '../../components/inputField.component' // Adjust the import path as necessary

describe('InputField Component', () => {
  test('renders without crashing', () => {
    render(<InputField />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('displays the correct title', () => {
    render(<InputField title='Username' />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  test('renders input with given placeholder', () => {
    render(<InputField placeholder='Enter text here' />)
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  test('updates value on user input', () => {
    render(<InputField />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Hello' } })
    expect(input).toHaveValue('Hello')
  })

  test('applies additional props correctly', () => {
    render(<InputField type='password' title='Password' />)
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    )
  })

  test('associates label with input field', () => {
    render(<InputField title='Email' id='email-field' />)
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-field')
  })
})
