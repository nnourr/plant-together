describe('Sample Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})