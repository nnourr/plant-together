import { jest } from '@jest/globals';
import { AuthService } from '../user/auth.service.js';
import { jwtDecode } from 'jwt-decode';
import * as userRepo from '../user/user.repo.js';
import type { Fireauth } from '../firebase/fireauth.repo.js';

// Explicitly type the jwt-decode mock
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

// Explicitly type the userRepo mocks
jest.mock('../user.repo', () => ({
  registerUser: jest.fn((): Promise<void> => Promise.resolve()),
  retrieveDisplayName: jest.fn((): Promise<string> => Promise.resolve("John Doe")),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let mockFireauth: jest.Mocked<Fireauth>;

  beforeEach(() => {
    // Type the Fireauth mock functions to match the interface signatures
    mockFireauth = {
      signUpWithEmailPassword: jest.fn<Promise<string>, [string, string]>(),
      loginWithEmailPassword: jest.fn<Promise<string>, [string, string]>(),
      guestToken: jest.fn<Promise<string>, []>(),
      verifyFirebaseIdToken: jest.fn<Promise<boolean>, [string]>(),
    };
    authService = new AuthService(mockFireauth);
  });

  it("should sign up a user and register them", async () => {
    const fakeToken = "fakeToken";
    // Set up the mock Fireauth behavior for signUp.
    mockFireauth.signUpWithEmailPassword.mockResolvedValue(fakeToken);
    // When jwtDecode is called, return an object with a user_id.
    (jwtDecode as jest.Mock).mockReturnValue({ user_id: "user123" });
    
    // Call the signUp method.
    const token = await authService.signUpWithEmailPassword("John Doe", "john@example.com", "password123");
    
    // Validate that the returned token is correct.
    expect(token).toBe(fakeToken);
    // Ensure the underlying Fireauth method was called with the correct email and password.
    expect(mockFireauth.signUpWithEmailPassword).toHaveBeenCalledWith("john@example.com", "password123");
    // Verify that jwtDecode was called with the fake token.
    expect(jwtDecode).toHaveBeenCalledWith(fakeToken);
    // Check that registerUser was called with the decoded user_id and provided details.
    expect(userRepo.registerUser).toHaveBeenCalledWith("user123", "John Doe", "john@example.com");
  });

  it("should log in a user and return the token", async () => {
    const fakeToken = "loginToken";
    mockFireauth.loginWithEmailPassword.mockResolvedValue(fakeToken);
    
    const token = await authService.loginWithEmailPassword("john@example.com", "password123");
    expect(token).toBe(fakeToken);
    expect(mockFireauth.loginWithEmailPassword).toHaveBeenCalledWith("john@example.com", "password123");
  });

  it("should verify a token", async () => {
    // Set up verifyFirebaseIdToken to resolve to true.
    mockFireauth.verifyFirebaseIdToken.mockResolvedValue(true);
    
    const result = await authService.verifyToken("someToken");
    expect(result).toBe(true);
    expect(mockFireauth.verifyFirebaseIdToken).toHaveBeenCalledWith("someToken");
  });

  it("should return an empty string when no token is provided for getDisplayName", async () => {
    const displayName = await authService.getDisplayName("");
    expect(displayName).toBe("");
  });
});
