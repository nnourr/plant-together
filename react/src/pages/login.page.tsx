import type React from "react"

import { useState, useContext } from "react"
import { Button, ButtonSize } from "../components/button.component"
import { InputField } from "../components/inputField.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/user.context";

import { 
    failedCreateSession, 
    loginGuestUser,
    loginUser
} from "../utils/auth.helpers.ts";

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    const DEFAULT_ERROR_MESSAGE = "Error occurred while logging in. Please try again later.";

    const handleLogin = async (email: string, password: string) => {
        if (!email || !password) {
            setError("Please fill missing fields");
            return;
        }
        
        try {
            await loginUser(email, password, userContext);
        } catch (error: any) {
            await failedCreateSession(error.message || DEFAULT_ERROR_MESSAGE, setError, userContext);
            return;
        }

        setError("");
        navigate("/");
    };

    const handleGuest = async () => {
        try {
            await loginGuestUser(userContext);
        } catch(error: any) {
            await failedCreateSession(error.message || DEFAULT_ERROR_MESSAGE, setError, userContext);
            return;
        }

        setError("");
        navigate("/");
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 text-4xl font-bold mb-2">
                        <FontAwesomeIcon
                            icon={faSeedling}
                            className="hidden lg:inline"
                        />
                        <h1>Plant Together.</h1>
                    </div>
                </div>

                <div className="bg-[#1a2234] border-0 shadow-lg rounded-md">
                    <h1 className="px-12 py-10">
                        <div className="text-2xl text-center">Log In</div>
                    </h1>
                    <div className="px-12 pb-12">
                        {error && (
                            <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                                <InputField
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full text-lg px-3 py-2 bg-slate-900 border-white/20 rounded-md"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                                <InputField
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full text-lg px-3 py-2 bg-slate-900 border-white/20 rounded-md"
                                    autoComplete="current-password"
                                />
                            </div>

                            <Button size={ButtonSize.lg} onClick={() => handleLogin(email, password)} className="w-full bg-green-600 hover:bg-green-700 rounded-md" primary>
                                Log In
                            </Button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-600" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#1a2234] px-2 text-xs text-gray-400">OR</span>
                                </div>
                            </div>

                            <Button size={ButtonSize.lg}
                                className="w-full hover:bg-green-600/10 rounded-md"
                                onClick={handleGuest}
                            >
                                Continue as Guest
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-400">
                            Don't have an account?{" "}
                            <a onClick={() => navigate('/signup')} className="text-green-500 hover:underline cursor-pointer">
                                Sign Up
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

